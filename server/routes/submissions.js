const express = require('express');
const router = express.Router();
const supabase = require('../db/db');
const { executeCode } = require('../services/codeRunner');

// POST run code (Test cases)
router.post('/run-code', async (req, res) => {
    const { code, language, test_cases } = req.body;
    try {
        const results = await Promise.all(test_cases.map(async (tc) => {
            const result = await executeCode(code, language, tc.input);
            return {
                input: tc.input,
                expected: tc.output,
                actual: result.stdout.trim(),
                passed: result.stdout.trim() === tc.output.trim(),
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
            const result = await executeCode(code, language, tc.input);
            return {
                ...tc,
                actual: result.stdout.trim(),
                passed: result.stdout.trim() === tc.output.trim(),
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
