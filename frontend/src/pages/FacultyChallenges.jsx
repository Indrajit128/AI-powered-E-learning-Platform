import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Zap, Trash2, Edit2, Info, BookOpen, CheckCircle, Database, Layout, ShieldAlert, Sparkles, Loader2, Code2, Tags } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FacultyChallenges = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [genConfig, setGenConfig] = useState({ topic: 'Arrays', difficulty: 'Easy' });
    const dsaTopics = ['Arrays', 'Strings', 'Recursion', 'Dynamic Programming', 'Graph', 'Stack', 'Queue', 'Binary Tree', 'Linked List', 'Searching', 'Sorting', 'Hashing', 'Greedy Algorithm', 'Sliding Window', 'Two Pointer'];
    const [showGenModal, setShowGenModal] = useState(false);
    const [previewChallenge, setPreviewChallenge] = useState(null);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const res = await axios.get('/api/challenges');
                setChallenges(res.data);
            } catch (err) {
                console.error('Error fetching challenges:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenges();
    }, []);

    const handleGenerateAI = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const res = await axios.post('/api/challenges/generate-ai', genConfig);
            setPreviewChallenge(res.data);
            setShowGenModal(false);
            alert('AI generated a new challenge! Previewing now.');
        } catch (err) {
            console.error('Generation failed:', err);
            alert('AI Generation failed. Check API keys.');
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveChallenge = async () => {
        if (!previewChallenge) return;
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await axios.post('/api/challenges', {
                ...previewChallenge,
                created_by: user.id
            });
            setChallenges([res.data, ...challenges]);
            setPreviewChallenge(null);
        } catch (err) {
            console.error('Save failed:', err);
        }
    };

    const deleteChallenge = async (id) => {
        if (!window.confirm('Delete this challenge?')) return;
        try {
            await axios.delete(`/api/challenges/${id}`);
            setChallenges(challenges.filter(c => c.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-100px)] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-2xl bg-background/50 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Coding</span> Challenges
                            <Code2 size={40} className="text-primary hidden sm:block" />
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium tracking-wide">Manage algorithmic tasks and technical assessments.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 relative z-10">
                        <button onClick={() => setShowGenModal(true)} className="group relative overflow-hidden px-6 py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-primary to-purple-600 text-white shadow-[0_0_30px_-5px_rgba(var(--primary),0.5)] hover:shadow-[0_0_40px_-5px_rgba(var(--primary),0.7)] hover:scale-[1.02] transition-all flex items-center gap-2">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <Zap size={18} className="group-hover:animate-bounce" /> Auto-Generate (AI)
                        </button>
                        <button className="px-6 py-3 rounded-2xl font-bold text-sm bg-background/60 backdrop-blur-md border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-xl flex items-center gap-2 text-foreground">
                            <Plus size={18} className="text-primary" /> Manual Entry
                        </button>
                    </div>
                </div>

                {/* AI Preview Card */}
                <AnimatePresence>
                    {previewChallenge && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-8 rounded-[2.5rem] bg-gradient-to-br from-success/10 via-background/80 to-background/80 backdrop-blur-2xl border border-success/30 shadow-[0_0_50px_-10px_rgba(var(--success),0.2)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-success/20 rounded-full blur-3xl" />
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 text-success text-[10px] font-black uppercase tracking-widest mb-3 border border-success/30">
                                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" /> AI Draft Generated
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight">{previewChallenge.title}</h2>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setPreviewChallenge(null)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors border border-transparent">Discard</button>
                                    <button onClick={handleSaveChallenge} className="px-5 py-2.5 rounded-xl font-black text-sm bg-success text-white shadow-lg hover:shadow-success/30 hover:scale-105 transition-all flex items-center gap-2">
                                        <CheckCircle size={18} /> Publish to Library
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                <div className="p-5 rounded-2xl bg-background/50 border border-white/5 shadow-inner flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary"><ShieldAlert size={20}/></div>
                                    <div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Difficulty</p><p className="font-bold">{previewChallenge.difficulty}</p></div>
                                </div>
                                <div className="p-5 rounded-2xl bg-background/50 border border-white/5 shadow-inner flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500"><Database size={20}/></div>
                                    <div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Test Cases</p><p className="font-bold">{previewChallenge.test_cases?.length || 0} Scenarios</p></div>
                                </div>
                                <div className="p-5 rounded-2xl bg-background/50 border border-white/5 shadow-inner flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500"><Tags size={20}/></div>
                                    <div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Topics</p><p className="font-bold text-sm truncate">{previewChallenge.tags?.join(', ')}</p></div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Challenges Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground">
                            <Loader2 size={40} className="animate-spin mb-4 text-primary" />
                            <p className="font-black tracking-widest uppercase">Fetching Databanks...</p>
                        </div>
                    ) : challenges.length > 0 ? (
                        challenges.map((c, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={c.id} 
                                className="p-6 rounded-[2rem] bg-background/60 backdrop-blur-xl border border-white/10 hover:border-primary/40 shadow-xl group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                                
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-inner border ${
                                        c.difficulty === 'Easy' ? 'bg-success/10 text-success border-success/20' : 
                                        c.difficulty === 'Medium' ? 'bg-warning/10 text-warning border-warning/20' : 
                                        'bg-destructive/10 text-destructive border-destructive/20'
                                    }`}>
                                        {c.difficulty}
                                    </span>
                                    
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 rounded-lg bg-background hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground shadow-sm"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteChallenge(c.id)} className="p-2 rounded-lg bg-background hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground shadow-sm"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                <div className="mb-6 relative z-10 flex-1">
                                    <h3 className="text-xl font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors mb-2 line-clamp-2">{c.title}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {c.tags?.map(t => <span key={t} className="text-[10px] font-bold bg-muted/50 border border-border/50 text-muted-foreground px-2 py-0.5 rounded-md">{t}</span>)}
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold text-muted-foreground relative z-10">
                                    <span>Added {new Date(c.created_at).toLocaleDateString()}</span>
                                    <button className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                         <div className="col-span-full py-20 flex flex-col items-center justify-center bg-background/40 backdrop-blur-md border border-white/5 rounded-[3rem]">
                            <Database size={48} className="mb-4 text-muted-foreground/30" />
                            <p className="text-xl font-black tracking-tighter text-muted-foreground">Databases Empty</p>
                            <p className="text-sm font-medium text-muted-foreground mt-2">Generate AI challenges to begin.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Generator Modal */}
            <AnimatePresence>
                {showGenModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }} 
                          onClick={() => setShowGenModal(false)}
                          className="absolute inset-0 bg-background/80 backdrop-blur-xl" 
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-md relative z-60 p-8 rounded-[2.5rem] bg-background/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_-10px_rgba(var(--primary),0.3)] overflow-hidden"
                        >
                            <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/20 rounded-full blur-3xl -z-10" />
                            
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary shadow-inner border border-primary/20"><Sparkles size={24} /></div>
                                Initialize AI
                            </h2>
                            
                            <form onSubmit={handleGenerateAI} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Algorithmic Domain</label>
                                    <select 
                                        value={genConfig.topic}
                                        onChange={(e) => setGenConfig({...genConfig, topic: e.target.value})}
                                        className="w-full bg-background/50 border border-border focus:border-primary/50 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 ring-primary/10 outline-none shadow-inner"
                                        required
                                    >
                                        {dsaTopics.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Complexity Level</label>
                                    <select 
                                        value={genConfig.difficulty}
                                        onChange={(e) => setGenConfig({...genConfig, difficulty: e.target.value})}
                                        className="w-full bg-background/50 border border-border focus:border-primary/50 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 ring-primary/10 outline-none shadow-inner"
                                    >
                                        <option value="Easy">Easy (Recruit)</option>
                                        <option value="Medium">Medium (Veteran)</option>
                                        <option value="Hard">Hard (Elite)</option>
                                    </select>
                                </div>
                                
                                <div className="flex gap-3 pt-4 border-t border-border/50">
                                    <button type="button" onClick={() => setShowGenModal(false)} className="flex-1 py-3 rounded-xl font-bold text-sm bg-muted/50 hover:bg-muted border border-border/50 transition-colors text-foreground">Cancel</button>
                                    <button type="submit" disabled={generating} className="flex-[2] py-3 rounded-xl font-black text-sm bg-gradient-to-r from-primary to-purple-600 text-white shadow-xl hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                                        {generating ? <span className="flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Processing</span> : 'Ignite Synapses'}
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

export default FacultyChallenges;

// Helper component
const ChevronRight = ({ size, className }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>;
