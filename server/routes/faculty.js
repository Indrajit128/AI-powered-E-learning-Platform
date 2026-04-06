const express = require('express');
const router = express.Router();
const supabase = require('../db/db');
const { auth, facultyOnly } = require('../middleware/authMiddleware');
const { generateAssignment } = require('../services/aiService');

// @route   GET /api/faculty/batches
// @desc    Get all batches for the logged-in faculty
router.get('/batches', auth, facultyOnly, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('batches')
            .select('*')
            .eq('faculty_id', req.user.id);
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/faculty/batches
// @desc    Create a new batch
router.post('/batches', auth, facultyOnly, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ msg: 'Batch name is required' });

    try {
        const { data, error } = await supabase
            .from('batches')
            .insert([{ name, faculty_id: req.user.id }])
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/faculty/students
// @desc    Get all registered students
router.get('/students', auth, facultyOnly, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, email_verified, created_at')
            .eq('role', 'student');
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/faculty/batches/:id/students
// @desc    Add a student to a batch by email
router.post('/batches/:id/students', auth, facultyOnly, async (req, res) => {
    const { email } = req.body;
    const batchId = req.params.id;

    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .eq('role', 'student')
            .maybeSingle();

        if (userError || !user) return res.status(404).json({ msg: 'Student not found' });

        const { error } = await supabase
            .from('batch_students')
            .insert([{ batch_id: batchId, student_id: user.id }]);
        
        if (error && !error.message.includes('duplicate')) throw error;
        res.json({ msg: 'Student added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/faculty/generate-assignment
// @desc    Generate assignment using AI
router.post('/generate-assignment', auth, facultyOnly, async (req, res) => {
    const { subject, type, level } = req.body;

    try {
        const questions = await generateAssignment(subject, type, level);
        res.json({ questions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'AI Generation failed', error: err.message });
    }
});

// @route   POST /api/faculty/assignments
// @desc    Save and publish an assignment
router.post('/assignments', auth, facultyOnly, async (req, res) => {
    const { title, subject, type, batchId, questionsJson } = req.body;

    try {
        const { data, error } = await supabase
            .from('assignments')
            .insert([{ title, subject, type, batch_id: batchId, questions_json: questionsJson }])
            .select()
            .single();
        
        if (error) throw error;

        if (global.io) {
            global.io.to(`batch_${batchId}`).emit('new_assignment', data);
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/faculty/submissions/:assignmentId
// @desc    View all submissions for an assignment
router.get('/submissions/:assignmentId', auth, facultyOnly, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('submissions')
            .select('*, users(name, email)')
            .eq('assignment_id', req.params.assignmentId);

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
