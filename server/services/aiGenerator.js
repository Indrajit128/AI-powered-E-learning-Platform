const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateCodingChallenge = async (topic, difficulty) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate a coding challenge on the topic "${topic}" with difficulty level "${difficulty}".
    The response must be a structured JSON object with the following schema:
    {
        "title": "Clear and concise title",
        "description": "Detailed problem description with examples",
        "constraints": "List of constraints (e.g., time complexity, space complexity, input limits)",
        "examples": [
            {
                "input": "Sample input value",
                "output": "Sample output value",
                "explanation": "Why this output?"
            }
        ],
        "test_cases": [
            { "input": "input1", "output": "output1", "hidden": false },
            { "input": "input2", "output": "output2", "hidden": true }
        ],
        "starter_code_js": "Initial function signature or setup for JavaScript",
        "starter_code_py": "Initial function signature or setup for Python",
        "starter_code_java": "Initial code shell for Java",
        "starter_code_cpp": "Initial code shell for C++",
        "solution": "The correct algorithm/code for the problem (standard pseudo-code or generic language)",
        "tags": ["Tag1", "Tag2"]
    }
    Ensure the JSON is valid and strictly follows the schema. No extra text in the response.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from response (handling potential markdown formatting)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI failed to generate valid JSON');
        
        const challenge = JSON.parse(jsonMatch[0]);
        challenge.difficulty = difficulty; // Ensure it matches request
        return challenge;
    } catch (error) {
        console.error('Error generating AI challenge:', error);
        throw new Error('Failed to generate challenge via AI');
    }
};

module.exports = { generateCodingChallenge };
