import { getGeminiResponse } from './geminiService';
import { RiskAssessment, OverallRisk, RiskLevel, getRiskEmoji } from './riskService';

/**
 * Generate a personalized AI-powered risk notification message using Gemini
 */
export const generateRiskNotification = async (
  studentName: string,
  risk: OverallRisk,
): Promise<string> => {
  if (risk.overallLevel === 'safe') {
    return `Great work, ${studentName}! 🎉 Your attendance is on track across all subjects. Keep showing up — consistency is key!`;
  }

  const atRiskCourses = risk.coursesAtRisk
    .map(c => `${c.courseName}: ${c.currentPercentage}% (need ${c.classesNeeded} more classes)`)
    .join('\n');

  const prompt = `Generate a short, personalized attendance alert notification for a college student named "${studentName}".

CONTEXT:
- Overall risk level: ${risk.overallLevel.toUpperCase()}
- Subjects at risk:
${atRiskCourses}

TONE RULES:
${risk.overallLevel === 'critical' 
  ? '- Be URGENT but supportive. This is serious — use strong motivation. Make them feel the importance without being harsh.'
  : '- Be ENCOURAGING with gentle urgency. This is a warning — motivate them to improve before it gets worse.'}

FORMAT:
- Keep it under 3 sentences
- Use 1-2 emojis max
- Be specific about which subjects need attention
- Include a positive action they can take RIGHT NOW
- Sound like a helpful friend, not a school admin`;

  try {
    const response = await getGeminiResponse(prompt, []);
    return response;
  } catch (error) {
    // Fallback messages
    return risk.overallLevel === 'critical'
      ? `🚨 ${studentName}, your attendance needs immediate attention! ${risk.criticalCourses} subject${risk.criticalCourses > 1 ? 's are' : ' is'} below 60%. Attend all classes this week to start recovering.`
      : `⚠️ Heads up, ${studentName}! ${risk.warningCourses} subject${risk.warningCourses > 1 ? 's need' : ' needs'} attention. Stay consistent this week to keep your attendance safe.`;
  }
};

/**
 * Generate a detailed recovery plan using Gemini AI
 */
export const generateRecoveryPlan = async (
  studentName: string,
  courseRisk: RiskAssessment,
): Promise<string> => {
  const prompt = `Generate a brief, actionable recovery plan for a college student named "${studentName}" for the subject "${courseRisk.courseName}".

DETAILS:
- Current attendance: ${courseRisk.currentPercentage}%
- Classes attended: ${courseRisk.attended}/${courseRisk.total}
- Classes remaining in semester: ${courseRisk.classesRemaining}
- Classes needed to reach 75%: ${courseRisk.classesNeeded}
- Can still skip: ${courseRisk.maxSkippable} classes
- Recoverable: ${courseRisk.recoverable ? 'Yes' : 'No - needs special permission'}
- Projected final attendance if continuing current pattern: ${courseRisk.prediction.worstCase}%
- Best case (attending all remaining): ${courseRisk.prediction.bestCase}%

FORMAT:
- Use markdown with bullet points
- Keep it under 6 bullet points
- Be specific with numbers
- Include week-by-week mini goals
- Add a motivational closing line
- Sound supportive and practical`;

  try {
    return await getGeminiResponse(prompt, []);
  } catch {
    return `### Recovery Plan for ${courseRisk.courseName}
- ✅ Attend the next **${Math.min(courseRisk.classesNeeded, 5)} classes** without missing any
- 📊 Current: ${courseRisk.currentPercentage}% → Target: 75%
- 🎯 You can still skip up to **${courseRisk.maxSkippable}** classes this semester
- 💪 ${courseRisk.recoverable ? 'Recovery is possible! Stay committed.' : 'Consider speaking with your professor about your situation.'}`;
  }
};

/**
 * Generate a motivational daily check-in message
 */
export const generateDailyMotivation = async (
  studentName: string,
  riskLevel: RiskLevel,
): Promise<string> => {
  const toneMap = {
    safe: 'celebratory and encouraging',
    warning: 'gently urgent and motivating',
    critical: 'supportive but seriously urgent',
  };

  const prompt = `Generate a one-line daily motivation for a college student named "${studentName}" about attending classes today. Tone: ${toneMap[riskLevel]}. Keep it under 15 words. Use 1 emoji.`;

  try {
    return await getGeminiResponse(prompt, []);
  } catch {
    const messages = {
      safe: `Keep it up, ${studentName}! 🌟 Another great day to stay on track.`,
      warning: `Today matters, ${studentName}! 💪 Every class counts toward your goal.`,
      critical: `${studentName}, today is your comeback day! 🔥 Show up and make it count.`,
    };
    return messages[riskLevel];
  }
};
