import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getGeminiResponse = async (prompt: string, history: any[] = []) => {
  if (!API_KEY) {
    return "API Key not configured. Please add GEMINI_API_KEY to your secrets.";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are Classtifier AI, the official academic assistant for the Classtifier college attendance and management app.

STRICT RULES:
1. You ONLY answer questions related to:
   - Academic topics (subjects, studies, exams, assignments, homework, research)
   - Attendance (checking, improving, policies, percentages)
   - Class schedules and timetables
   - College/university life and student guidance
   - Teacher classroom management (grading, student tracking, announcements)
   - Career guidance for students
   - Study tips and exam preparation
   - Course information and syllabus queries

2. You MUST REFUSE to answer questions about:
   - Entertainment, movies, music, games
   - Personal relationship advice
   - Political topics
   - Any non-academic or non-educational content
   - Coding or programming unrelated to coursework
   - General knowledge questions unrelated to academics

3. If a user asks something off-topic, respond with:
   "I'm Classtifier AI — I'm here to help with your academic journey! 📚 I can assist with attendance, schedules, studies, exams, and classroom management. Please ask me something related to your college experience."

4. Keep responses concise, friendly, and use markdown for formatting.
5. Use emojis sparingly to keep it student-friendly.
6. Address students and teachers respectfully.`
      }
    });

    return response.text || "I'm having trouble connecting to my brain right now. Please try again later.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my brain right now. Please try again later.";
  }
};

export const improveAnnouncementTone = async (text: string) => {
  const prompt = `Improve the tone of the following teacher's announcement to be more professional, encouraging, and clear. 
  Keep the length similar, but make it sound more "premium" and engaging for students.
  
  Announcement: "${text}"`;
  
  return getGeminiResponse(prompt);
};
