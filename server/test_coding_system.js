const { generateCodingChallenge } = require('./services/aiGenerator');
const { executeCode } = require('./services/codeRunner');
require('dotenv').config();

async function testAI() {
    console.log('--- Testing AI Challenge Generation ---');
    try {
        const challenge = await generateCodingChallenge('Recursion', 'Medium');
        console.log('✅ AI Success! Challenge Title:', challenge.title);
        // console.log('Sample JavaScript Starter:', challenge.starter_code_js);
    } catch (err) {
        console.error('❌ AI Failed:', err.message);
    }
}

async function testExecution() {
    console.log('\n--- Testing Code Execution (Piston) ---');
    const code = `
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)

input_val = input().strip()
n = int(input_val) if input_val else 0
print(fib(n))
    `;
    try {
        const result = await executeCode(code, 'python', '6');
        console.log('✅ Execution Success!');
        console.log('Input: 6');
        console.log('Output:', result.stdout.trim());
        console.log('Status:', result.status);
    } catch (err) {
        console.error('❌ Execution Failed:', err.message);
    }
}

async function runTests() {
    await testAI();
    await testExecution();
}

runTests();
