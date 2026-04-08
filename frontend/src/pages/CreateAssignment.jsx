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
  X,
  Wand2,
  Edit2,
  PlusCircle
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
  
  const [editingIndex, setEditingIndex] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const handleEditClick = (index, item) => { 
    setEditingIndex(index); 
    setEditItem(JSON.parse(JSON.stringify(item))); 
  };
  
  const handleSaveEdit = () => {
    const updated = [...generatedContent];
    updated[editingIndex] = editItem;
    setGeneratedContent(updated);
    setEditingIndex(null);
  };
  
  const handleDeleteItem = (index) => {
    setGeneratedContent(generatedContent.filter((_, i) => i !== index));
  };
  
  const handleAddCustom = () => {
    const newItems = generatedContent ? [...generatedContent] : [];
    const newItem = { question: 'New Question', options: ['Option 1','Option 2','Option 3','Option 4'], correctAnswer: 0 };
    newItems.push(newItem);
    setGeneratedContent(newItems);
    setEditingIndex(newItems.length - 1);
    setEditItem(newItem);
  };

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
      setError('AI Generation failed. Our silicon brain is temporarily overwhelmed. Please try again.');
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
    <div className="relative min-h-screen pb-12 overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 backdrop-blur-md bg-background/40 p-6 rounded-3xl border border-border/50 shadow-sm">
          <div>
            <button 
              onClick={() => step === 2 ? setStep(1) : navigate('/faculty-dashboard')}
              className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all mb-3 w-fit"
            >
              <div className="p-1 rounded-md group-hover:bg-primary/10 transition-colors">
                <ChevronLeft size={16} />
              </div>
              <span className="font-semibold tracking-wide">Back to Dashboard</span>
            </button>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-3">
              {step === 1 ? 'Design' : 'Refine'} 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-400">Assignment</span>
              <Sparkles size={32} className="text-primary animate-pulse ml-2" />
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-full border border-border/50">
             {[1, 2].map(s => (
               <div 
                 key={s}
                 className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 font-bold ${
                   step === s 
                   ? 'bg-gradient-to-tr from-primary to-purple-500 text-white shadow-xl shadow-primary/40 scale-110' 
                   : 'bg-background text-muted-foreground border border-border'
                 }`}
               >
                 {s}
               </div>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Settings Panel (Step 1) */}
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                className="lg:col-span-4 space-y-6"
              >
                {/* Core Configuration */}
                <div className="relative p-6 rounded-[2rem] bg-background/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] -z-10 transition-colors group-hover:bg-primary/20" />
                  
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Settings size={20} />
                    </div>
                    Core Config
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Assignment Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Intro to Neural Networks" 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                        className="w-full bg-background/50 border border-border focus:border-primary/50 rounded-xl px-4 py-3 text-sm focus:ring-4 ring-primary/10 transition-all outline-none"
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Description (Optional)</label>
                      <textarea 
                        placeholder="Instructions for students... what should they focus on?" 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        className="w-full bg-background/50 border border-border focus:border-primary/50 rounded-xl px-4 py-3 text-sm focus:ring-4 ring-primary/10 transition-all outline-none h-28 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Subject domain</label>
                          <select 
                            value={formData.subject} 
                            onChange={e => setFormData({...formData, subject: e.target.value})}
                            className="w-full bg-background/50 border border-border focus:border-primary/50 rounded-xl px-3 py-3 text-sm focus:ring-4 ring-primary/10 transition-all outline-none appearance-none"
                          >
                            <option value="Artificial Intelligence">AI Mastery</option>
                            <option value="Full Stack Development">Full Stack Dev</option>
                            <option value="Data Structures">Data Structures</option>
                            <option value="Cloud Computing">Cloud Computing</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Deadline Date</label>
                          <input 
                            type="date" 
                            value={formData.dueDate} 
                            onChange={e => setFormData({...formData, dueDate: e.target.value})}
                            className="w-full bg-background/50 border border-border focus:border-primary/50 rounded-xl px-3 py-3 text-sm focus:ring-4 ring-primary/10 transition-all outline-none"
                          />
                       </div>
                    </div>
                  </div>
                </div>

                {/* Audience Targeting */}
                <div className="relative p-6 rounded-[2rem] bg-background/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-2xl overflow-hidden group hover:border-secondary/30 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-bl-[100px] -z-10 transition-colors group-hover:bg-secondary/20" />
                  
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                      <Target size={20} />
                    </div>
                    Audience
                  </h3>
                  
                  <div className="space-y-5">
                     <div className="flex p-1.5 bg-muted/50 rounded-xl gap-1 border border-border/50">
                        <button 
                           onClick={() => setFormData({...formData, studentId: '', batchId: ''})}
                           className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                              !formData.studentId && !formData.batchId 
                              ? 'bg-background shadow-md text-foreground' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-background/20'
                           }`}
                        >
                           General
                        </button>
                        <div className="w-px bg-border my-2 mx-1" />
                        <button 
                           className="flex-1 py-2 text-xs font-bold rounded-lg text-muted-foreground opacity-50 cursor-not-allowed flex items-center justify-center gap-1"
                           disabled
                           title="Pro Feature"
                        >
                           Groups <span className="px-1.5 py-0.5 rounded text-[8px] bg-primary/20 text-primary">PRO</span>
                        </button>
                     </div>

                     <div className="space-y-4 pt-1">
                        <div className="relative">
                           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                              <Users size={16} />
                           </div>
                           <select 
                             value={formData.batchId} 
                             onChange={e => setFormData({...formData, batchId: e.target.value, studentId: ''})}
                             className="w-full bg-background/50 border border-border focus:border-primary/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-4 ring-primary/10 transition-all outline-none appearance-none"
                           >
                             <option value="">Assign to a whole batch...</option>
                             {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                           </select>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="h-px bg-border flex-1" />
                          <span className="text-[10px] font-black text-muted-foreground tracking-widest bg-muted px-3 py-1 rounded-full uppercase">OR</span>
                          <div className="h-px bg-border flex-1" />
                        </div>

                        <div className="relative">
                           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                              <Plus size={16} />
                           </div>
                           <select 
                             value={formData.studentId} 
                             onChange={e => setFormData({...formData, studentId: e.target.value, batchId: ''})}
                             className="w-full bg-background/50 border border-border focus:border-primary/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-4 ring-primary/10 transition-all outline-none appearance-none"
                           >
                             <option value="">Assign to a specific student...</option>
                             {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                           </select>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* AI Controls (Step 2) */
              <motion.div 
                key="step2-controls"
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-4 space-y-6"
              >
                 <div className="relative p-6 rounded-[2rem] bg-gradient-to-b from-success/5 to-transparent border border-success/20 shadow-2xl overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-success/20 rounded-full blur-3xl -z-10" />
                    
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-success/10 text-success">
                        <BrainCircuit size={20} />
                      </div>
                      AI Refinement
                    </h3>
                    <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                      Content looks good? You can still tweak the parameters and regenerate if needed to adjust difficulty or style.
                    </p>

                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black tracking-widest uppercase text-muted-foreground pl-1">Difficulty Level</label>
                          <div className="flex gap-2">
                             {['beginner', 'intermediate', 'advanced'].map(l => (
                               <button
                                 key={l}
                                 onClick={() => setFormData({...formData, level: l})}
                                 className={`flex-1 py-2 text-[11px] font-bold rounded-xl border uppercase tracking-wider transition-all duration-300 ${
                                   formData.level === l 
                                   ? 'bg-foreground text-background border-foreground shadow-lg scale-[1.02]' 
                                   : 'bg-background/50 border-border text-muted-foreground hover:border-foreground/50 hover:bg-background'
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
                          className="w-full relative overflow-hidden group bg-muted/50 border border-border hover:border-primary/50 text-foreground font-bold py-4 rounded-2xl transition-all"
                        >
                          <div className="absolute inset-0 w-0 bg-primary/5 transition-all duration-[500ms] ease-out group-hover:w-full" />
                          <span className="relative flex items-center justify-center gap-2">
                            {isGenerating ? <Loader2 size={18} className="animate-spin text-primary" /> : <><Wand2 size={18} className="text-primary group-hover:rotate-12 transition-transform" /> Regenerate All</>}
                          </span>
                        </button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <button 
                      onClick={handleSave} 
                      disabled={isSaving || !generatedContent} 
                      className="w-full relative overflow-hidden group bg-gradient-to-r from-primary to-purple-600 text-white font-black text-lg tracking-wide py-5 rounded-2xl shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)] hover:shadow-[0_0_60px_-15px_rgba(var(--primary),0.7)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                      <span className="relative flex items-center justify-center gap-2">
                         {isSaving ? <><Loader2 size={22} className="animate-spin" /> Publishing...</> : <><Save size={22} /> PUBLISH ASSIGNMENT</>}
                      </span>
                    </button>
                    
                    <button 
                      onClick={() => setStep(1)} 
                      className="w-full flex items-center justify-center gap-2 py-4 font-bold text-muted-foreground hover:text-foreground transition-colors rounded-2xl hover:bg-muted/30"
                    >
                      <Settings size={18} /> BACK TO SETTINGS
                    </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content Preview (Step 1 Placeholder / Step 2 Generated Content) */}
          <div className="lg:col-span-8 h-full">
             <div className={`relative h-full min-h-[600px] flex flex-col rounded-[2.5rem] overflow-hidden transition-all duration-700 ${
               step === 1 
               ? 'border-2 border-dashed border-border/50 bg-muted/5' 
               : 'border border-border bg-background/40 backdrop-blur-3xl shadow-2xl'
             }`}>
                
                <div className="px-8 pt-8 pb-6 border-b border-border/30 flex items-center justify-between z-10 bg-background/50 backdrop-blur-md">
                  <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                    {step === 2 && <CheckCircle2 size={26} className="text-success drop-shadow-[0_0_10px_rgba(var(--success),0.5)]" />} 
                    <span className={step === 1 ? 'text-muted-foreground' : 'text-foreground'}>
                       {step === 1 ? 'AI Intelligence Scope' : 'Generated Curriculum'}
                    </span>
                  </h3>
                  {generatedContent && (
                    <span className="px-4 py-1.5 bg-success/10 border border-success/20 text-success text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_-3px_rgba(var(--success),0.3)]">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" /> AI Ready
                    </span>
                  )}
                </div>

                {step === 1 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 relative">
                     <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px] pointer-events-none mix-blend-overlay" />
                     
                     <div className="relative mb-8 group">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-all duration-700 group-hover:scale-150" />
                        <div className="relative p-8 bg-background border border-white/10 rounded-full shadow-2xl">
                           <Wand2 size={48} className="text-primary animate-pulse" />
                        </div>
                     </div>
                     
                     <h4 className="text-3xl font-black mb-4 tracking-tight">Ready to summon the AI?</h4>
                     <p className="text-muted-foreground max-w-md text-lg leading-relaxed mb-10">
                       Complete the configuration panel on the left. Our specialized AI engine will craft tailored, high-quality material for your students in seconds.
                     </p>
                     
                     <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !formData.title || (!formData.batchId && !formData.studentId)}
                        className="group relative px-10 py-5 rounded-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed bg-foreground text-background font-black text-lg tracking-wide hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.3)] dark:hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.1)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                     >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative flex items-center gap-3">
                           {isGenerating ? <><Loader2 size={24} className="animate-spin" /> GENERATING NEURAL PATHWAYS...</> : <><Sparkles size={24} className="group-hover:animate-bounce" /> GENERATE CONTENT</>}
                        </span>
                     </button>
                     {error && <p className="mt-6 text-sm text-destructive font-bold bg-destructive/10 px-4 py-2 rounded-xl inline-flex items-center gap-2"><AlertCircle size={16}/> {error}</p>}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <div className="px-8 py-4 bg-success/5 border-b border-success/10 flex items-center justify-between">
                       <div className="text-sm text-success/90 flex items-center gap-2">
                          <BrainCircuit size={16} />
                          <span><strong className="font-black tracking-tight">Intelligence Report:</strong> Successfully materialized <span className="px-2 py-0.5 rounded-md bg-success/20 font-black">{generatedContent?.length || 0}</span> items tailored for "{formData.subject}".</span>
                       </div>
                       <button onClick={() => { setGeneratedContent(null); setStep(1); }} className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group" title="Discard Content">
                          <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                       </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar relative">
                      <div className="absolute top-0 left-1/2 -ml-px w-px h-full bg-gradient-to-b from-border to-transparent -z-10 pointer-events-none opacity-50" />
                      
                      {Array.isArray(generatedContent) ? (
                        <>
                          {generatedContent.map((item, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                              className="p-8 rounded-[2rem] bg-background/80 backdrop-blur-md border border-white/5 dark:border-white/5 shadow-xl group hover:border-primary/40 hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden"
                            >
                              <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                              <div className="flex items-start gap-4">
                                 <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 text-primary font-black text-xl flex items-center justify-center border border-primary/20 shadow-inner">
                                   {i+1}
                                 </div>
                                 
                                 <div className="flex-1 space-y-6 pt-1">
                                    {editingIndex === i ? (
                                      <div className="space-y-4">
                                        <input 
                                          type="text" 
                                          value={editItem.question || editItem.front || editItem.sentence || ''} 
                                          onChange={e => {
                                            const key = editItem.question !== undefined ? 'question' : (editItem.front !== undefined ? 'front' : 'sentence');
                                            setEditItem({...editItem, [key]: e.target.value});
                                          }}
                                          className="w-full bg-background/50 border border-border focus:border-primary/50 rounded-xl px-4 py-3 font-bold text-lg outline-none"
                                        />
                                        {editItem.options && (
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {editItem.options.map((opt, j) => (
                                              <div key={j} className="flex items-center gap-2">
                                                <input 
                                                  type="radio" 
                                                  name={`correct-${i}`} 
                                                  checked={editItem.correctAnswer === j}
                                                  onChange={() => setEditItem({...editItem, correctAnswer: j})}
                                                  className="w-5 h-5 text-success"
                                                />
                                                <input 
                                                  type="text" 
                                                  value={opt}
                                                  onChange={e => {
                                                    const newOpts = [...editItem.options];
                                                    newOpts[j] = e.target.value;
                                                    setEditItem({...editItem, options: newOpts});
                                                  }}
                                                  className="flex-1 bg-background/50 border border-border focus:border-primary/50 rounded-xl px-3 py-2 text-sm outline-none"
                                                />
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        <div className="flex justify-end gap-2 pt-2">
                                           <button onClick={() => setEditingIndex(null)} className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground">Cancel</button>
                                           <button onClick={handleSaveEdit} className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25">Save</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex items-start justify-between gap-4">
                                          <div className="font-bold text-xl leading-relaxed text-foreground/90">
                                            {item.question || item.front || item.sentence}
                                          </div>
                                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditClick(i, item)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDeleteItem(i)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={16} /></button>
                                          </div>
                                        </div>

                                {item.options && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {item.options.map((opt, j) => {
                                       const isCorrect = item.correctAnswer === j;
                                       return (
                                         <div 
                                           key={j} 
                                           className={`relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${
                                             isCorrect 
                                             ? 'bg-success/5 border-success text-success font-semibold shadow-[0_0_20px_-5px_rgba(var(--success),0.2)]' 
                                             : 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50 hover:border-border'
                                           }`}
                                         >
                                           {isCorrect && <div className="absolute inset-0 bg-success/5 pointer-events-none" />}
                                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-inner flex-shrink-0 ${
                                             isCorrect ? 'bg-success text-white' : 'bg-background text-muted-foreground'
                                           }`}>
                                             {String.fromCharCode(65 + j)}
                                           </div>
                                           <span className="leading-snug">{opt}</span>
                                         </div>
                                       )
                                     })}
                                  </div>
                                )}

                                <div className="pt-6 mt-4 border-t border-border/40 flex items-center justify-between">
                                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 border border-success/20 text-success shadow-inner">
                                     <CheckCircle2 size={16} /> 
                                     <span className="text-xs font-black uppercase tracking-widest">
                                        Correct Answer: {item.correctAnswer !== undefined ? item.options[item.correctAnswer] : (item.back || item.answer)}
                                     </span>
                                  </div>
                                </div>
                                      </>
                                    )}
                                 </div>
                              </div>
                            </motion.div>
                          ))}
                          
                          <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={handleAddCustom}
                            className="w-full p-6 rounded-[2rem] border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/50 transition-all group"
                          >
                            <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
                              <PlusCircle size={24} className="text-primary" />
                            </div>
                            <span className="font-bold tracking-wide">Add Custom Question</span>
                          </motion.button>
                        </>
                      ) : (
                        <div className="p-8 rounded-[2rem] bg-muted/20 border border-border/50 font-mono text-sm overflow-x-auto shadow-inner text-muted-foreground">
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
    </div>
  );
};

export default CreateAssignment;

