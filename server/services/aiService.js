const axios = require('axios');
require('dotenv').config();

const generateAssignment = async (subject, type, level = 'beginner') => {
    // We use axios directly as it's more stable in this environment than the SDK for model resolution
    const API_KEY = process.env.GEMINI_API_KEY;
    const MODEL = "gemini-pro"; // Use gemini-pro for maximum compatibility
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    let prompt = "";

    switch (type) {
        case 'quiz':
            prompt = `Generate 10 multiple-choice questions on ${subject} at ${level} level. 
            Format the output ONLY as a valid JSON array of objects, each with: 
            "question" (string), "options" (array of 4 strings), and "correctAnswer" (integer, the 0-based index of the correct option).
            Do not include markdown formatting like \`\`\`json.`;
            break;
        case 'crossword':
            prompt = `Generate data for a 5-word crossword puzzle about ${subject} (${level} level). 
            Format the output ONLY as a valid JSON object with a "words" array. Each word object should have: 
            "answer" (the word to fill, uppercase), "clue" (the hint), "row" (0-9), "col" (0-9), and "orientation" ("across" or "down").
            Ensure words intersect or at least have valid coordinates on a 10x10 grid.
            Do not include markdown formatting like \`\`\`json.`;
            break;
        case 'coding':
            prompt = `Generate a programming challenge for ${subject} at ${level} level. 
            The challenge should be solvable in C or Javascript.
            Format the output ONLY as a valid JSON object with: 
            "title", "description", "constraints", "initialCode", and "testCases" (array of {input: string, output: string}).
            Do not include markdown formatting like \`\`\`json.`;
            break;
        case 'flashcards':
            prompt = `Generate 5 flashcards for ${subject}. 
            Format the output ONLY as a valid JSON array of objects, each with "front" (question) and "back" (answer).
            Do not include markdown formatting like \`\`\`json.`;
            break;
        case 'fill_blanks':
            prompt = `Generate 5 fill-in-the-blank questions for ${subject}. 
            Format the output ONLY as a valid JSON array of objects, each with "sentence" (use ___ for the blank) and "answer" (the missing word).
            Do not include markdown formatting like \`\`\`json.`;
            break;
        default:
            throw new Error('Invalid assignment type');
    }

    try {
        const response = await axios.post(URL, {
            contents: [{
                parts: [{ text: prompt }]
            }]
        });

        if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
            console.error('AI Response structure invalid:', JSON.stringify(response.data));
            throw new Error('Invalid response from AI Service');
        }

        const text = response.data.candidates[0].content.parts[0].text;
        
        // Robust extraction: find the first '[' or '{' and the last ']' or '}'
        const firstBracket = text.indexOf(type === 'quiz' || type === 'flashcards' || type === 'fill_blanks' ? '[' : '{');
        const lastBracket = text.lastIndexOf(type === 'quiz' || type === 'flashcards' || type === 'fill_blanks' ? ']' : '}');
        
        if (firstBracket === -1 || lastBracket === -1) {
            console.error('Could not find JSON in text:', text);
            throw new Error('AI failed to generate valid JSON format');
        }

        const jsonString = text.substring(firstBracket, lastBracket + 1);
        return JSON.parse(jsonString);

    } catch (err) {
        if (err.response) {
            console.error('AI Service API Error:', {
                status: err.response.status,
                data: err.response.data
            });
        } else {
            console.error('AI Service System Error:', err.message);
        }
        throw err;
    }
};

module.exports = { generateAssignment };
