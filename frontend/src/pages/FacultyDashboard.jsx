import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Plus, 
  Search, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  ChevronRight,
  MoreVertical,
  Calendar,
  ClipboardList,
  Trophy,
  Loader2,
  GraduationCap,
  Zap,
  Target,
  Flame,
  Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const FacultyDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            socket.emit('join_faculty', payload.user.id);
        } catch(e) {}
    }

    socket.on('new_submission', (submission) => {
      setSubmissions(prev => {
        const exists = prev.find(s => s.id === submission.id);
        if (exists) {
            return prev.map(s => s.id === submission.id ? submission : s);
        }
        return [submission, ...prev];
      });
    });

    return () => socket.disconnect();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      
      const [batchesRes, studentsRes, assignmentsRes, submissionsRes] = await Promise.all([
        axios.get('/api/faculty/batches', { headers }),
        axios.get('/api/faculty/students', { headers }),
        axios.get('/api/faculty/all-assignments', { headers }),
        axios.get('/api/faculty/submissions', { headers })
      ]);

      setBatches(batchesRes.data || []);
      setStudents(studentsRes.data || []);
      setAssignments(assignmentsRes.data || []);
      setSubmissions(submissionsRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    setIsGrading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/faculty/grade/${gradingSubmission.id}`, {
        grade: parseInt(grade),
        feedback
      }, {
        headers: { 'x-auth-token': token }
      });
      
      setGradingSubmission(null);
      setGrade('');
      setFeedback('');
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error grading:', err);
    } finally {
      setIsGrading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  const classMasteryData = [
    { subject: 'Logic', A: 78, fullMark: 100 },
    { subject: 'Syntax', A: 85, fullMark: 100 },
    { subject: 'Algorithms', A: 60, fullMark: 100 },
    { subject: 'Networking', A: 72, fullMark: 100 },
    { subject: 'Participation', A: 90, fullMark: 100 },
  ];

  const roadmapSteps = [
    { name: 'Onboarding', status: 'completed', icon: <CheckCircle size={18} /> },
    { name: 'Core Concepts', status: 'completed', icon: <CheckCircle size={18} /> },
    { name: 'Advanced Labs', status: 'current', icon: <Target size={18} /> },
    { name: 'Mid-Term', status: 'locked', icon: <Calendar size={18} /> },
    { name: 'Final Project', status: 'locked', icon: <Trophy size={18} /> },
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Header Section Matches Student Dashboard */}
      <div className="flex-responsive" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em' }}>
            Faculty <span className="text-gradient">Command Center</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>
             You have {submissions.filter(s => s.status === 'submitted').length} assignments pending review.
          </p>
        </div>
        
        <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
           <div className="glass" style={{ padding: '0.75rem 1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Star fill="#f59e0b" color="#f59e0b" size={20} />
              <div style={{ fontWeight: '800', fontSize: '1.25rem' }}>Lvl 8 Mentor</div>
           </div>
           <div className="glass" style={{ padding: '0.75rem 1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Flame color="#f97316" fill="#f97316" size={20} />
              <div style={{ fontWeight: '800', fontSize: '1.25rem' }}>24 Day Streak</div>
           </div>
        </div>
      </div>

      {/* Roadmap Section */}
      <section className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Target size={20} color="var(--primary)" /> Active Batch Progression
        </h3>
        <div className="journey-roadmap">
          {roadmapSteps.map((step, i) => (
            <div key={i} className="journey-node">
              <div className="journey-icon" style={{ 
                borderColor: step.status === 'locked' ? 'var(--border)' : 'var(--primary)',
                color: step.status === 'locked' ? 'var(--text-muted)' : (step.status === 'completed' ? 'white' : 'var(--primary)'),
                background: step.status === 'completed' ? 'var(--primary)' : 'white'
              }}>
                {step.icon}
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: step.status === 'locked' ? 'var(--text-muted)' : 'var(--text-main)' }}>{step.name}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-layout faculty">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Top Actions Link - Like Student Quick Links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <Link to="/faculty/create-batch" style={{ textDecoration: 'none' }}>
              <div className="card stat-card" style={{ textAlign: 'center', padding: '1.25rem', borderColor: 'var(--primary)', background: '#4f46e505' }}>
                <Users size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Manage Batches ({batches.length})</div>
              </div>
            </Link>
            <Link to="/faculty/challenges" style={{ textDecoration: 'none' }}>
              <div className="card stat-card" style={{ textAlign: 'center', padding: '1.25rem', borderColor: '#ec4899', background: '#ec489905' }}>
                <Activity size={24} color="#ec4899" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Live Challenges</div>
              </div>
            </Link>
            <Link to="/faculty/create-assignment" style={{ textDecoration: 'none' }}>
              <div className="card stat-card" style={{ textAlign: 'center', padding: '1.25rem', borderColor: 'var(--secondary)', background: '#0ea5e905' }}>
                <Zap size={24} color="var(--secondary)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>AI Quiz Maker</div>
              </div>
            </Link>
          </div>

          {/* Pending Reviews Section */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} color="var(--primary)" /> Action Required: Grading
                </h3>
            </div>
            <div>
              {submissions.filter(s => s.status === 'submitted').slice(0, 5).map((sub, i) => (
                 <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                     <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#4f46e510', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.25rem' }}>
                          {sub.student_name?.[0] || 'S'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-main)' }}>{sub.student_name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sub.assignment_title}</div>
                        </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                        <button onClick={() => setGradingSubmission(sub)} style={{ borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.85rem', background: '#4f46e515', color: 'var(--primary)', fontWeight: '700' }}>
                           Grade Now
                        </button>
                     </div>
                 </div>
              ))}
              {submissions.filter(s => s.status === 'submitted').length === 0 && (
                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                   <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '1rem', opacity: 0.5 }} />
                   <h3 style={{ margin: 0, color: 'var(--text-main)' }}>All Clear!</h3>
                   <p style={{ color: 'var(--text-muted)' }}>No assignments are waiting for review.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Recommended Teaching Insight */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <Zap size={24} fill="white" />
                  <h3 style={{ margin: 0 }}>MentAI Class Insight</h3>
                </div>
                <p style={{ fontSize: '1.1rem', opacity: 0.95, lineHeight: '1.6', maxWidth: '80%' }}>
                   "Students are struggling with <strong>Pointer Arithmetic</strong>. Class average is down 12%. 
                   Consider scheduling a quick 15-minute supplementary live quiz!"
                </p>
                <Link to="/faculty/create-assignment">
                   <button style={{ background: 'white', color: '#059669', border: 'none', marginTop: '1.5rem', fontWeight: '800' }}>Create Quiz Now</button>
                </Link>
             </div>
             <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.15 }}>
                <TrendingUp size={200} />
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
           {/* General Stat Cards */}
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                 <div style={{ background: '#4f46e510', color: 'var(--primary)', padding: '0.75rem', borderRadius: '12px' }}><Users size={20} /></div>
                 <div><div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{students.length}</div><div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>CADETS</div></div>
              </div>
              <div className="card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                 <div style={{ background: '#f59e0b10', color: '#f59e0b', padding: '0.75rem', borderRadius: '12px' }}><ClipboardList size={20} /></div>
                 <div><div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{assignments.length}</div><div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>TASKS</div></div>
              </div>
           </div>

           {/* Radar Chart (Class Mastery) */}
           <div className="card" style={{ height: '350px' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="var(--primary)" /> Class Average Mastery
            </h3>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={classMasteryData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--text-muted)', fontSize: 10}} />
                  <Radar
                    name="Class"
                    dataKey="A"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="#0ea5e9"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
           </div>

           {/* Upcoming Important Events */}
           <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--primary)" /> Upcoming Objectives
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="activity-item">
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Grade Networking Projects</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due Today</div>
              </div>
              <div className="activity-item">
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Masterclass Session #4</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tomorrow, 10:00 AM</div>
              </div>
              <div className="activity-item" style={{ borderLeft: 'none' }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Upload Mid-Term Syllabus</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>In 3 Days</div>
              </div>
            </div>
           </div>
        </div>
      </div>

      {/* Grading Modal */}
      <AnimatePresence>
        {gradingSubmission && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', borderRadius: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <div style={{ padding: '0.75rem', background: '#4f46e510', color: 'var(--primary)', borderRadius: '12px' }}><GraduationCap size={24} /></div>
                   <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Evaluate Submission</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target: {gradingSubmission.student_name}</div>
                   </div>
                </div>
                <button onClick={() => setGradingSubmission(null)} style={{ background: 'transparent', color: 'var(--text-muted)', padding: '0.5rem', border: '1px solid var(--border)' }}>
                  <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                 <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>SUBMITTED CONTENT</label>
                 <div style={{ background: '#f8fafc', border: '1px solid var(--border)', padding: '1rem', borderRadius: '12px', maxHeight: '150px', overflowY: 'auto', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {gradingSubmission.content}
                 </div>
              </div>

              <form onSubmit={handleGradeSubmission} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem' }}>
                    <div>
                       <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>SCORE (0-100)</label>
                       <input 
                         type="number" 
                         max="100" min="0" required
                         value={grade}
                         onChange={e => setGrade(e.target.value)}
                         style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '1.25rem', fontWeight: '800', textAlign: 'center' }}
                       />
                    </div>
                    <div>
                       <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>FEEDBACK</label>
                       <textarea 
                         value={feedback}
                         onChange={e => setFeedback(e.target.value)}
                         placeholder="Great logic here..."
                         style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '12px', minHeight: '80px', resize: 'none', fontFamily: 'inherit' }}
                       />
                    </div>
                 </div>

                 <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setGradingSubmission(null)} style={{ flex: 1, background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>Cancel</button>
                    <button type="submit" disabled={isGrading} style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                       {isGrading ? <Loader2 size={20} className="animate-spin" /> : 'Confirm Grade'}
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacultyDashboard;
