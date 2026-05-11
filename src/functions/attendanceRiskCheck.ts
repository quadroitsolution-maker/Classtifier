/**
 * ============================================================
 * ATTENDANCE RISK CHECK — Cloud Function (Scheduled)
 * ============================================================
 * 
 * This file contains the Firebase Cloud Function that runs 
 * daily at 8 PM IST to check all students' attendance risk.
 * 
 * DEPLOYMENT:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login: firebase login
 * 3. Init functions: firebase init functions
 * 4. Copy this file to functions/src/attendanceRiskCheck.ts
 * 5. Deploy: firebase deploy --only functions
 * 
 * REQUIRES: Firebase Blaze (pay-as-you-go) plan
 * ============================================================
 */

// import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';

// admin.initializeApp();
// const db = admin.firestore();

/**
 * Risk classification thresholds
 */
const SAFE_THRESHOLD = 75;
const WARNING_THRESHOLD = 60;
const TOTAL_SEMESTER_CLASSES = 50;
const REQUIRED_ATTENDANCE = 75;

type RiskLevel = 'safe' | 'warning' | 'critical';

interface StudentAttendance {
  courseId: string;
  courseName: string;
  attended: number;
  total: number;
  percentage: number;
}

interface RiskResult {
  riskLevel: RiskLevel;
  riskScore: number;
  coursesAtRisk: Array<{
    courseName: string;
    percentage: number;
    classesNeeded: number;
    recoverable: boolean;
  }>;
}

/**
 * Classify risk level
 */
function classifyRisk(percentage: number): RiskLevel {
  if (percentage >= SAFE_THRESHOLD) return 'safe';
  if (percentage >= WARNING_THRESHOLD) return 'warning';
  return 'critical';
}

/**
 * Calculate risk score (0-100, higher = worse)
 */
function calculateRiskScore(percentage: number): number {
  if (percentage >= 90) return 0;
  if (percentage >= SAFE_THRESHOLD) return Math.round((90 - percentage) * 2);
  if (percentage >= WARNING_THRESHOLD) return Math.round(30 + (SAFE_THRESHOLD - percentage) * (40 / 15));
  return Math.round(70 + (WARNING_THRESHOLD - percentage) * (30 / 20));
}

/**
 * Calculate classes needed to reach 75%
 */
function classesNeeded(attended: number, total: number): number {
  const remaining = TOTAL_SEMESTER_CLASSES - total;
  const needed = Math.ceil(REQUIRED_ATTENDANCE / 100 * TOTAL_SEMESTER_CLASSES) - attended;
  return Math.max(0, Math.min(needed, remaining));
}

/**
 * Check if recovery is possible
 */
function isRecoverable(attended: number, total: number): boolean {
  const remaining = TOTAL_SEMESTER_CLASSES - total;
  return classesNeeded(attended, total) <= remaining;
}

/**
 * Assess a student's overall risk
 */
function assessStudentRisk(courses: StudentAttendance[]): RiskResult {
  const totalAttended = courses.reduce((s, c) => s + c.attended, 0);
  const totalClasses = courses.reduce((s, c) => s + c.total, 0);
  const overallPercentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 100;

  const riskLevel = classifyRisk(overallPercentage);
  const riskScore = calculateRiskScore(overallPercentage);

  const coursesAtRisk = courses
    .filter(c => c.percentage < SAFE_THRESHOLD)
    .map(c => ({
      courseName: c.courseName,
      percentage: c.percentage,
      classesNeeded: classesNeeded(c.attended, c.total),
      recoverable: isRecoverable(c.attended, c.total),
    }));

  return { riskLevel, riskScore, coursesAtRisk };
}

/**
 * Generate notification message based on risk level
 */
function generateNotificationMessage(name: string, risk: RiskResult): { title: string; body: string } {
  switch (risk.riskLevel) {
    case 'critical':
      return {
        title: '🚨 Attendance Critical Alert',
        body: `${name}, ${risk.coursesAtRisk.length} subject${risk.coursesAtRisk.length > 1 ? 's are' : ' is'} below 60%. Immediate action needed to avoid debarment.`,
      };
    case 'warning':
      return {
        title: '⚠️ Attendance Warning',
        body: `${name}, ${risk.coursesAtRisk.length} subject${risk.coursesAtRisk.length > 1 ? 's need' : ' needs'} attention. Stay consistent to maintain 75%.`,
      };
    default:
      return {
        title: '✅ Attendance On Track',
        body: `Great work, ${name}! All subjects are above 75%. Keep it up!`,
      };
  }
}

// ============================================================
// FIREBASE CLOUD FUNCTION (uncomment when deploying)
// ============================================================

/*
export const dailyAttendanceRiskCheck = functions.pubsub
  .schedule('0 20 * * *')  // Every day at 8:00 PM
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    console.log('🔄 Starting daily attendance risk check...');

    try {
      // 1. Get all students
      const studentsSnapshot = await db.collection('users')
        .where('role', '==', 'student')
        .where('onboardingComplete', '==', true)
        .get();

      console.log(`📊 Found ${studentsSnapshot.size} students to check`);

      let processed = 0;
      let atRisk = 0;

      for (const studentDoc of studentsSnapshot.docs) {
        const student = studentDoc.data();

        // 2. Get student's attendance records
        const attendanceSnapshot = await db.collection('attendance')
          .where('studentId', '==', studentDoc.id)
          .get();

        const courses: StudentAttendance[] = attendanceSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            courseId: data.courseId,
            courseName: data.courseName,
            attended: data.attended,
            total: data.total,
            percentage: data.total > 0 ? (data.attended / data.total) * 100 : 100,
          };
        });

        if (courses.length === 0) continue;

        // 3. Assess risk
        const risk = assessStudentRisk(courses);

        // 4. Store risk data in Firestore
        await db.collection('users').doc(studentDoc.id).update({
          risk_flag: risk.riskLevel,
          risk_score: risk.riskScore,
          risk_updated: admin.firestore.FieldValue.serverTimestamp(),
          risk_data: {
            coursesAtRisk: risk.coursesAtRisk,
            assessedAt: new Date().toISOString(),
          },
        });

        // 5. Send notification if at risk
        if (risk.riskLevel !== 'safe' && student.fcmToken) {
          const notification = generateNotificationMessage(student.name, risk);

          await admin.messaging().send({
            token: student.fcmToken,
            notification: {
              title: notification.title,
              body: notification.body,
            },
            data: {
              type: 'risk_alert',
              riskLevel: risk.riskLevel,
              riskScore: risk.riskScore.toString(),
            },
            webpush: {
              fcmOptions: {
                link: '/recovery-plan',
              },
            },
          });

          atRisk++;
        }

        processed++;
      }

      console.log(`✅ Risk check complete: ${processed} processed, ${atRisk} at risk`);
      return null;
    } catch (error) {
      console.error('❌ Risk check failed:', error);
      throw error;
    }
  });
*/

// ============================================================
// LOCAL SIMULATION (for testing without Cloud Functions)
// ============================================================
export const simulateRiskCheck = (courses: StudentAttendance[]): RiskResult => {
  return assessStudentRisk(courses);
};

export const getNotificationForRisk = (name: string, risk: RiskResult) => {
  return generateNotificationMessage(name, risk);
};

export type { StudentAttendance, RiskResult, RiskLevel };
