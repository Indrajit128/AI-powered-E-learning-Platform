const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { auth, facultyOnly } = require('../middleware/authMiddleware');
const { generateAssignment } = require('../services/aiService');

// @route   POST /api/faculty/batches
// @desc    Create a new batch
router.post('/batches', auth, facultyOnly, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ msg: 'Batch name is required' });

    try {
        const result = await db.query(
            'INSERT INTO batches (name, faculty_id) VALUES ($1, $2) RETURNING *',
            [name, req.user.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/faculty/batches
// @desc    Get all batches for a faculty
router.get('/batches', auth, facultyOnly, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM batches WHERE faculty_id = $1', [req.user.id]);
        res.json(result.rows);
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
        const user = await db.query('SELECT id FROM users WHERE email = $1 AND role = $2', [email, 'student']);
        if (user.rows.length === 0) return res.status(404).json({ msg: 'Student not found' });

        const studentId = user.rows[0].id;
        await db.query(
            'INSERT INTO batch_students (batch_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [batchId, studentId]
        );
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
        const result = await db.query(
            'INSERT INTO assignments (title, subject, type, batch_id, questions_json) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, subject, type, batchId, JSON.stringify(questionsJson)]
        );
        
        // Notify students in the batch via WebSocket (to be implemented in index.js)
        if (global.io) {
            global.io.to(`batch_${batchId}`).emit('new_assignment', result.rows[0]);
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/faculty/submissions/:assignmentId
// @desc    View all submissions for an assignment
router.get('/submissions/:assignmentId', auth, facultyOnly, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT s.*, u.name as student_name, u.email as student_email 
             FROM submissions s 
             JOIN users u ON s.student_id = u.id 
             WHERE s.assignment_id = $1`,
            [req.params.assignmentId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
