import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Zap, Trash2, Edit2, Info, BookOpen, CheckCircle, Database, Layout, ShieldAlert, Sparkles, Loader2, Code2, Tags, ChevronRight } from 'lucide-react';
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
                created_by: user?.id
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
        <div className="fade-in" style={{ paddingBottom: '4rem' }}>
            
            {/* Header */}
            <div className="flex-responsive" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Coding <span className="text-gradient">Challenges</span>
                        <Code2 size={32} color="var(--primary)" />
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>
                        Manage algorithmic tasks and technical assessments.
                    </p>
                </div>
                
                <div className="header-actions">
                    <button onClick={() => setShowGenModal(true)} style={{ display: 'flex', items: 'center', gap: '8px', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '800' }}>
                        <Zap size={18} /> Auto-Generate
                    </button>
                    <button style={{ display: 'flex', items: 'center', gap: '8px', padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', fontWeight: '700' }}>
                        <Plus size={18} /> Manual Entry
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
                        className="card"
                        style={{ marginBottom: '2.5rem', borderColor: 'var(--success)', background: '#10b98105' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#10b98120', color: 'var(--success)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} className="animate-pulse" /> AI Draft Generated
                                </div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>{previewChallenge.title}</h2>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => setPreviewChallenge(null)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Discard</button>
                                <button onClick={handleSaveChallenge} style={{ background: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CheckCircle size={18} /> Publish
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                            <div style={{ padding: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.5rem', background: '#4f46e510', color: 'var(--primary)', borderRadius: '8px' }}><ShieldAlert size={20}/></div>
                                <div><p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Difficulty</p><p style={{ margin: 0, fontWeight: '700' }}>{previewChallenge.difficulty}</p></div>
                            </div>
                            <div style={{ padding: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.5rem', background: '#a855f710', color: '#a855f7', borderRadius: '8px' }}><Database size={20}/></div>
                                <div><p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Test Cases</p><p style={{ margin: 0, fontWeight: '700' }}>{previewChallenge.test_cases?.length || 0} Scenarios</p></div>
                            </div>
                            <div style={{ padding: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.5rem', background: '#0ea5e910', color: '#0ea5e9', borderRadius: '8px' }}><Tags size={20}/></div>
                                <div><p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Topics</p><p style={{ margin: 0, fontWeight: '700', fontSize: '0.85rem' }}>{previewChallenge.tags?.join(', ')}</p></div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Challenges Grid */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <Loader2 size={40} className="animate-spin text-primary" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                    <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>Fetching Databanks...</p>
                </div>
            ) : challenges.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {challenges.map((c, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={c.id} 
                            className="card stat-card"
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                <span style={{ 
                                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase',
                                    background: c.difficulty === 'Easy' ? '#10b98115' : c.difficulty === 'Medium' ? '#f59e0b15' : '#ef444415',
                                    color: c.difficulty === 'Easy' ? 'var(--success)' : c.difficulty === 'Medium' ? 'var(--warning)' : 'var(--danger)'
                                }}>
                                    {c.difficulty}
                                </span>
                                
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '6px' }}><Edit2 size={16} /></button>
                                    <button onClick={() => deleteChallenge(c.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', padding: '6px' }}><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.2rem', lineHeight: '1.4' }}>{c.title}</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {c.tags?.map(t => (
                                        <span key={t} style={{ fontSize: '0.75rem', fontWeight: '600', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '4px' }}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                                <span>Added {new Date(c.created_at).toLocaleDateString()}</span>
                                <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4f46e510', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                 <div className="card" style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderStyle: 'dashed', borderWidth: '2px' }}>
                    <Database size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>Databases Empty</p>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Generate AI challenges to begin.</p>
                </div>
            )}

            {/* AI Generator Modal */}
            <AnimatePresence>
                {showGenModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }} 
                          onClick={() => setShowGenModal(false)}
                          style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} 
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="card"
                            style={{ position: 'relative', width: '100%', maxWidth: '400px', zIndex: 1010, padding: '2rem' }}
                        >
                            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#4f46e510', color: 'var(--primary)', display: 'flex' }}><Sparkles size={20} /></div>
                                Initialize AI
                            </h2>
                            
                            <form onSubmit={handleGenerateAI} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Algorithmic Domain</label>
                                    <select 
                                        value={genConfig.topic}
                                        onChange={(e) => setGenConfig({...genConfig, topic: e.target.value})}
                                        required
                                    >
                                        {dsaTopics.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Complexity Level</label>
                                    <select 
                                        value={genConfig.difficulty}
                                        onChange={(e) => setGenConfig({...genConfig, difficulty: e.target.value})}
                                    >
                                        <option value="Easy">Easy (Recruit)</option>
                                        <option value="Medium">Medium (Veteran)</option>
                                        <option value="Hard">Hard (Elite)</option>
                                    </select>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                    <button type="button" onClick={() => setShowGenModal(false)} style={{ flex: 1, background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)' }}>Cancel</button>
                                    <button type="submit" disabled={generating} style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        {generating ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Loader2 size={18} className="animate-spin" /> Processing</span> : 'Ignite Synapses'}
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
