const axios = require('axios');

const challenges = [
    {
        title: "Two Sum",
        description: "Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.<br/><br/><strong>Example:</strong><br/>Input: nums = [2,7,11,15], target = 9<br/>Output: [0,1]",
        difficulty: "Easy",
        tags: ["Arrays", "Hash Table"],
        starter_code_js: "function twoSum(nums, target) {\n    // Write your code here\n};",
        test_cases: [
            { input: "[2,7,11,15]\n9", output: "[0,1]", hidden: false },
            { input: "[3,2,4]\n6", output: "[1,2]", hidden: false }
        ]
    },
    {
        title: "Reverse String",
        description: "Write a function that reverses a string.<br/><br/><strong>Example:</strong><br/>Input: s = [\"h\",\"e\",\"l\",\"l\",\"o\"]<br/>Output: [\"o\",\"l\",\"l\",\"e\",\"h\"]",
        difficulty: "Easy",
        tags: ["Strings"],
        starter_code_js: "function reverseString(s) {\n    // Write your code here\n};",
        test_cases: [
            { input: "[\"h\",\"e\",\"l\",\"l\",\"o\"]", output: "[\"o\",\"l\",\"l\",\"e\",\"h\"]", hidden: false }
        ]
    },
    {
        title: "Valid Parentheses",
        description: "Given a string <code>s</code> containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: "Easy",
        tags: ["Stacks", "String"],
        starter_code_js: "function isValid(s) {\n    // Write your code here\n};",
        test_cases: [
            { input: "\"()\"", output: "true", hidden: false },
            { input: "\"()[]{}\"", output: "true", hidden: false },
            { input: "\"(]\"", output: "false", hidden: false }
        ]
    },
    {
        title: "Fizz Buzz",
        description: "Return a string array where values are Fizz, Buzz or FizzBuzz based on divisibility by 3, 5 or both.",
        difficulty: "Easy",
        tags: ["Math"],
        starter_code_js: "function fizzBuzz(n) {\n    // Write your code here\n};",
        test_cases: [
            { input: "3", output: "[\"1\",\"2\",\"Fizz\"]", hidden: false }
        ]
    },
    {
        title: "Fibonacci Number",
        description: "Calculate the n-th Fibonacci number.",
        difficulty: "Easy",
        tags: ["Recursion"],
        starter_code_js: "function fib(n) {\n    // Write your code here\n};",
        test_cases: [
            { input: "2", output: "1", hidden: false },
            { input: "4", output: "3", hidden: false }
        ]
    }
];

async function seed() {
    console.log('🌱 Adding more challenges...');
    for (const challenge of challenges) {
        try {
            await axios.post('http://localhost:5000/api/challenges', challenge);
            console.log(`✅ Seeded: ${challenge.title}`);
        } catch (err) {}
    }
    console.log('Done!');
}

seed();
