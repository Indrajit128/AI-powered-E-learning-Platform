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

module.exports = generateQuestionsAI;
