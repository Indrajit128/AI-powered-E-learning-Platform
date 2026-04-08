import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  FileText,
  Send,
  Loader2,
  Trophy,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, submitted, graded
  const [submitting, setSubmitting] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/student-assignments/assigned', {
        headers: { 'x-auth-token': token }
      });
      setAssignments(res.data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionText.trim()) return;
    
    setSubmitting(selectedAssignment.id);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/student-assignments/submit', {
        assignmentId: selectedAssignment.id,
        content: submissionText
      }, {
        headers: { 'x-auth-token': token }
      });
      
      // Refresh list
      await fetchAssignments();
      setSelectedAssignment(null);
      setSubmissionText('');
      alert('Assignment submitted successfully!');
    } catch (err) {
      console.error('Error submitting assignment:', err);
      alert('Failed to submit assignment.');
    } finally {
      setSubmitting(null);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !a.submission;
    if (filter === 'submitted') return a.submission && a.submission.status === 'submitted';
    if (filter === 'graded') return a.submission && a.submission.status === 'graded';
    return true;
  });

  const getStatusBadge = (a) => {
    if (!a.submission) return { text: 'Pending', color: '#ef4444', bg: '#fef2f2', icon: <Clock size={14} /> };
    if (a.submission.status === 'graded') return { text: 'Graded', color: '#10b981', bg: '#ecfdf5', icon: <Trophy size={14} /> };
    return { text: 'Submitted', color: '#3b82f6', bg: '#eff6ff', icon: <CheckCircle2 size={14} /> };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="fade-in max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My <span className="text-gradient">Assignments</span></h1>
          <p className="text-muted-foreground mt-1">Track and submit your coursework.</p>
        </div>
        
        <div className="flex gap-2">
          {['all', 'pending', 'submitted', 'graded'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'glass hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignment List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="card text-center py-12">
              <ClipboardList size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground">No assignments found for this filter.</p>
            </div>
          ) : (
            filteredAssignments.map((a, i) => {
              const status = getStatusBadge(a);
              return (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={a.id}
                  onClick={() => setSelectedAssignment(a)}
                  className={`card cursor-pointer border-2 transition-all group ${
                    selectedAssignment?.id === a.id ? 'border-primary shadow-xl scale-[1.01]' : 'border-transparent hover:border-primary/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{a.subject}</span>
                        <div 
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                          style={{ color: status.color, backgroundColor: status.bg }}
                        >
                          {status.icon} {status.text}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{a.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1"><Calendar size={12} /> Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No deadline'}</span>
                        <span className="flex items-center gap-1"><FileText size={12} /> {a.type}</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className={`transition-transform ${selectedAssignment?.id === a.id ? 'rotate-90 text-primary' : 'text-muted-foreground group-hover:translate-x-1'}`} />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Details & Submission Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedAssignment ? (
              <motion.div
                key={selectedAssignment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card sticky top-24"
              >
                <h2 className="text-xl font-bold mb-4">{selectedAssignment.title}</h2>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {selectedAssignment.description || 'No description provided.'}
                </p>

                {selectedAssignment.submission ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-border">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">My Submission</h4>
                      <p className="text-sm italic text-foreground/80">"{selectedAssignment.submission.content}"</p>
                      <div className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                        <Calendar size={10} /> Submitted on {new Date(selectedAssignment.submission.submitted_at).toLocaleString()}
                      </div>
                    </div>

                    {selectedAssignment.submission.status === 'graded' && (
                      <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-success">Grade Received</h4>
                          <span className="text-2xl font-black text-success">{selectedAssignment.submission.grade}</span>
                        </div>
                        <p className="text-sm text-foreground/80">
                          <span className="font-bold">Feedback:</span> {selectedAssignment.submission.feedback || 'Great work!'}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-primary text-sm font-medium">
                      <CheckCircle2 size={16} /> Already submitted
                    </div>
                  </div>
                ) : selectedAssignment.type === 'quiz' || selectedAssignment.type === 'coding' || selectedAssignment.type === 'crossword' ? (
                  <div className="card h-40 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-border bg-muted/20">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold">Interactive {selectedAssignment.type.charAt(0).toUpperCase() + selectedAssignment.type.slice(1)}</h3>
                      <p className="text-xs text-muted-foreground mt-1">This assignment requires a specialized environment.</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/student/attempt/${selectedAssignment.id}`)}
                      className="px-6 py-2 bg-primary text-white font-bold rounded-lg shadow-lg hover:shadow-primary/30 transition-all"
                    >
                      Start Attempt
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Your Submission</label>
                      <textarea
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Type your response or link to your work..."
                        className="w-full h-40 bg-muted/50 border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting === selectedAssignment.id}
                      className="w-full flex items-center justify-center gap-2 py-3 primary"
                    >
                      {submitting === selectedAssignment.id ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Submit Assignment
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-muted-foreground">
                      By submitting, you agree that this is your own work.
                    </p>
                  </form>
                )}
              </motion.div>
            ) : (
              <div className="card h-[400px] flex flex-col items-center justify-center text-center opacity-60">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <AlertCircle size={32} className="text-muted-foreground" />
                </div>
                <h3 className="font-bold">Select an Assignment</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  Click on any assignment from the list to view details and submit.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignments;
