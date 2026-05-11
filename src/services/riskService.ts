import { AttendanceRecord } from '../types';

// ====================================
// Risk Classification Thresholds
// ====================================
const SAFE_THRESHOLD = 75;
const WARNING_THRESHOLD = 60;
const REQUIRED_ATTENDANCE = 75; // University minimum
const TOTAL_SEMESTER_CLASSES = 50; // Total classes per subject per semester

// ====================================
// Risk Levels
// ====================================
export type RiskLevel = 'safe' | 'warning' | 'critical';

export interface RiskAssessment {
  courseId: string;
  courseName: string;
  currentPercentage: number;
  attended: number;
  total: number;
  riskLevel: RiskLevel;
  riskScore: number; // 0-100 (higher = more danger)
  classesRemaining: number;
  classesNeeded: number; // Classes needed to reach 75%
  maxSkippable: number; // Max classes student can still skip
  recoverable: boolean; // Can student still reach 75%?
  requiredFutureAttendance: number; // % attendance needed in remaining classes
  color: string;
  prediction: RiskPrediction;
}

export interface RiskPrediction {
  projectedFinal: number; // Projected final attendance %
  weeksToRecover: number; // Weeks of 100% attendance needed
  bestCase: number; // If attending everything remaining
  worstCase: number; // If continuing current pattern
  trend: 'improving' | 'stable' | 'declining';
}

export interface OverallRisk {
  overallLevel: RiskLevel;
  overallScore: number;
  totalCourses: number;
  safeCourses: number;
  warningCourses: number;
  criticalCourses: number;
  coursesAtRisk: RiskAssessment[];
  summary: string;
  urgentAction: string | null;
}

// ====================================
// Risk Calculation Functions
// ====================================

/**
 * Classify risk level based on attendance percentage
 */
export const classifyRisk = (percentage: number): RiskLevel => {
  if (percentage >= SAFE_THRESHOLD) return 'safe';
  if (percentage >= WARNING_THRESHOLD) return 'warning';
  return 'critical';
};

/**
 * Calculate risk score (0-100, higher = more danger)
 */
export const calculateRiskScore = (percentage: number): number => {
  if (percentage >= 90) return 0;
  if (percentage >= SAFE_THRESHOLD) return Math.round((90 - percentage) * (30 / 15)); // 0-30
  if (percentage >= WARNING_THRESHOLD) return Math.round(30 + (SAFE_THRESHOLD - percentage) * (40 / 15)); // 30-70
  return Math.round(70 + (WARNING_THRESHOLD - percentage) * (30 / 20)); // 70-100
};

/**
 * Calculate how many future classes a student needs to attend to reach 75%
 */
export const calculateClassesNeeded = (attended: number, total: number, totalSemester: number = TOTAL_SEMESTER_CLASSES): number => {
  const remaining = totalSemester - total;
  // Need: (attended + x) / totalSemester >= 0.75
  // x = 0.75 * totalSemester - attended
  const needed = Math.ceil(REQUIRED_ATTENDANCE / 100 * totalSemester) - attended;
  return Math.max(0, Math.min(needed, remaining));
};

/**
 * Calculate maximum classes a student can still skip
 */
export const calculateMaxSkippable = (attended: number, total: number, totalSemester: number = TOTAL_SEMESTER_CLASSES): number => {
  const remaining = totalSemester - total;
  const classesNeeded = calculateClassesNeeded(attended, total, totalSemester);
  return Math.max(0, remaining - classesNeeded);
};

/**
 * Check if a student can still recover to 75%
 */
export const isRecoverable = (attended: number, total: number, totalSemester: number = TOTAL_SEMESTER_CLASSES): boolean => {
  const remaining = totalSemester - total;
  const needed = calculateClassesNeeded(attended, total, totalSemester);
  return needed <= remaining;
};

/**
 * Calculate required future attendance percentage
 */
export const calculateRequiredFutureAttendance = (attended: number, total: number, totalSemester: number = TOTAL_SEMESTER_CLASSES): number => {
  const remaining = totalSemester - total;
  if (remaining === 0) return 0;
  const needed = calculateClassesNeeded(attended, total, totalSemester);
  return Math.min(100, Math.round((needed / remaining) * 100));
};

/**
 * Generate risk prediction
 */
export const generatePrediction = (attended: number, total: number, totalSemester: number = TOTAL_SEMESTER_CLASSES): RiskPrediction => {
  const remaining = totalSemester - total;
  const currentRate = total > 0 ? attended / total : 1;
  
  // Best case: attend ALL remaining
  const bestCase = total > 0 ? Math.round(((attended + remaining) / totalSemester) * 100) : 100;
  
  // Worst case: continue same rate
  const projectedAdditional = Math.round(remaining * currentRate);
  const worstCase = Math.round(((attended + projectedAdditional) / totalSemester) * 100);
  
  // Projected final (current trajectory)
  const projectedFinal = worstCase;
  
  // Weeks to recover (assuming 5 classes/week)
  const classesNeeded = calculateClassesNeeded(attended, total, totalSemester);
  const weeksToRecover = Math.ceil(classesNeeded / 5);
  
  // Trend (simple: compare to 75%)
  const trend: 'improving' | 'stable' | 'declining' = 
    currentRate * 100 >= 80 ? 'improving' :
    currentRate * 100 >= 70 ? 'stable' : 'declining';
  
  return { projectedFinal, weeksToRecover, bestCase, worstCase, trend };
};

/**
 * Assess risk for a single course
 */
export const assessCourseRisk = (record: AttendanceRecord): RiskAssessment => {
  const { courseId, courseName, percentage, attended, total, color } = record;
  const riskLevel = classifyRisk(percentage);
  const riskScore = calculateRiskScore(percentage);
  const classesRemaining = TOTAL_SEMESTER_CLASSES - total;
  const classesNeeded = calculateClassesNeeded(attended, total);
  const maxSkippable = calculateMaxSkippable(attended, total);
  const recoverable = isRecoverable(attended, total);
  const requiredFutureAttendance = calculateRequiredFutureAttendance(attended, total);
  const prediction = generatePrediction(attended, total);

  return {
    courseId,
    courseName,
    currentPercentage: percentage,
    attended,
    total,
    riskLevel,
    riskScore,
    classesRemaining,
    classesNeeded,
    maxSkippable,
    recoverable,
    requiredFutureAttendance,
    color,
    prediction,
  };
};

/**
 * Assess overall risk across all courses
 */
export const assessOverallRisk = (records: AttendanceRecord[]): OverallRisk => {
  const assessments = records.map(assessCourseRisk);
  
  const safeCourses = assessments.filter(a => a.riskLevel === 'safe').length;
  const warningCourses = assessments.filter(a => a.riskLevel === 'warning').length;
  const criticalCourses = assessments.filter(a => a.riskLevel === 'critical').length;
  const coursesAtRisk = assessments.filter(a => a.riskLevel !== 'safe');
  
  // Overall level is worst of all courses
  const overallLevel: RiskLevel = criticalCourses > 0 ? 'critical' : warningCourses > 0 ? 'warning' : 'safe';
  
  // Overall score is average of all risk scores
  const overallScore = Math.round(assessments.reduce((sum, a) => sum + a.riskScore, 0) / assessments.length);
  
  // Generate summary
  let summary: string;
  let urgentAction: string | null = null;
  
  if (overallLevel === 'critical') {
    const worstCourse = assessments.sort((a, b) => b.riskScore - a.riskScore)[0];
    summary = `⚠️ Critical attendance alert! ${criticalCourses} subject${criticalCourses > 1 ? 's' : ''} below 60%. Immediate action needed.`;
    urgentAction = `Focus on ${worstCourse.courseName} — you need ${worstCourse.classesNeeded} more classes to recover.`;
  } else if (overallLevel === 'warning') {
    summary = `📊 ${warningCourses} subject${warningCourses > 1 ? 's are' : ' is'} in the warning zone (60-75%). Stay consistent!`;
    urgentAction = `Don't skip any more classes this week to stay safe.`;
  } else {
    summary = `✅ Great job! All subjects are above 75%. Keep it up!`;
    urgentAction = null;
  }
  
  return {
    overallLevel,
    overallScore,
    totalCourses: assessments.length,
    safeCourses,
    warningCourses,
    criticalCourses,
    coursesAtRisk,
    summary,
    urgentAction,
  };
};

/**
 * Get risk level color
 */
export const getRiskColor = (level: RiskLevel): string => {
  switch (level) {
    case 'safe': return '#10B981';
    case 'warning': return '#F59E0B';
    case 'critical': return '#EF4444';
  }
};

/**
 * Get risk level icon
 */
export const getRiskEmoji = (level: RiskLevel): string => {
  switch (level) {
    case 'safe': return '✅';
    case 'warning': return '⚠️';
    case 'critical': return '🚨';
  }
};

/**
 * Get risk level label
 */
export const getRiskLabel = (level: RiskLevel): string => {
  switch (level) {
    case 'safe': return 'Safe';
    case 'warning': return 'At Risk';
    case 'critical': return 'Critical';
  }
};
