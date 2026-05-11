import { getGeminiResponse } from './geminiService';
import { MOCK_ATTENDANCE } from '../constants/mockData';
import { WEEKLY_SCHEDULE, ScheduleEntry } from '../constants/timetable';
import { classifyRisk, getRiskLabel, RiskLevel } from './riskService';

// ====================================
// Smart Notification Types
// ====================================
export type NotificationType = 'class_reminder' | 'risk_alert' | 'attendance_update' | 'achievement' | 'system' | 'ai_tip';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SmartNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  icon: string;
  color: string;
  deepLink?: string;
  subjectName?: string;
  metadata?: Record<string, string>;
}

// ====================================
// Reminder Urgency Analyzer
// ====================================
const getSubjectAttendance = (subjectName: string) => {
  const normalizedName = subjectName.toLowerCase();
  return MOCK_ATTENDANCE.find(a =>
    a.courseName.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(a.courseName.toLowerCase().split(' ')[0])
  );
};

const getUrgencyLevel = (subjectName: string): { level: NotificationPriority; riskLevel: RiskLevel; percentage: number } => {
  const attendance = getSubjectAttendance(subjectName);
  if (!attendance) return { level: 'low', riskLevel: 'safe', percentage: 100 };
  
  const riskLevel = classifyRisk(attendance.percentage);
  const level: NotificationPriority = riskLevel === 'critical' ? 'urgent' : riskLevel === 'warning' ? 'high' : 'low';
  return { level, riskLevel, percentage: attendance.percentage };
};

// ====================================
// AI Reminder Generation
// ====================================
export const generateSmartReminder = async (
  studentName: string,
  classEntry: ScheduleEntry,
  minutesUntilClass: number,
): Promise<{ title: string; body: string; priority: NotificationPriority }> => {
  const urgency = getUrgencyLevel(classEntry.name);
  
  const toneMap = {
    urgent: 'URGENT and serious — this student is at risk of failing attendance. Be direct but supportive.',
    high: 'firm but encouraging — attendance needs attention. Emphasize importance.',
    medium: 'friendly and motivating — a gentle reminder with positive energy.',
    low: 'casual and cheerful — everything is great, just a friendly nudge.',
  };

  const prompt = `Generate a class reminder notification for a college student.

STUDENT: ${studentName}
SUBJECT: ${classEntry.name}
TIME: ${classEntry.startTime}
LOCATION: ${classEntry.location}
INSTRUCTOR: ${classEntry.instructor || 'TBD'}
MINUTES UNTIL CLASS: ${minutesUntilClass}
CURRENT ATTENDANCE: ${urgency.percentage}% (${getRiskLabel(urgency.riskLevel)})

TONE: ${toneMap[urgency.level]}

RULES:
- Generate TWO fields: title (under 8 words) and body (under 20 words)
- Use 1 emoji in the title
- ${urgency.riskLevel === 'critical' ? 'Mention that this class is crucial for their attendance' : ''}
- ${urgency.riskLevel === 'warning' ? 'Gently mention attendance needs improvement' : ''}
- ${urgency.riskLevel === 'safe' ? 'Keep it light and motivational' : ''}
- Include the time or location naturally
- Sound like a smart assistant, not a school admin

FORMAT your response EXACTLY like this (no other text):
TITLE: [your title here]
BODY: [your body here]`;

  try {
    const response = await getGeminiResponse(prompt, []);
    const titleMatch = response.match(/TITLE:\s*(.+)/i);
    const bodyMatch = response.match(/BODY:\s*(.+)/i);
    
    return {
      title: titleMatch?.[1]?.trim() || `📚 ${classEntry.name} in ${minutesUntilClass}min`,
      body: bodyMatch?.[1]?.trim() || `${classEntry.startTime} at ${classEntry.location}. Don't miss it!`,
      priority: urgency.level,
    };
  } catch {
    // Fallback messages by urgency
    const fallbacks = {
      urgent: {
        title: `🚨 ${classEntry.name} — Don't Skip!`,
        body: `Your attendance is at ${urgency.percentage}%. This class matters. ${classEntry.startTime} at ${classEntry.location}.`,
      },
      high: {
        title: `⚠️ ${classEntry.name} in ${minutesUntilClass}min`,
        body: `Attendance is ${urgency.percentage}%. Show up and stay safe. ${classEntry.location}.`,
      },
      medium: {
        title: `📚 ${classEntry.name} Soon`,
        body: `Starts at ${classEntry.startTime} in ${classEntry.location}. See you there!`,
      },
      low: {
        title: `✨ ${classEntry.name} Coming Up`,
        body: `${classEntry.startTime} • ${classEntry.location}. Keep the streak going!`,
      },
    };
    return { ...fallbacks[urgency.level], priority: urgency.level };
  }
};

// ====================================
// Notification Factory
// ====================================
const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const createClassReminder = (
  title: string,
  body: string,
  priority: NotificationPriority,
  subjectName: string,
  classTime: string,
): SmartNotification => {
  const colorMap: Record<NotificationPriority, string> = {
    urgent: '#EF4444',
    high: '#F59E0B',
    medium: '#6366F1',
    low: '#10B981',
  };

  return {
    id: generateId(),
    title,
    body,
    type: 'class_reminder',
    priority,
    timestamp: new Date(),
    read: false,
    icon: priority === 'urgent' ? '🚨' : priority === 'high' ? '⚠️' : '📚',
    color: colorMap[priority],
    deepLink: '/schedule',
    subjectName,
    metadata: { classTime },
  };
};

export const createRiskAlert = (subjectName: string, percentage: number, riskLevel: RiskLevel): SmartNotification => ({
  id: generateId(),
  title: riskLevel === 'critical' ? `🚨 ${subjectName} Critical` : `⚠️ ${subjectName} Warning`,
  body: `Attendance at ${percentage}%. ${riskLevel === 'critical' ? 'Immediate action needed.' : 'Stay consistent to recover.'}`,
  type: 'risk_alert',
  priority: riskLevel === 'critical' ? 'urgent' : 'high',
  timestamp: new Date(),
  read: false,
  icon: riskLevel === 'critical' ? '🚨' : '⚠️',
  color: riskLevel === 'critical' ? '#EF4444' : '#F59E0B',
  deepLink: '/recovery-plan',
  subjectName,
  metadata: { percentage: percentage.toString(), riskLevel },
});

export const createAchievement = (title: string, body: string): SmartNotification => ({
  id: generateId(),
  title: `🏆 ${title}`,
  body,
  type: 'achievement',
  priority: 'low',
  timestamp: new Date(),
  read: false,
  icon: '🏆',
  color: '#10B981',
});

export const createAiTip = (tip: string): SmartNotification => ({
  id: generateId(),
  title: '💡 AI Study Tip',
  body: tip,
  type: 'ai_tip',
  priority: 'low',
  timestamp: new Date(),
  read: false,
  icon: '💡',
  color: '#A78BFA',
  deepLink: '/chat',
});

// ====================================
// Schedule Scanner — finds upcoming classes
// ====================================
export const getUpcomingClasses = (section: string = 'Section 1'): ScheduleEntry[] => {
  const now = new Date();
  const dayIndex = Math.max(0, Math.min(4, now.getDay() - 1)); // Mon=0 to Fri=4
  const schedule = WEEKLY_SCHEDULE[section]?.[dayIndex] || [];
  
  return schedule.filter(entry => {
    if (entry.type === 'Break') return false;
    // Parse start time
    const [time, period] = entry.startTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    
    const classTime = new Date();
    classTime.setHours(hour24, minutes, 0, 0);
    
    // Return classes that haven't started yet
    return classTime > now;
  });
};

// ====================================
// Generate Demo Notifications
// ====================================
export const generateDemoNotifications = (): SmartNotification[] => {
  const now = new Date();
  const notifications: SmartNotification[] = [];

  // Class reminders
  notifications.push({
    id: generateId(),
    title: '📚 Cloud Foundations in 30min',
    body: 'Starts at 09:30 AM in Room 102. Your attendance is 88% — keep it going!',
    type: 'class_reminder',
    priority: 'low',
    timestamp: new Date(now.getTime() - 5 * 60000),
    read: false,
    icon: '📚',
    color: '#6366F1',
    deepLink: '/schedule',
    subjectName: 'Cloud Foundations',
  });

  notifications.push({
    id: generateId(),
    title: '🚨 Data Structures — Don\'t Skip!',
    body: 'Your attendance is at 52%. This class is critical. 11:45 AM at Lab 103.',
    type: 'class_reminder',
    priority: 'urgent',
    timestamp: new Date(now.getTime() - 15 * 60000),
    read: false,
    icon: '🚨',
    color: '#EF4444',
    deepLink: '/schedule',
    subjectName: 'Data Structures',
  });

  notifications.push({
    id: generateId(),
    title: '⚠️ Semiconductor Physics Soon',
    body: 'Attendance is 68%. Show up and stay safe. Room 102 at 02:30 PM.',
    type: 'class_reminder',
    priority: 'high',
    timestamp: new Date(now.getTime() - 45 * 60000),
    read: true,
    icon: '⚠️',
    color: '#F59E0B',
    deepLink: '/schedule',
    subjectName: 'Semiconductor Physics',
  });

  // Risk alerts
  notifications.push({
    id: generateId(),
    title: '🚨 Data Structures Critical',
    body: 'Attendance at 52%. Immediate action needed — attend all remaining classes.',
    type: 'risk_alert',
    priority: 'urgent',
    timestamp: new Date(now.getTime() - 2 * 3600000),
    read: false,
    icon: '🚨',
    color: '#EF4444',
    deepLink: '/recovery-plan',
    subjectName: 'Data Structures',
    metadata: { percentage: '52', riskLevel: 'critical' },
  });

  notifications.push({
    id: generateId(),
    title: '⚠️ Database Systems Warning',
    body: 'Attendance at 72%. Stay consistent to recover above 75%.',
    type: 'risk_alert',
    priority: 'high',
    timestamp: new Date(now.getTime() - 4 * 3600000),
    read: true,
    icon: '⚠️',
    color: '#F59E0B',
    deepLink: '/recovery-plan',
    subjectName: 'Database Systems',
  });

  // Achievements
  notifications.push({
    id: generateId(),
    title: '🏆 Perfect Week Streak!',
    body: 'You attended all classes this week. Amazing dedication!',
    type: 'achievement',
    priority: 'low',
    timestamp: new Date(now.getTime() - 24 * 3600000),
    read: true,
    icon: '🏆',
    color: '#10B981',
  });

  notifications.push({
    id: generateId(),
    title: '🏆 OOPs Attendance 90%+',
    body: 'Your OOPs with Java attendance crossed 90%. Keep it up!',
    type: 'achievement',
    priority: 'low',
    timestamp: new Date(now.getTime() - 48 * 3600000),
    read: true,
    icon: '🏆',
    color: '#10B981',
    subjectName: 'OOPs with Java',
  });

  // AI Tips
  notifications.push({
    id: generateId(),
    title: '💡 AI Study Tip',
    body: 'Review your Cloud Foundations notes before tomorrow\'s class for better retention.',
    type: 'ai_tip',
    priority: 'low',
    timestamp: new Date(now.getTime() - 6 * 3600000),
    read: false,
    icon: '💡',
    color: '#A78BFA',
    deepLink: '/chat',
  });

  // System
  notifications.push({
    id: generateId(),
    title: '📢 Schedule Updated',
    body: 'Wednesday SP Lab has been moved to Lab 126. Check your schedule.',
    type: 'system',
    priority: 'medium',
    timestamp: new Date(now.getTime() - 12 * 3600000),
    read: true,
    icon: '📢',
    color: '#64748B',
    deepLink: '/schedule',
  });

  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// ====================================
// Time Formatting
// ====================================
export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ====================================
// Group notifications by date
// ====================================
export const groupNotifications = (notifications: SmartNotification[]): Record<string, SmartNotification[]> => {
  const groups: Record<string, SmartNotification[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);

  for (const notif of notifications) {
    const notifDate = new Date(notif.timestamp.getFullYear(), notif.timestamp.getMonth(), notif.timestamp.getDate());
    let label: string;

    if (notifDate.getTime() === today.getTime()) label = 'Today';
    else if (notifDate.getTime() === yesterday.getTime()) label = 'Yesterday';
    else label = notif.timestamp.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    if (!groups[label]) groups[label] = [];
    groups[label].push(notif);
  }
  return groups;
};
