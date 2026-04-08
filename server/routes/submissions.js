const express = require('express');
const router = express.Router();
const supabase = require('../db/db');
const { executeCode } = require('../services/codeRunner');

// POST run code (Test cases)
router.post('/run-code', async (req, res) => {
    const { code, language, test_cases } = req.body;
    try {
        const results = await Promise.all(test_cases.map(async (tc) => {
            let finalCode = code;
            
            // Basic wrapper for JavaScript to call the function and print the result
            if (language === 'javascript') {
                const functionName = code.match(/function\s+(\w+)/)?.[1] || 'solution';
                const inputs = tc.input.split('\n').join(',');
                finalCode += `\n\nconst __res = ${functionName}(${inputs});\nconsole.log(JSON.stringify(__res));`;
            }

            const result = await executeCode(finalCode, language, tc.input);
            const actual = result.stdout.trim().split('\n').pop(); // Get last line (the JSON result)

            return {
                input: tc.input,
                expected: tc.output,
                actual: actual,
                passed: actual === tc.output.trim(),
                status: result.status,
                time: result.time,
                memory: result.memory
            };
        }));
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST submit code
router.post('/submit-code', async (req, res) => {
    const { challenge_id, user_id, code, language, test_cases } = req.body;
    try {
        const results = await Promise.all(test_cases.map(async (tc) => {
            let finalCode = code;
            if (language === 'javascript') {
                const functionName = code.match(/function\s+(\w+)/)?.[1] || 'solution';
                const inputs = tc.input.split('\n').join(',');
                finalCode += `\n\nconst __res = ${functionName}(${inputs});\nconsole.log(JSON.stringify(__res));`;
            }

            const result = await executeCode(finalCode, language, tc.input);
            const actual = result.stdout.trim().split('\n').pop();

            return {
                ...tc,
                actual: actual,
                passed: actual === tc.output.trim(),
                status: result.status,
                time: result.time
            };
        }));

        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;
        const score = Math.round((passedCount / totalCount) * 100);
        const overallStatus = passedCount === totalCount ? 'Passed' : 'Failed';
        const avgTime = results.reduce((acc, r) => acc + (r.time || 0), 0) / (totalCount || 1);

        // Store in database
        const { data, error } = await supabase
            .from('challenge_submissions')
            .insert([{
                challenge_id,
                user_id,
                code,
                language,
                status: overallStatus,
                score,
                execution_time: avgTime
            }])
            .select();

        if (error) throw error;
        res.json({ results, submission: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET user submissions
router.get('/user/:userId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('challenge_submissions')
            .select('*, coding_challenges(title, difficulty)')
            .eq('user_id', req.params.userId)
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
