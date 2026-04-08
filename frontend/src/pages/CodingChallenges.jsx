import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Filter, Code, Info, CheckCircle, Database, Layout, BookOpen, User, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChallengeCard from '../components/ChallengeCard';

const CodingChallenges = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficulty, setDifficulty] = useState('All');
    const [topic, setTopic] = useState('All');
    const [stats, setStats] = useState({ solved: 0, attempted: 0, points: 0, accuracy: 0 });

    const topics = ['All', 'Arrays', 'Strings', 'Recursion', 'Dynamic Programming', 'Graph', 'Stack', 'Queue', 'Binary Tree', 'Linked List', 'Searching', 'Sorting', 'Hashing', 'Greedy Algorithm', 'Sliding Window', 'Two Pointer'];
    const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const res = await axios.get('/api/challenges');
                setChallenges(res.data);
                
                // Fetch stats (mock for now or from submissions)
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
        <div className="fade-in" style={{ padding: '2rem' }}>
            {/* Header / Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em' }}>
                        Coding <span className="text-gradient">Arena</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Master your coding skills with Mentordeskk challenges.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '0.75rem 1.5rem', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.solved}</div>
                        <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Solved</div>
                    </div>
                    <div className="card" style={{ padding: '0.75rem 1.5rem', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{stats.points}</div>
                        <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>XP Points</div>
                    </div>
                    <div className="card" style={{ padding: '0.75rem 1.5rem', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.accuracy}%</div>
                        <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Accuracy</div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search challenges..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '10px', border: '1px solid #ddd' }}
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Filter size={18} color="#666" />
                    <select 
                        value={difficulty} 
                        onChange={(e) => setDifficulty(e.target.value)}
                        style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}
                    >
                        {difficulties.map(d => <option key={d} value={d}>{d} Difficulty</option>)}
                    </select>
                    
                    <select 
                        value={topic} 
                        onChange={(e) => setTopic(e.target.value)}
                        style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}
                    >
                        {topics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* Challenges Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                        <p>Loading the arena...</p>
                    </div>
                ) : filteredChallenges.length > 0 ? (
                    filteredChallenges.map((challenge, idx) => (
                        <ChallengeCard key={challenge.id} challenge={challenge} index={idx} />
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: '#f9f9f9', borderRadius: '20px' }}>
                        <Info size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
                        <h3>No challenges found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodingChallenges;
