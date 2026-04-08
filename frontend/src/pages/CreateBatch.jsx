import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, UserPlus, CheckCircle2, Loader2, X, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateBatch = () => {
  const [name, setName] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/faculty/students', {
          headers: { 'x-auth-token': token }
        });
        setAllStudents(res.data);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students list');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const toggleStudent = (student) => {
    if (selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const filteredStudents = allStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return setError('Batch name is required');
    if (selectedStudents.length === 0) return setError('Please select at least one student');
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      
      const batchRes = await axios.post('/api/faculty/batches', { name }, { headers });
      const batchId = batchRes.data.id;

      // Add selected students
      const studentPromises = selectedStudents.map(student => 
        axios.post(`/api/faculty/batches/${batchId}/students`, { email: student.email }, { headers })
      );
      
      await Promise.all(studentPromises);
      navigate('/faculty');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create batch');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-100px)] py-12 px-4 sm:px-6 overflow-hidden flex justify-center items-start">
      {/* Background Orbs */}
      <div className="absolute top-0 right-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="w-full max-w-3xl relative z-10"
      >
        <div className="text-center mb-10">
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center justify-center gap-3">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Initialize</span> Batch
             <Sparkles size={36} className="text-primary animate-pulse" />
           </h1>
           <p className="text-muted-foreground mt-3 text-lg font-medium">Group your students into manageable cohorts.</p>
        </div>
        
        <div className="p-8 md:p-10 rounded-[3rem] bg-background/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none" />
          
          <form onSubmit={handleCreate} className="relative z-10 space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Batch Identifier</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <BookOpen size={20} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. Masterclass 2026-A" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  className="w-full bg-background/80 backdrop-blur-sm border border-border/50 focus:border-primary/50 focus:ring-4 ring-primary/10 pl-14 pr-6 py-4 rounded-2xl text-lg font-bold outline-none transition-all shadow-inner placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center justify-between">
                <span>Select Cadets</span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">{selectedStudents.length} Selected</span>
              </label>

              {/* Selected Students Chips */}
              <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-2xl bg-muted/20 border border-border/30">
                <AnimatePresence>
                  {selectedStudents.map(student => (
                    <motion.div 
                      key={student.id} 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white pl-3 pr-1.5 py-1.5 rounded-xl text-xs font-bold shadow-md"
                    >
                      {student.name}
                      <button 
                        type="button" 
                        onClick={() => toggleStudent(student)} 
                        className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {selectedStudents.length === 0 && (
                  <span className="text-sm font-medium text-muted-foreground/50 py-1.5 px-2">No students assigned to this batch yet.</span>
                )}
              </div>

              {/* Search Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search size={18} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder="Filter directory by name or email..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="w-full bg-background/50 border border-border/50 focus:border-primary/50 focus:ring-4 ring-primary/10 pl-12 pr-6 py-3 rounded-xl text-sm font-semibold outline-none transition-all shadow-inner placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Students List */}
              <div className="h-[300px] overflow-y-auto rounded-3xl border border-border/50 bg-background/40 backdrop-blur-md custom-scrollbar relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 size={32} className="animate-spin mb-3 text-primary" />
                    <p className="font-bold tracking-tight">Scanning Directory...</p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/60">
                    <Users size={48} className="mb-4 opacity-20" />
                    <p className="font-bold">{searchTerm ? 'No matching cadets found.' : 'Directory is empty.'}</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredStudents.map(student => {
                      const isSelected = selectedStudents.find(s => s.id === student.id);
                      return (
                        <div 
                          key={student.id} 
                          onClick={() => toggleStudent(student)}
                          className={`p-4 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-300 border ${
                            isSelected 
                            ? 'bg-success/5 border-success text-success shadow-[0_0_15px_-3px_rgba(var(--success),0.2)]' 
                            : 'bg-transparent border-transparent hover:bg-muted/50 hover:border-border/50 text-foreground/80'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                              isSelected ? 'bg-success text-white shadow-inner' : 'bg-muted text-muted-foreground'
                            }`}>
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div className={`font-black text-base tracking-tight ${isSelected ? 'text-success' : 'text-foreground/90'}`}>
                                {student.name}
                              </div>
                              <div className={`text-xs font-semibold ${isSelected ? 'text-success/70' : 'text-muted-foreground'}`}>
                                {student.email}
                              </div>
                            </div>
                          </div>
                          
                          <div className="pr-2">
                            {isSelected ? (
                              <CheckCircle2 size={24} className="text-success animate-in zoom-in" />
                            ) : (
                              <UserPlus size={20} className="text-muted-foreground/50" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-bold flex items-center gap-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSaving} 
              className="w-full group relative overflow-hidden px-8 py-5 rounded-2xl bg-foreground text-background disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isSaving ? (
                  <><Loader2 size={22} className="animate-spin" /> <span className="font-black tracking-widest uppercase">Initializing...</span></>
                ) : (
                  <><CheckCircle2 size={22} className="group-hover:text-white" /> <span className="font-black tracking-widest uppercase group-hover:text-white transition-colors">Confirm & Deploy Batch</span></>
                )}
              </div>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateBatch;
