import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Filter, Code, Info, CheckCircle, Database, Layout, BookOpen, User, Zap, Star, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChallengeCard from '../components/ChallengeCard';
import { supabase } from '../services/supabase';

const CodingChallenges = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficulty, setDifficulty] = useState('All');
    const [topic, setTopic] = useState('All');
    const [stats, setStats] = useState({ solved: 0, attempted: 0, points: 0, accuracy: 0 });
    const [notification, setNotification] = useState(null);

    const topics = ['All', 'Arrays', 'Strings', 'Recursion', 'Dynamic Programming', 'Graph', 'Stack', 'Queue', 'Binary Tree', 'Linked List', 'Searching', 'Sorting', 'Hashing', 'Greedy Algorithm', 'Sliding Window', 'Two Pointer'];
    const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const res = await axios.get('/api/challenges');
                setChallenges(res.data);
                
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    const subRes = await axios.get(`/api/submissions/user/${user.id}`);
                    const solved = subRes.data.filter(s => s.status === 'Passed').length;
                    const attempted = subRes.data.length;
                    const points = solved * 100;
                    const accuracy = attempted > 0 ? (solved / attempted) * 100 : 0;
                    setStats({ solved, attempted, points, accuracy: Math.round(accuracy) });
                }
            } catch (err) {
                console.error('Error fetching challenges:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();

        // Real-time Subscriptions
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && supabase) {
            const channel = supabase
                .channel('realtime_submissions')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'challenge_submissions', filter: `user_id=eq.${user.id}` },
                    (payload) => {
                        console.log('Real-time submission detected:', payload);
                        setNotification('New submission detected! Updating stats...');
                        setTimeout(() => setNotification(null), 3000);
                        fetchChallenges(); 
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, []);

    const filteredChallenges = useMemo(() => {
        return challenges.filter(c => {
            const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDiff = difficulty === 'All' || c.difficulty === difficulty;
            const matchesTopic = topic === 'All' || (c.tags && c.tags.includes(topic));
            return matchesSearch && matchesDiff && matchesTopic;
        });
    }, [challenges, searchTerm, difficulty, topic]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            {/* Real-time Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        style={{ 
                            position: 'fixed', 
                            bottom: '2rem', 
                            right: '2rem', 
                            background: '#10b981', 
                            color: 'white', 
                            padding: '1rem 1.5rem', 
                            borderRadius: '12px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            zIndex: 1000,
                            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <Zap size={18} />
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{notification}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Hero Section */}
            <div className="animate-mesh grid-pattern" style={{ 
                padding: '4rem 2rem 6rem', 
                textAlign: 'center', 
                borderBottom: '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-0.04em', margin: '0 0 1rem' }}>
                        Coding <span className="text-gradient">Arena</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        Join the elite leagues of Mentordeskk. Master Data Structures, Algorithms, and real-world coding challenges with our state-of-the-art arena.
                    </p>
                </motion.div>

                {/* Glass Stats Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                    gap: '1.5rem', 
                    maxWidth: '1000px', 
                    margin: '0 auto',
                    position: 'relative',
                    zIndex: 2
                }}>
                    {[
                        { label: 'Solved', value: stats.solved, icon: <CheckCircle size={20} />, color: '#10b981' },
                        { label: 'XP Points', value: stats.points, icon: <Zap size={20} />, color: '#f59e0b' },
                        { label: 'Accuracy', value: `${stats.accuracy}%`, icon: <Star size={20} />, color: '#0ea5e9' },
                        { label: 'Rank', value: '#124', icon: <Trophy size={20} />, color: '#8b5cf6' }
                    ].map((s, i) => (
                        <motion.div 
                            key={s.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            className="glass" 
                            style={{ padding: '1.5rem', borderRadius: '20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}
                        >
                            <div style={{ padding: '10px', background: `${s.color}20`, borderRadius: '12px', color: s.color }}>
                                {s.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{s.value}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{s.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div style={{ padding: '0 2rem', marginTop: '-30px', position: 'relative', zIndex: 10, maxWidth: '1400px', margin: '-30px auto 0' }}>
                {/* Search & Filter Floating Bar */}
                <div className="glass" style={{ 
                    padding: '1.25rem', 
                    borderRadius: '24px', 
                    marginBottom: '3rem', 
                    display: 'flex', 
                    gap: '1.5rem', 
                    flexWrap: 'wrap', 
                    alignItems: 'center',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} size={20} />
                        <input 
                            type="text" 
                            placeholder="Master your algorithms... search by title or topic" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '14px 14px 14px 48px', 
                                borderRadius: '16px', 
                                border: '1px solid var(--border)',
                                fontSize: '1rem',
                                outline: 'none',
                                background: 'white'
                            }}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <Filter style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={16} />
                            <select 
                                value={difficulty} 
                                onChange={(e) => setDifficulty(e.target.value)}
                                style={{ padding: '12px 12px 12px 36px', borderRadius: '14px', border: '1px solid var(--border)', background: 'white', appearance: 'none', fontWeight: '500' }}
                            >
                                {difficulties.map(d => <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d}</option>)}
                            </select>
                        </div>
                        
                        <div style={{ position: 'relative' }}>
                            <Database style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={16} />
                            <select 
                                value={topic} 
                                onChange={(e) => setTopic(e.target.value)}
                                style={{ padding: '12px 12px 12px 36px', borderRadius: '14px', border: '1px solid var(--border)', background: 'white', appearance: 'none', fontWeight: '500' }}
                            >
                                {topics.map(t => <option key={t} value={t}>{t === 'All' ? 'All Topics' : t}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Challenges Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem', paddingBottom: '4rem' }}>
                    <AnimatePresence>
                        {loading ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '8rem 0' }}>
                                <div className="spinner" style={{ margin: '0 auto 2rem', width: '60px', height: '60px', border: '5px solid var(--border)', borderTopColor: 'var(--primary)' }} />
                                <h3 style={{ fontWeight: '700', color: 'var(--text-muted)' }}>Preparing the Arena...</h3>
                            </div>
                        ) : filteredChallenges.length > 0 ? (
                            filteredChallenges.map((challenge, idx) => (
                                <ChallengeCard key={challenge.id} challenge={challenge} index={idx} />
                            ))
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ gridColumn: '1/-1', textAlign: 'center', padding: '8rem 0', background: 'rgba(255,255,255,0.5)', borderRadius: '32px', border: '2px dashed var(--border)' }}
                            >
                                <Info size={64} color="var(--border)" style={{ marginBottom: '1.5rem' }} />
                                <h2 style={{ fontWeight: '800' }}>No challenges match your quest</h2>
                                <p style={{ color: 'var(--text-muted)' }}>Try broadening your search or exploring other topics.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default CodingChallenges;
