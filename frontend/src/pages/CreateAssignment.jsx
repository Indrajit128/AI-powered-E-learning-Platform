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
      navigate('/faculty');
    } catch (err) {
      setError('Failed to publish assignment. Check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Header Section */}
      <div className="flex-responsive" style={{ marginBottom: '2.5rem' }}>
        <div>
          <button 
            onClick={() => step === 2 ? setStep(1) : navigate('/faculty')}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', padding: 0, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem', cursor: 'pointer' }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {step === 1 ? 'Design' : 'Refine'} <span className="text-gradient">Assignment</span>
            <Sparkles size={28} color="var(--primary)" />
          </h1>
        </div>

        <div className="header-actions">
           <div className="glass" style={{ padding: '0.5rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border)' }}>
             {[1, 2].map(s => (
               <div 
                 key={s}
                 style={{
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   width: '36px', height: '36px', borderRadius: '50%', fontWeight: '700', transition: 'all 0.3s',
                   background: step === s ? 'var(--primary)' : 'transparent',
                   color: step === s ? 'white' : 'var(--text-muted)'
                 }}
               >
                 {s}
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="dashboard-layout" style={{ gridTemplateColumns: 'minmax(350px, 1fr) 2fr' }}>
        
        {/* Settings Panel (Step 1 or 2 controls) */}
        <div>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                {/* Core Configuration */}
                <div className="card">
                  <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Settings color="var(--primary)" size={20} /> Core Config
                  </h3>
                  
                  <div className="input-group">
                    <label>Assignment Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Intro to Neural Networks" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      required 
                    />
                  </div>

                  <div className="input-group">
                    <label>Description (Optional)</label>
                    <textarea 
                      placeholder="Instructions for students... what should they focus on?" 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      style={{ minHeight: '100px', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                     <div className="input-group" style={{ marginBottom: 0 }}>
                        <label>Subject Domain</label>
                        <select 
                          value={formData.subject} 
                          onChange={e => setFormData({...formData, subject: e.target.value})}
                        >
                          <option value="Artificial Intelligence">AI Mastery</option>
                          <option value="Full Stack Development">Full Stack Dev</option>
                          <option value="Data Structures">Data Structures</option>
                          <option value="Cloud Computing">Cloud Computing</option>
                        </select>
                     </div>
                     <div className="input-group" style={{ marginBottom: 0 }}>
                        <label>Deadline Date</label>
                        <input 
                          type="date" 
                          value={formData.dueDate} 
                          onChange={e => setFormData({...formData, dueDate: e.target.value})}
                        />
                     </div>
                  </div>
                </div>

                {/* Audience Targeting */}
                <div className="card">
                  <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Target color="var(--secondary)" size={20} /> Audience
                  </h3>
                  
                  <div style={{ background: 'var(--bg-main)', padding: '4px', borderRadius: '8px', display: 'flex', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                    <button 
                       onClick={() => setFormData({...formData, studentId: '', batchId: ''})}
                       style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem', background: (!formData.studentId && !formData.batchId) ? 'white' : 'transparent', color: (!formData.studentId && !formData.batchId) ? 'var(--primary)' : 'var(--text-muted)', boxShadow: (!formData.studentId && !formData.batchId) ? 'var(--shadow)' : 'none', border: 'none' }}
                    >
                       General
                    </button>
                    <button 
                       disabled
                       style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem', background: 'transparent', color: 'var(--text-muted)', border: 'none', opacity: 0.5, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                       Groups <span style={{ fontSize: '0.6rem', padding: '2px 4px', background: 'var(--primary)', color: 'white', borderRadius: '4px' }}>PRO</span>
                    </button>
                  </div>

                  <div className="input-group">
                     <select 
                       value={formData.batchId} 
                       onChange={e => setFormData({...formData, batchId: e.target.value, studentId: ''})}
                     >
                       <option value="">Assign to a whole batch...</option>
                       {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                     </select>
                  </div>
                  
                  <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}>OR</div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                     <select 
                       value={formData.studentId} 
                       onChange={e => setFormData({...formData, studentId: e.target.value, batchId: ''})}
                     >
                       <option value="">Assign to a specific student...</option>
                       {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                     </select>
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
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                 <div className="card" style={{ borderColor: 'var(--success)', background: '#10b98105' }}>
                    <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <BrainCircuit color="var(--success)" size={20} /> AI Refinement
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                      Content looks good? You can still tweak the parameters and regenerate if needed to adjust difficulty or style.
                    </p>

                    <div className="input-group">
                       <label>Difficulty Level</label>
                       <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {['beginner', 'intermediate', 'advanced'].map(l => (
                            <button
                              type="button"
                              key={l}
                              onClick={() => setFormData({...formData, level: l})}
                              style={{
                                flex: 1, padding: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', borderRadius: '8px', 
                                background: formData.level === l ? 'var(--primary)' : 'white',
                                color: formData.level === l ? 'white' : 'var(--text-main)',
                                border: `1px solid ${formData.level === l ? 'var(--primary)' : 'var(--border)'}`
                              }}
                            >
                              {l}
                            </button>
                          ))}
                       </div>
                    </div>

                    <button 
                       onClick={handleGenerate} 
                       disabled={isGenerating} 
                       style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                     >
                       {isGenerating ? <Loader2 size={18} className="animate-spin" color="var(--primary)" /> : <><Wand2 size={18} color="var(--primary)" /> Regenerate All</>}
                     </button>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button 
                      onClick={handleSave} 
                      disabled={isSaving || !generatedContent} 
                      style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                       {isSaving ? <><Loader2 size={22} className="animate-spin" /> Publishing...</> : <><Save size={20} /> PUBLISH ASSIGNMENT</>}
                    </button>
                    
                    <button 
                      onClick={() => setStep(1)} 
                      style={{ width: '100%', padding: '1rem', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    >
                       BACK TO SETTINGS
                    </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Preview (Step 1 Placeholder / Step 2 Generated Content) */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
           <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '600px', background: step === 1 ? '#f8fafc' : 'white', borderStyle: step === 1 ? 'dashed' : 'solid', borderWidth: step === 1 ? '2px' : '1px' }}>
              
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem' }}>
                  {step === 2 && <CheckCircle2 size={24} color="var(--success)" />} 
                  <span style={{ color: step === 1 ? 'var(--text-muted)' : 'var(--text-main)' }}>
                     {step === 1 ? 'AI Intelligence Scope' : 'Generated Curriculum'}
                  </span>
                </h3>
                {generatedContent && (
                  <span style={{ padding: '4px 12px', background: '#10b98115', color: 'var(--success)', fontSize: '0.75rem', fontWeight: '800', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} className="animate-pulse" /> AI Ready
                  </span>
                )}
              </div>

              {step === 1 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center' }}>
                   
                   <div style={{ padding: '1.5rem', background: '#4f46e510', borderRadius: '50%', marginBottom: '2rem' }}>
                      <Wand2 size={48} color="var(--primary)" />
                   </div>
                   
                   <h2 style={{ margin: '0 0 1rem 0', fontSize: '2rem', fontWeight: '800' }}>Ready to summon the AI?</h2>
                   <p style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                     Complete the configuration panel on the left. Our specialized AI engine will craft tailored, high-quality material for your students in seconds.
                   </p>
                   
                   <button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !formData.title || (!formData.batchId && !formData.studentId)}
                      style={{ padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}
                   >
                      {isGenerating ? <><Loader2 size={24} className="animate-spin" /> GENERATING...</> : <><Sparkles size={24} /> GENERATE CONTENT</>}
                   </button>
                   {error && <p style={{ color: 'var(--danger)', background: '#ef444410', padding: '0.5rem 1rem', borderRadius: '8px', marginTop: '1.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}><AlertCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> {error}</p>}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                >
                  <div style={{ padding: '0.75rem 2rem', background: '#10b98110', borderBottom: '1px solid #10b98130', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '600' }}>
                        <BrainCircuit size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
                        Intelligence Report: Successfully materialized <strong style={{ padding: '2px 6px', background: 'rgba(16,185,129,0.2)', borderRadius: '4px' }}>{generatedContent?.length || 0}</strong> items tailored for "{formData.subject}".
                     </div>
                     <button onClick={() => { setGeneratedContent(null); setStep(1); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '4px', cursor: 'pointer' }} title="Discard Content">
                        <Trash2 size={16} />
                     </button>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg-main)' }} className="custom-scrollbar">
                    
                    {Array.isArray(generatedContent) ? (
                      <>
                        {generatedContent.map((item, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card stat-card"
                            style={{ padding: '2rem', position: 'relative' }}
                          >
                            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                               <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: '#4f46e515', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                                 {i+1}
                               </div>
                               
                               <div style={{ flex: 1 }}>
                                  {editingIndex === i ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                      <input 
                                        type="text" 
                                        value={editItem.question || editItem.front || editItem.sentence || ''} 
                                        onChange={e => {
                                          const key = editItem.question !== undefined ? 'question' : (editItem.front !== undefined ? 'front' : 'sentence');
                                          setEditItem({...editItem, [key]: e.target.value});
                                        }}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--primary)', borderRadius: '8px', fontSize: '1rem', fontWeight: '600' }}
                                      />
                                      {editItem.options && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                          {editItem.options.map((opt, j) => (
                                            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <input 
                                                type="radio" 
                                                name={`correct-${i}`} 
                                                checked={editItem.correctAnswer === j}
                                                onChange={() => setEditItem({...editItem, correctAnswer: j})}
                                              />
                                              <input 
                                                type="text" 
                                                value={opt}
                                                onChange={e => {
                                                  const newOpts = [...editItem.options];
                                                  newOpts[j] = e.target.value;
                                                  setEditItem({...editItem, options: newOpts});
                                                }}
                                                style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
                                         <button type="button" onClick={() => setEditingIndex(null)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Cancel</button>
                                         <button type="button" onClick={handleSaveEdit} style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}>Save Changes</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '1rem' }}>
                                          {item.question || item.front || item.sentence}
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                          <button onClick={() => handleEditClick(i, item)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '6px', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                          <button onClick={() => handleDeleteItem(i)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', padding: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                      </div>

                                      {item.options && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.75rem' }}>
                                           {item.options.map((opt, j) => {
                                             const isCorrect = item.correctAnswer === j;
                                             return (
                                               <div 
                                                 key={j} 
                                                 style={{
                                                   padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px',
                                                   background: isCorrect ? '#10b98110' : '#f8fafc',
                                                   border: `1px solid ${isCorrect ? 'var(--success)' : 'var(--border)'}`,
                                                   color: isCorrect ? 'var(--success)' : 'var(--text-main)',
                                                   fontWeight: isCorrect ? '700' : '500'
                                                 }}
                                               >
                                                 <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isCorrect ? 'var(--success)' : 'white', color: isCorrect ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800', border: isCorrect ? 'none' : '1px solid var(--border)' }}>
                                                   {String.fromCharCode(65 + j)}
                                                 </div>
                                                 <span style={{ fontSize: '0.9rem' }}>{opt}</span>
                                               </div>
                                             )
                                           })}
                                        </div>
                                      )}

                                      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#10b98115', color: 'var(--success)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                           <CheckCircle2 size={14} /> Correct Answer: {item.correctAnswer !== undefined ? item.options[item.correctAnswer] : (item.back || item.answer)}
                                        </span>
                                      </div>
                                    </>
                                  )}
                               </div>
                            </div>
                          </motion.div>
                        ))}
                        
                        <button
                          onClick={handleAddCustom}
                          className="card stat-card"
                          style={{ width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--primary)', border: '2px dashed var(--primary)', background: '#4f46e505' }}
                        >
                          <PlusCircle size={32} />
                          <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Add Custom Question</span>
                        </button>
                      </>
                    ) : (
                      <div className="card" style={{ background: '#f8fafc', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.85rem', overflowX: 'auto' }}>
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
