/**
 * ============================================================
 * SMART CLASS REMINDER — Cloud Function (Scheduled)
 * ============================================================
 * 
 * Runs every 15 minutes during class hours (8 AM - 5 PM IST).
 * Checks each student's upcoming classes and sends AI-generated
 * contextual reminders 30 minutes before each class.
 * 
 * DEPLOYMENT:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login: firebase login
 * 3. Init functions: firebase init functions
 * 4. Copy this file to functions/src/classReminderCheck.ts
 * 5. Deploy: firebase deploy --only functions
 * 
 * REQUIRES: Firebase Blaze (pay-as-you-go) plan
 * ============================================================
 */

// import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// const db = admin.firestore();

// ============================================================
// TYPES
// ============================================================
interface ClassInfo {
  name: string;
  startTime: string;
  location: string;
  instructor: string;
  type: string;
}

interface StudentInfo {
  uid: string;
  name: string;
  fcmToken?: string;
  section: string;
  attendance: Record<string, { attended: number; total: number; percentage: number }>;
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Parse time string (e.g., "09:30 AM") to Date object for today
 */
function parseTime(timeStr: string): Date {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) hour24 += 12;
  if (period === 'AM' && hours === 12) hour24 = 0;
  
  const date = new Date();
  date.setHours(hour24, minutes, 0, 0);
  return date;
}

/**
 * Get urgency level based on attendance
 */
function getUrgency(percentage: number): 'urgent' | 'high' | 'medium' | 'low' {
  if (percentage < 60) return 'urgent';
  if (percentage < 75) return 'high';
  if (percentage < 85) return 'medium';
  return 'low';
}

/**
 * Generate reminder message (fallback without AI)
 */
function generateFallbackReminder(
  studentName: string,
  classInfo: ClassInfo,
  minutesUntil: number,
  attendance: number,
): { title: string; body: string } {
  const urgency = getUrgency(attendance);

  switch (urgency) {
    case 'urgent':
      return {
        title: `🚨 ${classInfo.name} — You NEED This!`,
        body: `${studentName}, your attendance is ${attendance}%. ${classInfo.startTime} at ${classInfo.location}. Every class counts!`,
      };
    case 'high':
      return {
        title: `⚠️ ${classInfo.name} in ${minutesUntil}min`,
        body: `Attendance: ${attendance}%. Show up to stay safe. ${classInfo.location}.`,
      };
    case 'medium':
      return {
        title: `📚 ${classInfo.name} Starting Soon`,
        body: `${classInfo.startTime} • ${classInfo.location}. One step closer to a great semester!`,
      };
    case 'low':
      return {
        title: `✨ ${classInfo.name} Coming Up`,
        body: `${classInfo.startTime} at ${classInfo.location}. Keep the great streak going!`,
      };
  }
}

// ============================================================
// CLOUD FUNCTION (uncomment when deploying)
// ============================================================

/*
export const smartClassReminder = functions.pubsub
  .schedule('every 15 minutes')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const now = new Date();
    const currentHour = now.getHours();

    // Only run during class hours (8 AM - 5 PM)
    if (currentHour < 8 || currentHour >= 17) {
      console.log('⏰ Outside class hours, skipping...');
      return null;
    }

    const dayIndex = now.getDay() - 1; // Mon=0, Fri=4
    if (dayIndex < 0 || dayIndex > 4) {
      console.log('🗓️ Weekend, skipping...');
      return null;
    }

    console.log('🔔 Starting smart class reminder check...');

    try {
      // 1. Get all enrolled students
      const studentsSnapshot = await db.collection('users')
        .where('role', '==', 'student')
        .where('onboardingComplete', '==', true)
        .get();

      // 2. Get schedule from Firestore (or use hardcoded)
      // const scheduleDoc = await db.collection('config').doc('timetable').get();
      // const schedule = scheduleDoc.data();

      let remindersSent = 0;

      for (const studentDoc of studentsSnapshot.docs) {
        const student = studentDoc.data() as StudentInfo;
        if (!student.fcmToken) continue;

        const section = student.section || 'Section 1';
        
        // 3. Get today's schedule for student's section
        // const todaySchedule = schedule[section][dayIndex] || [];
        const todaySchedule: ClassInfo[] = []; // Replace with actual schedule lookup

        for (const classInfo of todaySchedule) {
          if (classInfo.type === 'Break') continue;

          const classTime = parseTime(classInfo.startTime);
          const diffMs = classTime.getTime() - now.getTime();
          const diffMinutes = Math.floor(diffMs / 60000);

          // Send reminder 25-35 minutes before class
          if (diffMinutes >= 25 && diffMinutes <= 35) {
            // 4. Check if reminder already sent today
            const reminderKey = `${studentDoc.id}_${classInfo.name}_${now.toDateString()}`;
            const existingReminder = await db.collection('sent_reminders').doc(reminderKey).get();
            if (existingReminder.exists) continue;

            // 5. Get student's attendance for this subject
            const attendanceSnapshot = await db.collection('attendance')
              .where('studentId', '==', studentDoc.id)
              .where('courseName', '==', classInfo.name)
              .get();

            let attendancePercentage = 100;
            if (!attendanceSnapshot.empty) {
              const data = attendanceSnapshot.docs[0].data();
              attendancePercentage = data.total > 0 ? (data.attended / data.total) * 100 : 100;
            }

            // 6. Generate reminder
            const reminder = generateFallbackReminder(
              student.name,
              classInfo,
              diffMinutes,
              attendancePercentage,
            );

            // 7. Send FCM push notification
            await admin.messaging().send({
              token: student.fcmToken,
              notification: {
                title: reminder.title,
                body: reminder.body,
              },
              data: {
                type: 'class_reminder',
                subjectName: classInfo.name,
                classTime: classInfo.startTime,
                location: classInfo.location,
                urgency: getUrgency(attendancePercentage),
              },
              webpush: {
                fcmOptions: {
                  link: '/schedule',
                },
              },
            });

            // 8. Store notification in Firestore
            await db.collection('notifications').add({
              userId: studentDoc.id,
              ...reminder,
              type: 'class_reminder',
              priority: getUrgency(attendancePercentage),
              subjectName: classInfo.name,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              read: false,
              deepLink: '/schedule',
            });

            // 9. Mark reminder as sent
            await db.collection('sent_reminders').doc(reminderKey).set({
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            remindersSent++;
          }
        }
      }

      console.log(`✅ Smart reminders sent: ${remindersSent}`);
      return null;
    } catch (error) {
      console.error('❌ Smart reminder failed:', error);
      throw error;
    }
  });
*/

// ============================================================
// LOCAL EXPORTS (for client-side simulation)
// ============================================================
export { parseTime, getUrgency, generateFallbackReminder };
export type { ClassInfo, StudentInfo };
