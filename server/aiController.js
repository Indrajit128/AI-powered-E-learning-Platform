const generateQuestionsAI = require('./services/geminiService');
const supabase = require('./config');

exports.generateQuestions = async (req, res) => {
  try {
    const { topic } = req.body;
    const aiResponse = await generateQuestionsAI(topic);
    const questions = JSON.parse(aiResponse);
    const insertedQuestions = [];

    for (const q of questions) {
      const { data, error } = await supabase
        .from('coding_questions')
        .insert({
          title: q.title,
          difficulty: q.difficulty,
          topic: topic,
          description: q.description,
          constraints: q.constraints,
          input_format: q.input_format,
          output_format: q.output_format,
          sample_test_cases: q.sample_test_cases,
          hidden_test_cases: q.hidden_test_cases,
          starter_code: q.starter_code
        })
        .select()
        .single();

      if (error) throw error;
      insertedQuestions.push(data);
    }

    res.json(insertedQuestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
};
