// src/services/attendanceService.ts
import { generateSignedToken, verifySignedToken, AttendanceTokenPayload } from '../utils/token';
import { QRTokenPayload, AttendancePayload, AttendanceResult } from '../types';

// In‑memory stores (replace with Firestore in production)
const usedNonces = new Set<string>();
const attendanceRecords: Record<string, { attended: number; total: number }> = {};

/**
 * Simulated list of students enrolled in batches/subjects.
 * In a real app this would be fetched from Firestore.
 */
const studentEnrollments: Record<string, { batches: string[]; subjects: string[] }> = {
  // studentId: enrollment info
  'student-001': { batches: ['batch-01'], subjects: ['subj-01', 'subj-02'] },
  // add more mock students as needed
};

/**
 * Generate a signed QR token for a specific batch and subject.
 * Returns the raw token string that will be encoded as a QR code.
 */
export async function generateAttendanceToken(batchId: string, subjectId: string): Promise<string> {
  const now = Date.now();
  const payload: AttendanceTokenPayload = {
    batchId,
    subjectId,
    timestamp: now,
    expiry: now + 5 * 60 * 1000, // 5‑minute validity
  };
  // Include a nonce to protect against replay attacks
  const nonce = Math.random().toString(36).substring(2, 12);
  // Append nonce to payload (not part of the type but we embed via extra field)
  // We'll store nonce separately in the token string after a dot.
  const token = await generateSignedToken(payload);
  // Compose token as <signedPayload>.<nonce>
  return `${token}.${nonce}`;
}

/**
 * Validate a scanned token and record attendance.
 */
export async function validateAttendance(payload: AttendancePayload): Promise<AttendanceResult> {
  const { studentId, token } = payload;
  // Split token and nonce
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { success: false, message: 'Invalid token format' };
  }
  const [signedPart, nonce] = [parts.slice(0, 2).join('.'), parts[2]];

  // Replay protection
  if (usedNonces.has(nonce)) {
    return { success: false, message: 'Token already used' };
  }

  const decoded = await verifySignedToken(signedPart);
  if (!decoded) {
    return { success: false, message: 'Token signature invalid' };
  }

  const { batchId, subjectId, expiry } = decoded as QRTokenPayload;
  const now = Date.now();
  if (now > expiry) {
    return { success: false, message: 'Token expired' };
  }

  // Enrollment check
  const enrollment = studentEnrollments[studentId];
  if (!enrollment) {
    return { success: false, message: 'Student not found' };
  }
  if (!enrollment.batches.includes(batchId) || !enrollment.subjects.includes(subjectId)) {
    return { success: false, message: 'Student not enrolled in this batch/subject' };
  }

  // Duplicate attendance for today check
  const todayKey = `${studentId}:${subjectId}:${new Date().toDateString()}`;
  if (attendanceRecords[todayKey]) {
    return { success: false, message: 'Attendance already marked for today' };
  }

  // Record attendance
  attendanceRecords[todayKey] = { attended: 1, total: 1 };
  usedNonces.add(nonce);

  // Compute a mock percentage (for demo we just return 100%)
  const updatedPercentage = 100;

  return {
    success: true,
    message: 'Attendance recorded',
    subjectId,
    updatedPercentage,
    timestamp: now,
  };
}

// Helper to retrieve a student's attendance summary (optional UI use)
export function getStudentAttendance(studentId: string) {
  const summary: Record<string, { attended: number; total: number }> = {};
  Object.entries(attendanceRecords).forEach(([key, val]) => {
    const [, subjectId] = key.split(':');
    if (!summary[subjectId]) {
      summary[subjectId] = { attended: 0, total: 0 };
    }
    summary[subjectId].attended += val.attended;
    summary[subjectId].total += val.total;
  });
  return summary;
}
export type { AttendancePayload };

