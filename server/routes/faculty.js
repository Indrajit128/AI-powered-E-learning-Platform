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

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// @route   POST /api/faculty/assignments
// @desc    Save and publish an assignment (Handles AI, Manual, and File Upload)
router.post('/assignments', auth, facultyOnly, upload.single('file'), async (req, res) => {
    // When using multer, text fields are in req.body
    let { title, subject, type, description, batchId, studentId, questionsJson, dueDate } = req.body;
    
    // Parse questionsJson if it's sent as a string (happens in multipart form data)
    if (typeof questionsJson === 'string' && questionsJson !== 'undefined') {
        try {
            questionsJson = JSON.parse(questionsJson);
        } catch (e) {
            console.error('JSON Parse Error:', e);
            questionsJson = null;
        }
    }

    // Convert empty strings or 'undefined' from FormData to null
    const isValidUUID = (id) => id && id !== 'undefined' && id !== 'null' && id !== '' && /^[0-9a-fA-F-]{36}$/.test(id);
    const targetBatch = isValidUUID(batchId) ? batchId : null;
    const targetStudent = isValidUUID(studentId) ? studentId : null;

    try {
        let fileUrl = null;

        // 1. Handle file upload if present
        if (req.file) {
            const fileName = `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('assignments')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true
                });

            if (uploadError) {
                console.error('Storage Error:', uploadError);
                return res.status(400).json({ msg: 'File upload failed: ' + uploadError.message });
            }

            const { data: publicUrlData } = supabase.storage
                .from('assignments')
                .getPublicUrl(fileName);
            
            fileUrl = publicUrlData.publicUrl;
        }

        // 2. Create the assignment
        const insertData = { 
            title: title || 'Untitled Assignment', 
            subject: subject || 'General', 
            type: fileUrl ? 'file' : (type || 'manual'), 
            description: description || '',
            questions_json: questionsJson || null,
            file_url: fileUrl,
            due_date: (dueDate && dueDate !== 'undefined' && dueDate !== '') ? dueDate : null,
            created_by: req.user.id
        };

        const { data: assignment, error: assignmentError } = await supabase
            .from('assignments')
            .insert([insertData])
            .select()
            .single();
        
        if (assignmentError) {
            console.error('Database Error:', assignmentError);
            return res.status(400).json({ msg: 'Failed to save assignment: ' + assignmentError.message });
        }

        // 3. Create target(s)
        if (targetBatch || targetStudent) {
            const { error: targetError } = await supabase
                .from('assignment_targets')
                .insert([{
                    assignment_id: assignment.id,
                    batch_id: targetBatch,
                    student_id: targetStudent
                }]);
            
            if (targetError) {
                console.error('Targeting Error:', targetError);
            }

            if (targetBatch && global.io) {
                global.io.to(`batch_${targetBatch}`).emit('new_assignment', assignment);
            }
        }

        res.json(assignment);
    } catch (err) {
        console.error('Assignment Creation Error:', err);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
});

// @route   GET /api/faculty/all-assignments
// @desc    Get all assignments created by faculty with their targets
router.get('/all-assignments', auth, facultyOnly, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('assignments')
            .select(`
                *,
                assignment_targets (
                    batch_id,
                    batches ( name ),
                    student_id,
                    users!assignment_targets_student_id_fkey ( name, email )
                )
            `)
            .eq('created_by', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   PATCH /api/faculty/grade/:submissionId
// @desc    Grade a student submission
router.patch('/grade/:submissionId', auth, facultyOnly, async (req, res) => {
    const { grade, feedback } = req.body;

    try {
        const { data, error } = await supabase
            .from('submissions')
            .update({ grade, feedback, status: 'graded' })
            .eq('id', req.params.submissionId)
            .select()
            .single();

        if (error) throw error;
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
            .select('*, users!submissions_student_id_fkey(name, email)')
            .eq('assignment_id', req.params.assignmentId);

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/faculty/submissions
// @desc    View all submissions across all assignments by this faculty
router.get('/submissions', auth, facultyOnly, async (req, res) => {
    try {
        const { data: assignments } = await supabase.from('assignments').select('id').eq('created_by', req.user.id);
        const assignmentIds = (assignments || []).map(a => a.id);
        if (assignmentIds.length === 0) return res.json([]);

        const { data, error } = await supabase
            .from('submissions')
            .select('*, users!submissions_student_id_fkey(name, email), assignments(title)')
            .in('assignment_id', assignmentIds)
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        
        // Map data to match what the frontend expects
        const mappedData = (data || []).map(s => ({
            ...s,
            student_name: s.users?.name,
            assignment_title: s.assignments?.title
        }));

        res.json(mappedData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/faculty/assignment-progress/:id
// @desc    Get detailed progress (who completed, who pending) for an assignment
router.get('/assignment-progress/:id', auth, facultyOnly, async (req, res) => {
    try {
        const assignmentId = req.params.id;

        // 1. Get Assignment Details
        const { data: assignment, error: assignmentError } = await supabase
            .from('assignments')
            .select('*')
            .eq('id', assignmentId)
            .single();
        
        if (assignmentError || !assignment) return res.status(404).json({ msg: 'Assignment not found' });

        // 2. Get Targets
        const { data: targets, error: targetsError } = await supabase
            .from('assignment_targets')
            .select('batch_id, student_id')
            .eq('assignment_id', assignmentId);
        
        if (targetsError) throw targetsError;

        // 3. Resolve all unique student IDs from targets
        let targetedStudentIds = new Set();
        
        for (const target of targets) {
            if (target.student_id) {
                targetedStudentIds.add(target.student_id);
            } else if (target.batch_id) {
                const { data: batchStudents } = await supabase
                    .from('batch_students')
                    .select('student_id')
                    .eq('batch_id', target.batch_id);
                
                (batchStudents || []).forEach(bs => targetedStudentIds.add(bs.student_id));
            }
        }

        if (targetedStudentIds.size === 0) return res.json({ assignment, students: [] });

        // 4. Fetch Student details and Submissions
        const { data: students, error: studentsError } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', Array.from(targetedStudentIds));
        
        if (studentsError) throw studentsError;

        const { data: submissions, error: submissionsError } = await supabase
            .from('submissions')
            .select('*')
            .eq('assignment_id', assignmentId);
        
        if (submissionsError) throw submissionsError;

        // 5. Build the final response
        const progress = students.map(student => {
            const submission = submissions.find(s => s.student_id === student.id);
            return {
                id: student.id,
                name: student.name,
                email: student.email,
                status: submission ? (submission.status || 'submitted') : 'pending',
                submitted_at: submission ? submission.submitted_at : null,
                grade: submission ? submission.grade : null,
                submission_id: submission ? submission.id : null
            };
        });

        res.json({
            assignment,
            stats: {
                total: progress.length,
                completed: progress.filter(p => p.status !== 'pending').length,
                pending: progress.filter(p => p.status === 'pending').length
            },
            students: progress
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
