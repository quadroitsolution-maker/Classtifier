export interface Course {
  id: string;
  name: string;
  code: string;
  type: 'Lecture' | 'Lab' | 'Seminar' | 'Office Hours' | 'Training' | 'Break';
  startTime: string;
  endTime: string;
  location: string;
  instructor?: string;
  facultyImage?: string;
  color: string;
  status?: 'Completed' | 'Upcoming' | 'Active';
  isCancelled?: boolean;
  attendance?: number;
  nextClass?: {
    time: string;
    location: string;
  };
}

export interface AttendanceRecord {
  courseId: string;
  courseName: string;
  percentage: number;
  attended: number;
  total: number;
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'grade' | 'assignment' | 'alert' | 'event';
  read: boolean;
}

// QR Attendance token and related types
export interface QRTokenPayload {
  batchId: string;
  subjectId: string;
  timestamp: number; // epoch ms
  expiry: number; // epoch ms
}

export interface AttendancePayload {
  studentId: string;
  token: string; // signed QR token
}

export interface AttendanceResult {
  success: boolean;
  message?: string;
  subjectId?: string;
  updatedPercentage?: number;
  timestamp?: number;
}
