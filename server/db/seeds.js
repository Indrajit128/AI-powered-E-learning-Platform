const supabase = require('./db');

const challenges = [
    {
        title: "Two Sum",
        description: "Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.<br/><br/>You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        difficulty: "Easy",
        tags: ["Arrays", "Hash Table"],
        constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
        starter_code_js: "function twoSum(nums, target) {\n    // Write your code here\n};",
        test_cases: [
            { input: "[2,7,11,15]\n9", expected: "[0,1]", hidden: false },
            { input: "[3,2,4]\n6", expected: "[1,2]", hidden: false }
        ]
    },
    {
        title: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as an array of characters <code>s</code>.",
        difficulty: "Easy",
        tags: ["Strings"],
        constraints: "1 <= s.length <= 10^5",
        starter_code_js: "function reverseString(s) {\n    // Write your code here\n};",
        test_cases: [
            { input: "[\"h\",\"e\",\"l\",\"l\",\"o\"]", expected: "[\"o\",\"l\",\"l\",\"e\",\"h\"]", hidden: false }
        ]
    },
    {
        title: "Valid Palindrome",
        description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
        difficulty: "Easy",
        tags: ["Strings", "Two Pointers"],
        constraints: "1 <= s.length <= 2 * 10^5",
        starter_code_js: "function isPalindrome(s) {\n    // Write your code here\n};",
        test_cases: [
            { input: "\"A man, a plan, a canal: Panama\"", expected: "true", hidden: false },
            { input: "\"race a car\"", expected: "false", hidden: false }
        ]
    },
    {
        title: "Fizz Buzz",
        description: "Given an integer <code>n</code>, return a string array <code>answer</code> (1-indexed) where:<br/>answer[i] == \"FizzBuzz\" if i is divisible by 3 and 5.<br/>answer[i] == \"Fizz\" if i is divisible by 3.<br/>answer[i] == \"Buzz\" if i is divisible by 5.<br/>answer[i] == i if none of the above conditions are true.",
        difficulty: "Easy",
        tags: ["Math", "String"],
        constraints: "1 <= n <= 10^4",
        starter_code_js: "function fizzBuzz(n) {\n    // Write your code here\n};",
        test_cases: [
            { input: "3", expected: "[\"1\",\"2\",\"Fizz\"]", hidden: false },
            { input: "5", expected: "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]", hidden: false }
        ]
    },
    {
        title: "Fibonacci Number",
        description: "The Fibonacci numbers, commonly denoted F(n) form a sequence.",
        difficulty: "Easy",
        tags: ["Math"],
        constraints: "0 <= n <= 30",
        starter_code_js: "function fib(n) {\n    // Write your code here\n};",
        test_cases: [
            { input: "2", expected: "1", hidden: false },
            { input: "3", expected: "2", hidden: false }
        ]
    }
];

async function seed() {
    console.log('🌱 Seeding coding challenges...');
    
    // Clear existing
    await supabase.from('coding_challenges').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { data: insertData, error: insertError } = await supabase
        .from('coding_challenges')
        .insert(challenges)
        .select();

    if (insertError) {
        console.error('Error seeding challenges:', JSON.stringify(insertError, null, 2));
    } else {
        console.log(`✅ Successfully seeded ${insertData?.length || 0} challenges!`);
    }
    process.exit();
}

seed();
