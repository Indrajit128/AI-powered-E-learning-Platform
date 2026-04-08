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
  GraduationCap,
  Zap,
  Sparkles
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
      <div className="flex items-center justify-center min-h-[80vh] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <Loader2 className="animate-spin text-primary relative z-10" size={48} />
      </div>
    );
  }

  const stats = [
    { label: 'Total Students', value: students.length, icon: <Users size={22} />, color: 'var(--primary)', glow: 'rgba(var(--primary), 0.4)' },
    { label: 'Active Batches', value: batches.length, icon: <BookOpen size={22} />, color: 'var(--success)', glow: 'rgba(var(--success), 0.4)' },
    { label: 'Assignments', value: assignments.length, icon: <ClipboardList size={22} />, color: 'var(--warning)', glow: 'rgba(var(--warning), 0.4)' },
    { label: 'Pending Grading', value: submissions.filter(s => s.status === 'submitted').length, icon: <AlertCircle size={22} />, color: 'var(--destructive)', glow: 'rgba(var(--destructive), 0.4)' },
  ];

  return (
    <div className="relative min-h-screen pb-12 overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-[-5%] left-[5%] w-[35%] h-[35%] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[25%] h-[25%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl bg-background/40 p-8 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-400">Faculty</span> Dashboard
              <Sparkles size={32} className="text-primary animate-pulse ml-2" />
            </h1>
            <p className="text-muted-foreground mt-2 font-medium tracking-wide">Command center for cutting-edge education.</p>
          </div>
          <div className="flex flex-wrap gap-4 relative z-10">
            <Link to="/faculty/create-batch" className="relative group overflow-hidden px-6 py-3 rounded-2xl font-bold text-sm bg-background/60 backdrop-blur-md border border-white/10 dark:border-white/5 hover:border-primary/50 transition-all shadow-xl flex items-center gap-2">
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
              <Users size={18} className="text-primary" /> New Batch
            </Link>
            <Link to="/faculty/create-assignment" className="relative group overflow-hidden px-6 py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-primary to-purple-600 text-white shadow-[0_0_30px_-5px_rgba(var(--primary),0.5)] hover:shadow-[0_0_40px_-5px_rgba(var(--primary),0.7)] hover:scale-[1.02] transition-all flex items-center gap-2 tracking-wide">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Zap size={18} className="group-hover:animate-bounce" /> AI Assignment
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1, type: "spring" }}
              key={i} 
              className="relative p-6 rounded-[2rem] bg-background/60 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-xl group hover:border-primary/30 transition-all duration-500 overflow-hidden cursor-default"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ backgroundColor: stat.color }} />
              <div className="flex items-center gap-5 relative z-10">
                <div className="p-4 rounded-2xl shadow-inner border border-white/5" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black tracking-tighter text-foreground/90">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1.5 bg-background/50 backdrop-blur-xl rounded-2xl w-fit border border-white/10 dark:border-white/5 shadow-lg">
          {['overview', 'assignments', 'students', 'batches'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab 
                ? 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-xl scale-105' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div 
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.3 }}
           className="space-y-6"
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-background/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors duration-700" />
                  
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black flex items-center gap-3 tracking-tighter">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <TrendingUp size={24} />
                      </div>
                      Needs Attention
                    </h3>
                    <button onClick={() => setActiveTab('assignments')} className="text-xs font-black tracking-widest uppercase text-primary hover:text-primary/70 transition-colors">View All Directory</button>
                  </div>
                  
                  <div className="space-y-4">
                    {submissions.filter(s => s.status === 'submitted').slice(0, 5).map((sub, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={sub.id} 
                        className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 border border-border/50 group/item hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-xl text-primary border border-primary/20 shadow-inner group-hover/item:scale-110 transition-transform">
                            {sub.student_name?.[0] || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-base tracking-tight text-foreground/90">{sub.student_name}</p>
                            <p className="text-xs font-semibold text-muted-foreground truncate max-w-[250px]">{sub.assignment_title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hidden sm:block">{new Date(sub.submitted_at).toLocaleDateString()}</span>
                          <button 
                            onClick={() => setGradingSubmission(sub)}
                            className="px-6 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-white shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
                          >
                            Grade Now
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    {submissions.filter(s => s.status === 'submitted').length === 0 && (
                      <div className="text-center py-12 px-4 relative">
                        <div className="absolute inset-0 bg-success/5 rounded-3xl blur-xl" />
                        <CheckCircle size={48} className="mx-auto mb-4 text-success drop-shadow-[0_0_15px_rgba(var(--success),0.5)] animate-pulse" />
                        <p className="text-xl font-black tracking-tighter">All Clear!</p>
                        <p className="text-sm font-medium text-muted-foreground mt-1">You have no pending assignments to grade.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex flex-col h-full">
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-warning/10 via-background/60 to-background/60 backdrop-blur-2xl border border-warning/20 shadow-2xl relative overflow-hidden flex-1">
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-warning/10 rounded-full blur-3xl -z-10" />
                  
                  <h3 className="text-xl font-black mb-8 tracking-tighter flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-warning/20 text-warning">
                      <Trophy size={22} />
                    </div>
                    Quick Actions
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <button onClick={() => navigate('/faculty/create-assignment')} className="w-full relative overflow-hidden group bg-background/50 backdrop-blur-md border border-white/5 py-5 px-6 rounded-2xl hover:border-primary/50 transition-all flex items-center gap-4 shadow-sm hover:shadow-xl">
                      <div className="absolute inset-0 w-0 bg-primary/5 transition-all duration-[400ms] ease-out group-hover:w-full" />
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-inner relative z-10"><Zap size={20}/></div>
                      <span className="font-bold tracking-wide relative z-10">Trigger AI Quiz</span>
                    </button>
                    <button onClick={() => navigate('/faculty/create-batch')} className="w-full relative overflow-hidden group bg-background/50 backdrop-blur-md border border-white/5 py-5 px-6 rounded-2xl hover:border-success/50 transition-all flex items-center gap-4 shadow-sm hover:shadow-xl">
                      <div className="absolute inset-0 w-0 bg-success/5 transition-all duration-[400ms] ease-out group-hover:w-full" />
                      <div className="p-2.5 rounded-xl bg-success/10 text-success shadow-inner relative z-10"><Users size={20}/></div>
                      <span className="font-bold tracking-wide relative z-10">Initialize Batch</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="p-8 rounded-[2.5rem] bg-background/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 relative z-10">
                 <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                   Assignment <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Repository</span>
                 </h2>
                 <div className="relative group/search">
                   <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg opacity-0 group-hover/search:opacity-100 transition-opacity" />
                   <div className="relative">
                     <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                     <input 
                      type="text" 
                      placeholder="Filter contents..."
                      className="pl-12 pr-6 py-3 w-full md:w-64 bg-background/80 backdrop-blur-md border border-border/50 focus:border-primary/50 focus:ring-4 ring-primary/10 rounded-2xl text-sm font-semibold outline-none transition-all shadow-inner"
                     />
                   </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {assignments.map((a, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.05, type: "spring" }}
                    key={a.id} 
                    className="p-6 rounded-[2rem] bg-muted/10 backdrop-blur-md border border-border/50 group hover:border-primary/40 hover:bg-background/80 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/10 group-hover:bg-primary transition-colors duration-300" />
                    
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-muted rounded-xl transition-colors"><MoreVertical size={18} /></button>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-5">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-inner">{a.subject}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-muted text-muted-foreground border border-border/50">{a.type}</span>
                      </div>
                      <h4 className="text-xl font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors">{a.title}</h4>
                      <p className="text-xs font-medium text-muted-foreground/80 mt-3 line-clamp-2 leading-relaxed">{a.description || 'No direct instructions compiled.'}</p>
                    </div>
                    
                    <div className="mt-8 pt-5 border-t border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                           {[1,2].map(i => <div key={i} className="w-7 h-7 rounded-full bg-background border-2 border-muted flex items-center justify-center text-[8px] font-black text-muted-foreground shadow-sm">T{i}</div>)}
                           <div className="w-7 h-7 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[8px] font-black text-primary shadow-sm">+</div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Targeted</span>
                      </div>
                      <button className="p-2.5 rounded-full bg-background border border-border/50 text-muted-foreground group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
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
              className="absolute inset-0 bg-background/80 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl relative z-60 p-8 rounded-[2.5rem] bg-background/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_-10px_rgba(var(--primary),0.3)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                     <GraduationCap size={24}/>
                   </div>
                   <div>
                     <h3 className="text-2xl font-black tracking-tight text-foreground/90">Evaluate Intel</h3>
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">Target: <span className="font-black text-primary">{gradingSubmission.student_name}</span></p>
                   </div>
                </div>
                <button onClick={() => setGradingSubmission(null)} className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl transition-colors">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 pl-1">Submitted Content</h4>
                    <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 text-sm font-medium leading-relaxed max-h-48 overflow-y-auto custom-scrollbar shadow-inner text-foreground/80">
                      {gradingSubmission.content}
                    </div>
                 </div>

                 <form onSubmit={handleGradeSubmission} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                       <div className="sm:col-span-1 space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Score Matrix</label>
                         <input 
                           type="number" 
                           max="100" 
                           min="0" 
                           value={grade}
                           onChange={(e) => setGrade(e.target.value)}
                           className="w-full bg-background/50 border border-border focus:border-primary/50 rounded-xl px-4 py-4 text-center font-black text-2xl focus:ring-4 ring-primary/10 transition-all outline-none shadow-inner" 
                           placeholder="00"
                           required
                         />
                       </div>
                       <div className="sm:col-span-3 space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Tactical Feedback</label>
                         <textarea 
                           className="w-full bg-background/50 border border-border focus:border-primary/50 rounded-xl px-4 py-3 text-sm focus:ring-4 ring-primary/10 transition-all outline-none resize-none h-20 shadow-inner" 
                           placeholder="Excellent logical reasoning..."
                           value={feedback}
                           onChange={(e) => setFeedback(e.target.value)}
                         />
                       </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-border/40">
                      <button 
                        type="button"
                        onClick={() => setGradingSubmission(null)}
                        className="flex-1 bg-muted/50 hover:bg-muted border border-border/50 font-bold text-sm py-4 rounded-xl transition-colors"
                      >
                        ABORT
                      </button>
                      <button 
                        type="submit"
                        disabled={isGrading}
                        className="flex-[2] bg-gradient-to-r from-primary to-purple-600 text-white font-black text-sm tracking-widest uppercase py-4 rounded-xl shadow-[0_0_25px_-5px_rgba(var(--primary),0.5)] hover:shadow-[0_0_35px_-5px_rgba(var(--primary),0.7)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all disabled:pointer-events-none"
                      >
                        {isGrading ? <Loader2 className="animate-spin mx-auto" /> : 'CONFIRM PROTOCOL'}
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
