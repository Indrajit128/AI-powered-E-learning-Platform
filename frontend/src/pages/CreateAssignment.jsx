import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Save, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Target, 
  Users, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Settings,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateAssignment = () => {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Artificial Intelligence',
    type: 'quiz',
    description: '',
    batchId: '',
    studentId: '',
    level: 'intermediate',
    dueDate: ''
  });
  
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Settings, 2: Content
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };
        const [batchesRes, studentsRes] = await Promise.all([
          axios.get('/api/faculty/batches', { headers }),
          axios.get('/api/faculty/students', { headers })
        ]);
        setBatches(batchesRes.data || []);
        setStudents(studentsRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const handleGenerate = async () => {
    if (!formData.title || (!formData.batchId && !formData.studentId)) {
      setError('Please fill in Title and Target (Batch or Student) before generating');
      return;
    }
    setError('');
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/faculty/generate-assignment', {
        subject: formData.subject,
        type: formData.type,
        level: formData.level
      }, {
        headers: { 'x-auth-token': token }
      });
      setGeneratedContent(res.data.questions);
      setStep(2);
    } catch (err) {
      setError('AI Generation failed. Our silicon brain is occupied. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/faculty/assignments', {
        ...formData,
        questionsJson: generatedContent
      }, {
        headers: { 'x-auth-token': token }
      });
      navigate('/faculty-dashboard');
    } catch (err) {
      setError('Failed to publish assignment. Check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fade-in max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button 
            onClick={() => step === 2 ? setStep(1) : navigate('/faculty-dashboard')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            {step === 1 ? 'Design' : 'Refine'} <span className="text-gradient">Assignment</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
           {[1, 2].map(s => (
             <div 
               key={s}
               className={`w-3 h-3 rounded-full transition-all duration-500 ${step === s ? 'bg-primary scale-125 shadow-lg shadow-primary/50' : 'bg-muted'}`}
             />
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Panel (Step 1) */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-4 space-y-6"
            >
              <div className="card border-primary/20 bg-primary/[0.02]">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Settings size={20} className="text-primary" /> Core Configuration
                </h3>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Intro to Neural Networks" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      className="w-full bg-background border-border"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Description (Optional)</label>
                    <textarea 
                      placeholder="Instructions for students..." 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      className="w-full bg-background border-border h-24 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Subject</label>
                        <select 
                          value={formData.subject} 
                          onChange={e => setFormData({...formData, subject: e.target.value})}
                          className="w-full bg-background"
                        >
                          <option value="Artificial Intelligence">AI Mastery</option>
                          <option value="Full Stack Development">Full Stack Dev</option>
                          <option value="Data Structures">Data Structures</option>
                          <option value="Cloud Computing">Cloud Computing</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Deadline</label>
                        <input 
                          type="date" 
                          value={formData.dueDate} 
                          onChange={e => setFormData({...formData, dueDate: e.target.value})}
                          className="w-full bg-background text-sm"
                        />
                     </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Target size={20} className="text-secondary" /> Audience Targeting
                </h3>
                
                <div className="space-y-4">
                   <div className="flex p-1 bg-muted rounded-xl gap-1">
                      <button 
                         onClick={() => setFormData({...formData, studentId: '', batchId: ''})}
                         className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!formData.studentId && !formData.batchId ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                         Unassigned
                      </button>
                      <button 
                         className="flex-1 py-2 text-xs font-bold rounded-lg text-muted-foreground opacity-50 cursor-not-allowed"
                         disabled
                      >
                         Groups (Pro)
                      </button>
                   </div>

                   <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                         <Users size={16} className="text-muted-foreground" />
                         <span className="font-bold">Target Batch</span>
                      </div>
                      <select 
                        value={formData.batchId} 
                        onChange={e => setFormData({...formData, batchId: e.target.value, studentId: ''})}
                        className="w-full bg-muted/50"
                      >
                        <option value="">Select a batch...</option>
                        {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      
                      <div className="flex items-center gap-2 py-2">
                        <div className="h-px bg-border flex-1" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">OR</span>
                        <div className="h-px bg-border flex-1" />
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                         <Plus size={16} className="text-muted-foreground" />
                         <span className="font-bold">Specific Student</span>
                      </div>
                      <select 
                        value={formData.studentId} 
                        onChange={e => setFormData({...formData, studentId: e.target.value, batchId: ''})}
                        className="w-full bg-muted/50"
                      >
                        <option value="">Select a student...</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                      </select>
                   </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* AI Controls (Step 2) */
            <motion.div 
              key="step2-controls"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-4 space-y-6"
            >
               <div className="card border-success/30 bg-success/[0.02]">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BrainCircuit size={20} className="text-success" /> AI Refinement
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Content looks good? You can still tweak the parameters and regenerate if needed.
                  </p>

                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Difficulty Level</label>
                        <div className="flex gap-2">
                           {['beginner', 'intermediate', 'advanced'].map(l => (
                             <button
                               key={l}
                               onClick={() => setFormData({...formData, level: l})}
                               className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border uppercase transition-all ${
                                 formData.level === l ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:border-foreground/50'
                               }`}
                             >
                               {l}
                             </button>
                           ))}
                        </div>
                     </div>

                     <button 
                        onClick={handleGenerate} 
                        disabled={isGenerating} 
                        className="w-full secondary py-3"
                      >
                        {isGenerating ? <Loader2 size={18} className="animate-spin mx-auto" /> : <><Sparkles size={16} className="inline mr-2" /> Regenerate All</>}
                      </button>
                  </div>
               </div>

               <div className="space-y-4">
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving || !generatedContent} 
                    className="w-full py-4 text-lg font-black shadow-2xl shadow-primary/30"
                  >
                    {isSaving ? 'PUBLISHING...' : 'PUBLISH NOW'}
                  </button>
                  <button 
                    onClick={() => setStep(1)} 
                    className="w-full glass py-3 font-bold border-dashed text-muted-foreground hover:text-foreground"
                  >
                    BACK TO SETTINGS
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Preview (Always Step 2, Placeholder Step 1) */}
        <div className="lg:col-span-8">
           <div className={`card min-h-[600px] flex flex-col ${step === 1 ? 'border-dashed opacity-50 bg-muted/5' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <CheckCircle2 size={22} className={generatedContent ? 'text-success' : 'text-muted-foreground'} /> 
                  Generated Intelligence
                </h3>
                {generatedContent && (
                  <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-black rounded-full uppercase tracking-widest">
                    AI Ready
                  </span>
                )}
              </div>

              {step === 1 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                   <div className="p-8 bg-muted rounded-2xl mb-6">
                      <Sparkles size={48} className="text-primary/40 animate-pulse" />
                   </div>
                   <h4 className="text-2xl font-bold mb-2">Ready to summon AI?</h4>
                   <p className="text-muted-foreground max-w-sm">
                     Complete the configuration on the left. Our AI engine will craft a tailored {formData.type} for your students.
                   </p>
                   <button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !formData.title || (!formData.batchId && !formData.studentId)}
                      className="mt-8 px-12 py-4 shadow-xl shadow-primary/20"
                   >
                      {isGenerating ? <Loader2 size={24} className="animate-spin" /> : 'GENERATE CONTENT'}
                   </button>
                   {error && <p className="mt-4 text-sm text-destructive font-bold">{error}</p>}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 flex-1"
                >
                  <div className="p-4 rounded-xl bg-success/5 border border-success/10 flex items-center justify-between">
                     <div className="text-xs text-success/80">
                        <span className="font-bold">Intelligence Report:</span> Successfully generated {generatedContent?.length || 0} items for "{formData.subject}".
                     </div>
                     <button onClick={() => setGeneratedContent(null)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={16} />
                     </button>
                  </div>

                  <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                    {Array.isArray(generatedContent) ? generatedContent.map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-6 rounded-2xl bg-muted/20 border border-border/50 group hover:border-primary/30 transition-all relative"
                      >
                        <span className="absolute top-4 right-6 text-[40px] font-black text-foreground/5 pointer-events-none">{i+1}</span>
                        
                        <div className="space-y-4">
                           <div className="font-bold text-lg leading-snug pr-12">
                             {item.question || item.front || item.sentence}
                           </div>

                           {item.options && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {item.options.map((opt, j) => (
                                  <div 
                                    key={j} 
                                    className={`text-sm p-3 rounded-xl border transition-all ${
                                      item.correctAnswer === j 
                                      ? 'bg-success/10 border-success/30 text-success font-bold' 
                                      : 'bg-background/50 border-border text-muted-foreground'
                                    }`}
                                  >
                                    <span className="opacity-40 mr-2">{String.fromCharCode(65 + j)}.</span> {opt}
                                  </div>
                                ))}
                             </div>
                           )}

                           <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                             <div className="text-[10px] font-black uppercase tracking-widest text-success flex items-center gap-1">
                                <CheckCircle2 size={12} /> Correct Answer: {item.correctAnswer !== undefined ? item.options[item.correctAnswer] : (item.back || item.answer)}
                             </div>
                           </div>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="p-6 rounded-2xl bg-muted/20 border border-border/50 font-mono text-xs overflow-x-auto">
                        <pre>{JSON.stringify(generatedContent, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignment;
