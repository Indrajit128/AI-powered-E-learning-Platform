const express = require('express');
const router = express.Router();
const supabase = require('../db/db');
const { auth } = require('../middleware/authMiddleware');

// @route   GET /api/student-assignments/assigned
// @desc    Get all assignments assigned to the student
router.get('/assigned', auth, async (req, res) => {
    try {
        const studentId = req.user.id;

        // 1. Find all batches this student belongs to
        const { data: batchMappings, error: batchError } = await supabase
            .from('batch_students')
            .select('batch_id')
            .eq('student_id', studentId);

        if (batchError) throw batchError;
        const studentBatchIds = (batchMappings || []).map(m => m.batch_id).filter(id => id);

        // 2. Find all assignment IDs targeted to this student OR their batches
        const { data: targets, error: targetError } = await supabase
            .from('assignment_targets')
            .select('assignment_id, student_id, batch_id');

        if (targetError) throw targetError;

        // Local filter to be absolutely sure of the logic
        const myAssignmentIds = (targets || [])
            .filter(t => 
                t.student_id === studentId || 
                (t.batch_id && studentBatchIds.includes(t.batch_id))
            )
            .map(t => t.assignment_id);

        if (myAssignmentIds.length === 0) return res.json([]);

        // 3. Fetch the actual assignments
        const { data: assignments, error: assignmentError } = await supabase
            .from('assignments')
            .select('*')
            .in('id', myAssignmentIds)
            .order('created_at', { ascending: false });

        if (assignmentError) throw assignmentError;

        // 4. Fetch the student's submissions for these assignments
        const { data: submissions, error: submissionError } = await supabase
            .from('submissions')
            .select('*')
            .eq('student_id', studentId)
            .in('assignment_id', myAssignmentIds);

        if (submissionError) throw submissionError;

        // 5. Merge assignments with submissions
        const result = (assignments || []).map(assignment => {
            const submission = (submissions || []).find(s => s.assignment_id === assignment.id);
            return {
                ...assignment,
                submission: submission || null
            };
        });

        res.json(result);
    } catch (err) {
        console.error('Core Visibility Fetch Error:', err);
        res.status(500).json({ msg: 'Failed to load assignments', error: err.message });
    }
});

// @route   GET /api/student-assignments/attempt/:id
// @desc    Get a specific assignment for attempt
router.get('/attempt/:id', auth, async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const studentId = req.user.id;

        // Verify student has access 
        const { data: batches } = await supabase
            .from('batch_students')
            .select('batch_id')
            .eq('student_id', studentId);
            
        const batchIds = batches ? batches.map(b => b.batch_id) : [];

        const { data: targets, error: targetError } = await supabase
            .from('assignment_targets')
            .select('*')
            .eq('assignment_id', assignmentId)
            .or(`student_id.eq.${studentId}${batchIds.length > 0 ? `,batch_id.in.(${batchIds.join(',')})` : ''}`);

        if (targetError || !targets || targets.length === 0) {
            return res.status(403).json({ msg: 'Access denied to this assignment' });
        }

        const { data: assignment, error } = await supabase
            .from('assignments')
            .select('*')
            .eq('id', assignmentId)
            .single();

        if (error || !assignment) return res.status(404).json({ msg: 'Assignment not found' });

        res.json(assignment);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/student-assignments/submit
// @desc    Submit an assignment
router.post('/submit', auth, async (req, res) => {
    const { assignmentId, content, answersJson, score } = req.body;
    const studentId = req.user.id;

    if (!assignmentId || (!content && !answersJson)) {
        return res.status(400).json({ msg: 'Missing assignmentId or submission content' });
    }

    try {
        // Check if already submitted
        const { data: existing, error: checkError } = await supabase
            .from('submissions')
            .select('id')
            .eq('assignment_id', assignmentId)
            .eq('student_id', studentId)
            .maybeSingle();

        if (checkError) throw checkError;

        let status = 'submitted';
        if (score !== undefined) {
            status = 'graded'; // Auto-graded quizzes
        }

        let submissionObj = {
            content: answersJson ? JSON.stringify(answersJson) : (content || ''),
            grade: score !== undefined ? String(score) : null,
            status: status,
            submitted_at: new Date()
        };

        let result;
        if (existing) {
            // Update existing submission
            const { data, error } = await supabase
                .from('submissions')
                .update(submissionObj)
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            result = data;
        } else {
            // Create new submission
            const { data, error } = await supabase
                .from('submissions')
                .insert([{
                    assignment_id: assignmentId,
                    student_id: studentId,
                    ...submissionObj
                }])
                .select()
                .single();
            if (error) throw error;
            result = data;
        }
        // Find faculty id to emit
        const { data: assignmentData } = await supabase
            .from('assignments')
            .select('created_by, title')
            .eq('id', assignmentId)
            .single();

        if (assignmentData && global.io) {
            // Emitting to specific faculty's room
            global.io.to(`faculty_${assignmentData.created_by}`).emit('new_submission', {
                ...result,
                assignment_title: assignmentData.title,
                student_name: req.user.name || 'A Student'
            });
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
