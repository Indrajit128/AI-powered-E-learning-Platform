const express = require('express');
const router = express.Router();
const supabase = require('../db/db');

// @route   GET /api/batch/students
// @desc    Get all students
router.get('/students', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, email_verified, created_at')
            .eq('role', 'student');

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error('Get students error:', err);
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
        const { data, error } = await supabase
            .from('batches')
            .insert([{ name, course_name, start_date, end_date, faculty_id }])
            .select()
            .single();

        if (error) throw error;
        res.json({ msg: 'Batch created successfully', batch: data });
    } catch (err) {
        console.error('Create batch error:', err);
        res.status(500).json({ msg: `Server error creating batch: ${err.message}` });
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
        // Check if already in batch
        const { data: existing } = await supabase
            .from('batch_students')
            .select('id')
            .eq('batch_id', batch_id)
            .eq('student_id', student_id)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({ msg: 'Student is already in this batch' });
        }

        const { data, error } = await supabase
            .from('batch_students')
            .insert([{ batch_id, student_id }])
            .select()
            .single();

        if (error) throw error;
        res.json({ msg: 'Student added to batch successfully', mapping: data });
    } catch (err) {
        console.error('Add student error:', err);
        res.status(500).json({ msg: `Server error: ${err.message}` });
    }
});

// @route   GET /api/batch/faculty/:faculty_id
// @desc    Get batches for a specific faculty
router.get('/faculty/:faculty_id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('batches')
            .select('*')
            .eq('faculty_id', req.params.faculty_id);

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error('Get faculty batches error:', err);
        res.status(500).json({ msg: 'Server error retrieving faculty batches' });
    }
});

// @route   GET /api/batch/all
// @desc    Get all batches
router.get('/all', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('batches')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
