const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateAssignment = async (subject, type, level = 'beginner') => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";

    switch (type) {
        case 'quiz':
            prompt = `Generate 10 multiple-choice questions on ${subject} at ${level} level. 
            Format the output as a valid JSON array of objects, each with: 
            "question", "options" (array of 4 strings), and "correctAnswer" (integer, the 0-based index of the correct option).`;
            break;
        case 'crossword':
            prompt = `Generate data for a 5-word crossword puzzle about ${subject} (${level} level). 
            Format the output ONLY as a valid JSON object with a "words" array. Each word object should have: 
            "answer" (the word to fill, uppercase), "clue" (the hint), "row" (0-9), "col" (0-9), and "orientation" ("across" or "down").
            Ensure words intersect or at least have valid coordinates on a 10x10 grid.`;
            break;
        case 'coding':
            prompt = `Generate a programming challenge for ${subject} at ${level} level. 
            The challenge should be solvable in C or Javascript.
            Format the output as a valid JSON object with: 
            "title", "description", "constraints", "initialCode", and "testCases" (array of {input: string, output: string}).`;
            break;
        case 'flashcards':
            prompt = `Generate 5 flashcards for ${subject}. 
            Format the output as a valid JSON array of objects, each with "front" (question) and "back" (answer).`;
            break;
        case 'fill_blanks':
            prompt = `Generate 5 fill-in-the-blank questions for ${subject}. 
            Format the output as a valid JSON array of objects, each with "sentence" (use ___ for the blank) and "answer" (the missing word).`;
            break;
        default:
            throw new Error('Invalid assignment type');
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handling potential markdown formatting)
    const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI failed to generate valid JSON');
    return JSON.parse(jsonMatch[0]);
};

module.exports = { generateAssignment };
