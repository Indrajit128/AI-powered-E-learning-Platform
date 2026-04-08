import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  ChevronLeft, 
  Calendar, 
  Trophy, 
  Loader2, 
  Search,
  Mail,
  MoreVertical,
  GraduationCap,
  Plus,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AssignmentProgress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Grading Modal State (Replicated from Dashboard for consistency)
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, [id]);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/faculty/assignment-progress/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    setIsGrading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/faculty/grade/${gradingSubmission.submission_id}`, {
        grade: parseInt(grade),
        feedback
      }, {
        headers: { 'x-auth-token': token }
      });
      
      setGradingSubmission(null);
      setGrade('');
      setFeedback('');
      fetchProgress(); // Refresh data
    } catch (err) {
      console.error('Error grading:', err);
    } finally {
      setIsGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-danger">Data not found.</div>;

  const filteredStudents = data.students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <button 
            onClick={() => navigate('/faculty')}
            className="flex items-center gap-2 text-primary font-bold text-sm mb-4 hover:underline"
          >
            <ChevronLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-4xl font-black tracking-tighter">
            Assignment <span className="text-gradient">Intelligence</span>
          </h1>
          <p className="text-muted-foreground mt-2">Tracking: <strong>{data.assignment.title}</strong></p>
        </div>

        <div className="flex gap-4">
           {/* Stats Summary Area */}
           <div className="glass px-6 py-3 rounded-2xl flex items-center gap-6 border border-border">
              <div className="text-center">
                 <div className="text-xs font-black uppercase text-muted-foreground opacity-60">Completion</div>
                 <div className="text-xl font-black text-primary">{Math.round((data.stats.completed / data.stats.total) * 100)}%</div>
              </div>
              <div className="w-[1px] h-8 bg-border" />
              <div className="text-center">
                 <div className="text-xs font-black uppercase text-muted-foreground opacity-60">Enrolled</div>
                 <div className="text-xl font-black">{data.stats.total}</div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Detail Cards */}
        <div className="lg:col-span-1 space-y-6">
           <div className="card bg-primary/5 border-primary/20">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <Calendar className="text-primary" size={20} /> Parameters
              </h3>
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">SUBMITTED UNTIL</label>
                    <div className="font-bold">{data.assignment.due_date ? new Date(data.assignment.due_date).toLocaleDateString() : 'No Deadline'}</div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">ASSIGNMENT TYPE</label>
                    <div className="font-bold flex items-center gap-2">
                       <Trophy className="text-secondary" size={16} /> {data.assignment.type.toUpperCase()}
                    </div>
                 </div>
                 <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                       "{data.assignment.description || 'No specific instructions provided.'}"
                    </p>
                 </div>
              </div>
           </div>

           <div className="card space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                 <Users className="text-secondary" size={20} /> Attendance Breakdown
              </h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center p-3 rounded-xl bg-success/5 border border-success/10">
                    <div className="flex items-center gap-3">
                       <CheckCircle className="text-success" size={18} />
                       <span className="font-bold text-sm">Completed</span>
                    </div>
                    <span className="text-xl font-black text-success">{data.stats.completed}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <div className="flex items-center gap-3">
                       <Clock className="text-orange-500" size={18} />
                       <span className="font-bold text-sm">Pending</span>
                    </div>
                    <span className="text-xl font-black text-orange-500">{data.stats.pending}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Student Progress List */}
        <div className="lg:col-span-2">
           <div className="card p-0 overflow-hidden min-h-[500px]">
              <div className="p-6 border-b border-border flex justify-between items-center bg-white sticky top-0 z-10">
                 <h3 className="font-bold text-xl">Student Master List</h3>
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search name or email..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                 </div>
              </div>

              <div className="divide-y divide-border">
                 {filteredStudents.map((student, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={student.id} 
                      className="p-4 hover:bg-gray-50 flex items-center justify-between group transition-colors"
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${student.status !== 'pending' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                             {student.name[0]}
                          </div>
                          <div>
                             <div className="font-bold text-foreground">{student.name}</div>
                             <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail size={10} /> {student.email}
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-6">
                          {student.status !== 'pending' ? (
                             <div className="text-right">
                                <div className="flex items-center gap-2 text-success font-black text-xs uppercase tracking-tighter">
                                   <CheckCircle size={14} /> Completed
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                   Scored: <span className="font-bold text-foreground">{student.grade || 'Wait...'}</span>
                                </div>
                             </div>
                          ) : (
                             <div className="flex items-center gap-2 text-muted-foreground font-black text-xs uppercase tracking-tighter opacity-40">
                                <Clock size={14} /> Pending
                             </div>
                          )}

                          {student.status !== 'pending' && (
                             <button 
                               onClick={() => setGradingSubmission(student)}
                               className="p-2 rounded-lg bg-muted group-hover:bg-primary group-hover:text-white transition-all border border-border"
                             >
                                <ArrowRight size={16} />
                             </button>
                          )}
                       </div>
                    </motion.div>
                 ))}

                 {filteredStudents.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground italic">
                       No students match your search criteria.
                    </div>
                 )}
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
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Student: {gradingSubmission.name}</div>
                   </div>
                </div>
                <button onClick={() => setGradingSubmission(null)} className="p-2 border border-border rounded-lg bg-muted hover:bg-white transition-colors">
                  <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
                </button>
              </div>

              <form onSubmit={handleGradeSubmission} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                       <label className="text-xs font-black uppercase text-muted-foreground mb-2 block">Score (0-100)</label>
                       <input 
                         type="number" 
                         max="100" min="0" required
                         value={grade}
                         onChange={e => setGrade(e.target.value)}
                         className="w-full text-center text-2xl font-black bg-muted/30 border-border rounded-xl py-3 focus:ring-2 focus:ring-primary outline-none"
                       />
                    </div>
                    <div className="md:col-span-2">
                       <label className="text-xs font-black uppercase text-muted-foreground mb-2 block">Personalized Feedback</label>
                       <textarea 
                         value={feedback}
                         onChange={e => setFeedback(e.target.value)}
                         placeholder="Excellent reasoning..."
                         className="w-full bg-muted/30 border-border rounded-xl p-4 h-24 focus:ring-2 focus:ring-primary outline-none"
                       />
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setGradingSubmission(null)} className="flex-1 py-4 bg-muted font-bold rounded-2xl hover:bg-gray-200 transition-colors border border-border">Cancel</button>
                    <button type="submit" disabled={isGrading} className="flex-2 py-4 flex items-center justify-center gap-2 primary">
                       {isGrading ? <Loader2 size={24} className="animate-spin" /> : 'Confirm Final Grade'}
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

export default AssignmentProgress;
