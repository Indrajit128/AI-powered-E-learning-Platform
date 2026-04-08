const axios = require('axios');

const challenges = [
    {
        title: "Max Consecutive Ones",
        description: "Given a binary array <code>nums</code>, return the maximum number of consecutive 1's in the array if you can flip at most one 0.",
        difficulty: "Medium",
        tags: ["Sliding Window", "Arrays"],
        starter_code_js: "function findMaxConsecutiveOnes(nums) {\n    // Write your code here\n};",
        test_cases: [
            { input: "[1,0,1,1,0]", output: "4", hidden: false },
            { input: "[1,0,1,1,0,1]", output: "4", hidden: false }
        ]
    }
];

async function seed() {
    console.log('🌱 Adding missing topics...');
    for (const challenge of challenges) {
        try {
            await axios.post('http://localhost:5000/api/challenges', challenge);
            console.log(`✅ Seeded: ${challenge.title} [${challenge.tags.join(', ')}]`);
        } catch (err) {}
    }
}

seed();
