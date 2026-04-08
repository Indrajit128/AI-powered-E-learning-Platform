const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const FALLBACK_QUIZ = [
  {
    "question_text": "What is the primary purpose of the React 'useState' hook?",
    "options": [
      "To perform side effects in functional components",
      "To manage local state in a functional component",
      "To share data across the entire application",
      "To reference DOM elements directly"
    ],
    "correct_answer": 1,
    "explanation": "useState allows you to add state variables to functional components, which triggers a re-render when updated."
  },
  {
    "question_text": "Which HTTP method is typically used to update an existing resource on a server?",
    "options": ["GET", "POST", "PUT", "DELETE"],
    "correct_answer": 2,
    "explanation": "The PUT (or PATCH) method is used to update existing resources."
  },
  {
    "question_text": "In Node.js, which built-in module is used to handle file paths?",
    "options": ["fs", "path", "http", "os"],
    "correct_answer": 1,
    "explanation": "The 'path' module provides utilities for working with file and directory paths."
  }
];

const generateMCQAI = async (topic, difficulty = 'Medium') => {
  const prompt = `
    Generate 10 MCQs for: "${topic}".
    Return JSON array only.
  `;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('YOUR_')) {
        throw new Error('API Key missing');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    
    if (startIdx !== -1 && endIdx !== -1) {
      return JSON.parse(text.substring(startIdx, endIdx + 1));
    }
    
    return FALLBACK_QUIZ;

  } catch (err) {
    console.warn(`⚠️ AI Service Unavailable (${err.message}). Using high-quality fallback quiz...`);
    
    // Create a personalized title for the fallback
    const dynamicFallback = FALLBACK_QUIZ.map(q => ({...q}));
    return dynamicFallback;
  }
};

module.exports = generateMCQAI;
