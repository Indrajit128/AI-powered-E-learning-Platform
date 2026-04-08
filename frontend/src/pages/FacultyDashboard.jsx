import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  ChevronRight,
  MoreVertical,
  Calendar,
  ClipboardList,
  Trophy,
  Loader2,
  Trash2,
  Edit,
  GraduationCap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const FacultyDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, assignments, students, batches
  const [searchTerm, setSearchTerm] = useState('');
  
  // Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();

    // Socket.io for Real-time features
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    // Auth token contains user id, we will decode it minimally to join the faculty room
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            socket.emit('join_faculty', payload.user.id);
        } catch(e) {}
    }

    socket.on('new_submission', (submission) => {
      setSubmissions(prev => {
        // If it already exists (e.g. an update), replace it
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
        axios.get('/api/faculty/assignments', { headers }),
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
      alert('Submission graded successfully!');
    } catch (err) {
      console.error('Error grading:', err);
      alert('Failed to submit grade.');
    } finally {
      setIsGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const stats = [
    { label: 'Total Students', value: students.length, icon: <Users size={20} />, color: '#3b82f6' },
    { label: 'Active Batches', value: batches.length, icon: <BookOpen size={20} />, color: '#10b981' },
    { label: 'Assignments', value: assignments.length, icon: <ClipboardList size={20} />, color: '#f59e0b' },
    { label: 'Pending Grading', value: submissions.filter(s => s.status === 'submitted').length, icon: <AlertCircle size={20} />, color: '#ef4444' },
  ];

  return (
    <div className="fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight"><span className="text-gradient">Faculty</span> Dashboard</h1>
          <p className="text-muted-foreground mt-1">Empowering educators with AI-driven tools.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/faculty/create-batch" className="glass flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-border">
            <Plus size={18} /> New Batch
          </Link>
          <Link to="/faculty/create-assignment" className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-primary text-white shadow-lg shadow-primary/25 hover:scale-[1.02] transition-all">
            <Plus size={18} /> Create Assignment
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="card group hover:border-primary/50 transition-all cursor-default overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-current opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-500" style={{ color: stat.color }} />
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1 bg-muted/50 rounded-2xl w-fit border border-border">
        {['overview', 'assignments', 'students', 'batches'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
              activeTab === tab 
              ? 'bg-background shadow-sm text-primary' 
              : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter"><TrendingUp size={24} className="text-primary"/> Recent Submissions</h3>
                  <button onClick={() => setActiveTab('assignments')} className="text-xs font-bold text-primary hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {submissions.filter(s => s.status === 'submitted').slice(0, 5).map((sub, i) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/50 group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {sub.student_name?.[0] || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{sub.student_name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{sub.assignment_title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{new Date(sub.submitted_at).toLocaleDateString()}</span>
                        <button 
                          onClick={() => setGradingSubmission(sub)}
                          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                        >
                          Grade
                        </button>
                      </div>
                    </div>
                  ))}
                  {submissions.filter(s => s.status === 'submitted').length === 0 && (
                    <div className="text-center py-8 opacity-50">
                      <CheckCircle size={32} className="mx-auto mb-2" />
                      <p className="text-sm font-medium">All caught up! No pending submissions.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="text-xl font-black mb-6 uppercase tracking-tighter flex items-center gap-2"><Trophy size={22} className="text-warning"/> Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button onClick={() => navigate('/faculty/create-assignment')} className="w-full justify-start glass py-4 px-6 font-bold hover:scale-[1.02] transition-all flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary"><Zap size={18}/></div>
                    Launch AI Quiz
                  </button>
                  <button onClick={() => navigate('/faculty/create-batch')} className="w-full justify-start glass py-4 px-6 font-bold hover:scale-[1.02] transition-all flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10 text-success"><Users size={18}/></div>
                    New Batch Setup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="card">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black tracking-tight">Assignment <span className="text-primary">Repository</span></h2>
               <div className="relative">
                 <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                 <input 
                  type="text" 
                  placeholder="Filter assignments..."
                  className="pl-10 pr-4 py-2 bg-muted/50 border-none rounded-xl text-sm focus:ring-2 ring-primary transition-all shadow-inner"
                 />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((a, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={a.id} 
                  className="p-6 rounded-3xl bg-muted/10 border border-border group hover:border-primary/30 transition-all flex flex-col justify-between h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-muted rounded-lg"><MoreVertical size={16} /></button>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary">{a.subject}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-muted text-muted-foreground">{a.type}</span>
                    </div>
                    <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{a.title}</h4>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{a.description || 'No instructions provided.'}</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                         {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-bold">U{i}</div>)}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">Targeted</span>
                    </div>
                    <button className="p-2 rounded-full bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Other tabs would go here (Students, Batches) */}
      </div>

      {/* Grading Modal */}
      <AnimatePresence>
        {gradingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setGradingSubmission(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card w-full max-w-2xl relative z-60 shadow-2xl border-primary/20"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-xl bg-primary/10 text-primary"><GraduationCap size={24}/></div>
                   <div>
                     <h3 className="text-2xl font-black tracking-tight">Evaluate Work</h3>
                     <p className="text-xs text-muted-foreground">Student: <span className="font-bold text-foreground">{gradingSubmission.student_name}</span></p>
                   </div>
                </div>
                <button onClick={() => setGradingSubmission(null)} className="p-2 hover:bg-muted rounded-full">
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Assignment Content</h4>
                    <div className="p-4 rounded-2xl bg-muted/30 border border-border text-sm leading-relaxed max-h-48 overflow-y-auto">
                      {gradingSubmission.content}
                    </div>
                 </div>

                 <form onSubmit={handleGradeSubmission} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                       <div className="sm:col-span-1 space-y-2">
                         <label className="text-xs font-black uppercase tracking-widest">Score (0-100)</label>
                         <input 
                           type="number" 
                           max="100" 
                           min="0" 
                           value={grade}
                           onChange={(e) => setGrade(e.target.value)}
                           className="w-full font-black text-xl text-center" 
                           placeholder="0"
                           required
                         />
                       </div>
                       <div className="sm:col-span-3 space-y-2">
                         <label className="text-xs font-black uppercase tracking-widest">Feedback Message</label>
                         <textarea 
                           className="w-full h-12 min-h-0 py-3 text-sm" 
                           placeholder="Great insights, keep it up!"
                           value={feedback}
                           onChange={(e) => setFeedback(e.target.value)}
                         />
                       </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setGradingSubmission(null)}
                        className="flex-1 glass font-bold py-3"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isGrading}
                        className="flex-[2] bg-primary text-white font-black py-3 shadow-xl shadow-primary/25 disabled:opacity-50"
                      >
                        {isGrading ? <Loader2 className="animate-spin mx-auto" /> : 'CONFIRM GRADE'}
                      </button>
                    </div>
                 </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacultyDashboard;
