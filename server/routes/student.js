const express = require('express');
const router = express.Router();
const supabase = require('../db/db');
const { auth, studentOnly } = require('../middleware/authMiddleware');

// @route   GET /api/student/batches
// @desc    Get all batches the student belongs to
router.get('/batches', auth, studentOnly, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('batch_students')
            .select('batches(*)')
            .eq('student_id', req.user.id);
        
        if (error) throw error;
        const batches = (data || []).map(row => row.batches).filter(Boolean);
        res.json(batches);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/student/assignments/:batchId
// @desc    Get all assignments for a batch
router.get('/assignments/:batchId', auth, studentOnly, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('assignments')
            .select('*')
            .eq('batch_id', req.params.batchId);
        
        if (error) throw error;
        res.json(data || []);
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
        const { data, error } = await supabase
            .from('submissions')
            .insert([{
                assignment_id: assignmentId,
                student_id: req.user.id,
                answers_json: answersJson,
                score
            }])
            .select()
            .single();

        if (error) throw error;

        // Notify faculty via WebSocket
        if (global.io) {
            const { data: assignment } = await supabase
                .from('assignments')
                .select('batches(faculty_id)')
                .eq('id', assignmentId)
                .maybeSingle();

            if (assignment?.batches?.faculty_id) {
                global.io.to(`faculty_${assignment.batches.faculty_id}`).emit('new_submission', data);
            }
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/student/performance
// @desc    Get all scores for the student
router.get('/performance', auth, studentOnly, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('submissions')
            .select('score, submitted_at, assignments(title, type, subject)')
            .eq('student_id', req.user.id);

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
