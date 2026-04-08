const axios = require('axios');
require('dotenv').config();

const generateQuestionsAI = async (topic) => {
  const prompt = `\nGenerate 5 coding questions on topic ${topic}.\n\nReturn JSON array with:\ntitle\ndifficulty\ndescription\nconstraints\ninput_format\noutput_format\nsample_test_cases\nhidden_test_cases\nstarter_code\n`;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{
        parts: [{ text: prompt }]
      }]
    }
  );

  return response.data.candidates[0].content.parts[0].text;
};

const generateStudyPlanAI = async (performanceSummary) => {
  const prompt = `
You are an expert AI tutor. Analyze this student's recent performance:
${performanceSummary}

Return a strictly valid JSON object with the following structure:
{
  "summary": "A friendly 2-sentence summary of their progress and what they should focus on.",
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "plan": [
    { "day": "Monday", "focus": "Topic 1", "action": "Read chapter 4 and specifically practice arrays" },
    { "day": "Wednesday", "focus": "Topic 2", "action": "Watch a video on pointers" },
    { "day": "Friday", "focus": "Quiz", "action": "Take a practice quiz on memory management" }
  ]
}
Ensure the output is ONLY valid JSON, without any markdown formatting like \`\`\`json.
`;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{
        parts: [{ text: prompt }]
      }]
    }
  );

  return response.data.candidates[0].content.parts[0].text;
};

module.exports = { generateQuestionsAI, generateStudyPlanAI };
