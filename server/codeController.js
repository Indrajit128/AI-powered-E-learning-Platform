const runCodeJudge0 = require('./services/judgeService');
const supabase = require('./config');

exports.runCode = async (req, res) => {
  try {
    const { code, language_id, question_id, user_id, test_cases } = req.body;
    let passed = 0;
    let results = [];

    for (const tc of test_cases) {
      const result = await runCodeJudge0(code, language_id, tc.input);
      const stdout = result.stdout || '';
      const isPassed = stdout.trim() === (tc.output || '').trim();

      if (isPassed) passed++;

      results.push({
        input: tc.input,
        expected: tc.output,
        actual: stdout,
        passed: isPassed
      });
    }

    const { data, error } = await supabase
      .from('coding_attempts')
      .insert({
        user_id,
        question_id,
        language: String(language_id),
        code,
        passed_test_cases: passed,
        total_test_cases: test_cases.length,
        status: passed === test_cases.length ? 'accepted' : 'failed'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ results, passed, total: test_cases.length, attempt_id: data.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Execution failed' });
  }
};
