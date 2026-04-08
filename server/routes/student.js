const express = require('express');
const router = express.Router();
const supabase = require('../db/db');
const { auth, studentOnly } = require('../middleware/authMiddleware');
const { generateStudyPlanAI } = require('../services/geminiService');

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

// @route   GET /api/student/study-plan
// @desc    Generate personalized AI study plan
router.get('/study-plan', auth, studentOnly, async (req, res) => {
    try {
        // Fetch last 10 performances
        const { data, error } = await supabase
            .from('submissions')
            .select('score, assignments(title, subject)')
            .eq('student_id', req.user.id)
            .order('submitted_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        let performanceSummary = "Student context:\n";
        if (data && data.length > 0) {
            data.forEach((sub, i) => {
                performanceSummary += `Assignment: ${sub.assignments?.title || 'Unknown'} (Subject: ${sub.assignments?.subject || 'General'}), Score: ${sub.score || 0}%\n`;
            });
        } else {
            performanceSummary += "No previous assignments completed. Please provide a general introductory study plan for a new computer science student focusing on basics.";
        }

        const aiResponseText = await generateStudyPlanAI(performanceSummary);
        
        let planData;
        try {
            planData = JSON.parse(aiResponseText);
        } catch(e) {
            console.error("AI returned invalid JSON", aiResponseText);
            // Fallback object safely matching Expected UI
            planData = { 
                summary: "You are doing great but we couldn't load specific insights right now.", 
                strengths: ["Persistence", "Learning"], 
                weaknesses: ["Adaptability"], 
                plan: [{day: "Today", focus: "General Practice", action: "Keep checking back!"}]
            };
        }

        res.json(planData);
    } catch (err) {
        console.error("Study Plan Generator Error", err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
