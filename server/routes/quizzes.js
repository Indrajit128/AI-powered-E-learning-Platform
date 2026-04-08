const express = require('express');
const router = express.Router();
const supabase = require('../db/db');
const { auth, studentOnly } = require('../middleware/authMiddleware');
const generateMCQAI = require('../services/aiQuizService');

// @route   POST /api/quizzes/generate
// @desc    Generate a new AI quiz and its questions
router.post('/generate', auth, async (req, res) => {
    const { topic, difficulty, timeLimit } = req.body;

    try {
        // 1. Generate Questions via AI
        const rawQuestions = await generateMCQAI(topic, difficulty);

        // 2. Create the Quiz record
        const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .insert([{
                title: `${topic} - AI Challenge`,
                topic,
                difficulty,
                time_limit: timeLimit || 15,
                created_by: req.user.id,
                is_ai_generated: true
            }])
            .select()
            .single();

        if (quizError) throw quizError;

        // 3. Insert Questions
        const questionsToInsert = rawQuestions.map(q => ({
            quiz_id: quiz.id,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation
        }));

        const { error: qError } = await supabase
            .from('quiz_questions')
            .insert(questionsToInsert);

        if (qError) throw qError;

        res.json({ message: 'Quiz generated successfully', quizId: quiz.id });
    } catch (err) {
        console.error('Quiz Generation Error:', err);
        const errorMsg = err.message.includes('AI') 
            ? 'The AI Engine failed to generate questions. Please try a different topic.'
            : 'Database error: Failed to save the generated quiz. Ensure tables are created.';
        res.status(500).json({ error: errorMsg });
    }
});

// @route   GET /api/quizzes
// @desc    Get all available quizzes
router.get('/', auth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/quizzes/:id
// @desc    Get quiz details with questions
router.get('/:id', auth, async (req, res) => {
    try {
        const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (quizError) throw quizError;

        const { data: questions, error: qError } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', req.params.id);

        if (qError) throw qError;

        res.json({ ...quiz, questions });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/quizzes/submit
// @desc    Submit a quiz attempt
router.post('/submit', auth, async (req, res) => {
    const { quizId, answers, timeTaken } = req.body; // answers: { questionId: selectedIndex }

    try {
        // 1. Fetch correct answers
        const { data: questions, error: qError } = await supabase
            .from('quiz_questions')
            .select('id, correct_answer')
            .eq('quiz_id', quizId);

        if (qError) throw qError;

        // 2. Calculate score
        let score = 0;
        const responses = questions.map(q => {
            const selected = answers[q.id];
            const isCorrect = selected === q.correct_answer;
            if (isCorrect) score++;
            return {
                question_id: q.id,
                selected_option: selected,
                is_correct: isCorrect
            };
        });

        // 3. Record attempt
        const { data: attempt, error: aError } = await supabase
            .from('quiz_attempts')
            .insert([{
                quiz_id: quizId,
                student_id: req.user.id,
                score,
                total_questions: questions.length,
                time_taken: timeTaken
            }])
            .select()
            .single();

        if (aError) throw aError;

        // 4. Record individual responses
        const responseData = responses.map(r => ({ ...r, attempt_id: attempt.id }));
        await supabase.from('quiz_responses').insert(responseData);

        res.json({ 
            message: 'Quiz submitted successfully', 
            attemptId: attempt.id,
            score,
            total: questions.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/quizzes/student/dashboard
// @desc    Get AI quiz performance for student
router.get('/student/analytics', auth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('quiz_attempts')
            .select('*, quizzes(title, topic)')
            .eq('student_id', req.user.id)
            .order('completed_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
