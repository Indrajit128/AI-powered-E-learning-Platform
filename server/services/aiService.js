const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../server/.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MOCK_DATA = {
    quiz: [
        { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Text Main Link", "Hyper Tool Markup Link"], correctAnswer: 0 },
        { question: "Which CSS property controls text size?", options: ["font-style", "text-size", "font-size", "text-style"], correctAnswer: 2 }
    ],
    flashcards: [
        { front: "What is React?", back: "A JavaScript library for building user interfaces." },
        { front: "What is JSX?", back: "A syntax extension for JavaScript that looks like HTML." }
    ],
    coding: {
        title: "Hello World in JS",
        description: "Write a function that returns 'Hello World'.",
        constraints: "None",
        initialCode: "function solve() {\n  return '';\n}",
        testCases: [{ input: "()", output: "'Hello World'" }]
    }
};

const generateAssignment = async (subject, type, level = 'beginner') => {
    let prompt = "";

    switch (type) {
        case 'quiz':
            prompt = `Generate 10 multiple-choice questions on ${subject} at ${level} level. 
            Format the output ONLY as a valid JSON array of objects, each with: 
            "question" (string), "options" (array of 4 strings), and "correctAnswer" (integer, the 0-based index of the correct option).`;
            break;
        case 'coding':
            prompt = `Generate a programming challenge for ${subject} at ${level} level. 
            The challenge should be solvable in C or Javascript.
            Format the output ONLY as a valid JSON object with: 
            "title", "description", "constraints", "initialCode", and "testCases" (array of {input: string, output: string}).`;
            break;
        case 'flashcards':
            prompt = `Generate 5 flashcards for ${subject}. 
            Format the output ONLY as a valid JSON array of objects, each with "front" (question) and "back" (answer).`;
            break;
        case 'fill_blanks':
            prompt = `Generate 5 fill-in-the-blank questions for ${subject}. 
            Format the output ONLY as a valid JSON array of objects, each with "sentence" (use ___ for the blank) and "answer" (the missing word).`;
            break;
        default:
            prompt = `Generate 10 multiple-choice questions on ${subject} at ${level} level. 
            Format the output ONLY as a valid JSON array of objects.`;
    }

    try {
        if (!process.env.GEMINI_API_KEY) throw new Error('API Key missing');
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const firstBracket = text.indexOf(type === 'quiz' || type === 'flashcards' || type === 'fill_blanks' ? '[' : '{');
        const lastBracket = text.lastIndexOf(type === 'quiz' || type === 'flashcards' || type === 'fill_blanks' ? ']' : '}');
        
        if (firstBracket === -1 || lastBracket === -1) throw new Error('Invalid JSON structure');

        const jsonString = text.substring(firstBracket, lastBracket + 1);
        return JSON.parse(jsonString);
    } catch (err) {
        console.warn(`⚠️ AI Service Unavailable (${err.message}). Using high-quality fallback...`);
        return MOCK_DATA[type] || MOCK_DATA.quiz;
    }
};

module.exports = { generateAssignment };
