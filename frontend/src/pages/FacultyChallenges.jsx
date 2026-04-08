import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Zap, Trash2, Edit2, Info, BookOpen, CheckCircle, Database, Layout, ShieldAlert } from 'lucide-react';
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
            alert('Challenge saved to Mentordeskk! 🚀');
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
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>Faculty <span className="text-gradient">Control Panel</span></h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage coding challenges and student performance.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setShowGenModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={18} /> Generate with AI
                    </button>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Create Manually
                    </button>
                </div>
            </div>

            {/* Preview Area (If any) */}
            <AnimatePresence>
                {previewChallenge && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ marginBottom: '3rem', padding: '2rem', background: '#f0f4ff', borderRadius: '24px', border: '1px solid var(--primary)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>AI Proofreading: {previewChallenge.title}</h2>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={handleSaveChallenge} className="btn-primary">Save to Library</button>
                                <button onClick={() => setPreviewChallenge(null)} className="btn-secondary">Discard</button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontStyle: 'italic', fontSize: '0.9rem', color: '#666' }}>
                            <div>Difficulty: <strong>{previewChallenge.difficulty}</strong></div>
                            <div>Test Cases: <strong>{previewChallenge.test_cases?.length || 0}</strong></div>
                            <div>Tags: <strong>{previewChallenge.tags?.join(', ')}</strong></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                            <th style={{ padding: '1.25rem' }}>Challenge Details</th>
                            <th style={{ padding: '1.25rem' }}>Difficulty</th>
                            <th style={{ padding: '1.25rem' }}>Tags</th>
                            <th style={{ padding: '1.25rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>Fetching records...</td></tr>
                        ) : challenges.length > 0 ? (
                            challenges.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ fontWeight: 'bold' }}>{c.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(c.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <span style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '0.8rem', 
                                            fontWeight: 'bold',
                                            background: c.difficulty === 'Easy' ? '#10b98120' : c.difficulty === 'Medium' ? '#f59e0b20' : '#ef444420',
                                            color: c.difficulty === 'Easy' ? '#10b981' : c.difficulty === 'Medium' ? '#f59e0b' : '#ef4444'
                                        }}>
                                            {c.difficulty}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {c.tags?.map(t => <span key={t} style={{ fontSize: '0.75rem', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>{t}</span>)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={18} /></button>
                                            <button onClick={() => deleteChallenge(c.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>No challenges created yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* AI Modal */}
            <AnimatePresence>
                {showGenModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="card" style={{ width: '400px', padding: '2rem' }}
                        >
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Zap color="var(--primary)" /> Flash Generate</h2>
                            <form onSubmit={handleGenerateAI}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>Target Topic</label>
                                    <select 
                                        value={genConfig.topic}
                                        onChange={(e) => setGenConfig({...genConfig, topic: e.target.value})}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }}
                                        required
                                    >
                                        {dsaTopics.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>Difficulty</label>
                                    <select 
                                        value={genConfig.difficulty}
                                        onChange={(e) => setGenConfig({...genConfig, difficulty: e.target.value})}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" disabled={generating} className="btn-primary" style={{ flex: 1 }}>
                                        {generating ? 'Summoning AI...' : 'Generate New'}
                                    </button>
                                    <button type="button" onClick={() => setShowGenModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
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
