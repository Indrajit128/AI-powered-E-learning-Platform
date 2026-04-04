const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { auth, studentOnly } = require('../middleware/authMiddleware');

// @route   GET /api/student/batches
// @desc    Get all batches the student belongs to
router.get('/batches', auth, studentOnly, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT b.* FROM batches b JOIN batch_students bs ON b.id = bs.batch_id WHERE bs.student_id = $1',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/student/assignments/:batchId
// @desc    Get all assignments for a batch
router.get('/assignments/:batchId', auth, studentOnly, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM assignments WHERE batch_id = $1',
            [req.params.batchId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/student/submissions
// @desc    Submit an assignment
router.post('/submissions', auth, studentOnly, async (req, res) => {
    const { assignmentId, answersJson, score } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO submissions (assignment_id, student_id, answers_json, score) VALUES ($1, $2, $3, $4) RETURNING *',
            [assignmentId, req.user.id, JSON.stringify(answersJson), score]
        );

        // Notify faculty via WebSocket
        if (global.io) {
            const assignment = await db.query('SELECT faculty_id FROM batches b JOIN assignments a ON b.id = a.batch_id WHERE a.id = $1', [assignmentId]);
            if (assignment.rows.length > 0) {
                global.io.to(`faculty_${assignment.rows[0].faculty_id}`).emit('new_submission', result.rows[0]);
            }
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/student/performance
// @desc    Get all scores for the student
router.get('/performance', auth, studentOnly, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT s.score, s.submitted_at, a.title, a.type, a.subject 
             FROM submissions s 
             JOIN assignments a ON s.assignment_id = a.id 
             WHERE s.student_id = $1`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
