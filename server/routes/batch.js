const express = require('express');
const router = express.Router();
const db = require('../db/db');

// @route   GET /api/students
// @desc    Get all students
router.get('/students', async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, email, email_verified, created_at FROM users WHERE role = $1', ['student']);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error retrieving students' });
    }
});

// @route   POST /api/batch/create
// @desc    Create a new batch
router.post('/create', async (req, res) => {
    const { name, course_name, start_date, end_date, faculty_id } = req.body;

    if (!name || !faculty_id) {
        return res.status(400).json({ msg: 'Batch name and faculty ID are required' });
    }

    try {
        const newBatch = await db.query(
            'INSERT INTO batches (name, course_name, start_date, end_date, faculty_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, course_name, start_date, end_date, faculty_id]
        );
        res.json({ msg: 'Batch created successfully', batch: newBatch.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error creating batch' });
    }
});

// @route   POST /api/batch/add-student
// @desc    Assign a student to a batch
router.post('/add-student', async (req, res) => {
    const { batch_id, student_id } = req.body;

    if (!batch_id || !student_id) {
        return res.status(400).json({ msg: 'Batch ID and Student ID are required' });
    }

    try {
        const studentAdded = await db.query(
            'INSERT INTO batch_students (batch_id, student_id) VALUES ($1, $2) ON CONFLICT (batch_id, student_id) DO NOTHING RETURNING *',
            [batch_id, student_id]
        );

        if (studentAdded.rows.length === 0) {
            return res.status(400).json({ msg: 'Student is already in this batch' });
        }

        res.json({ msg: 'Student added to batch successfully', mapping: studentAdded.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error adding student to batch' });
    }
});

// @route   GET /api/batch/faculty/:faculty_id
// @desc    Get batches for a specific faculty
router.get('/faculty/:faculty_id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM batches WHERE faculty_id = $1', [req.params.faculty_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error retrieving faculty batches' });
    }
});

module.exports = router;
