import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Info, HelpCircle, Layout, Terminal, Play, Save, CheckCircle, XCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeEditor from '../components/CodeEditor';
import ConsoleOutput from '../components/ConsoleOutput';

const ChallengeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [results, setResults] = useState([]);
    const [executing, setExecuting] = useState(false);
    const [activeTab, setActiveTab] = useState('testcases');
    const [showHints, setShowHints] = useState(false);

    const languages = [
        { id: 'javascript', name: 'JavaScript' },
        { id: 'python', name: 'Python' },
        { id: 'java', name: 'Java' },
        { id: 'cpp', name: 'C++' }
    ];

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const res = await axios.get(`/api/challenges/${id}`);
                if (res.data) {
                    setChallenge(res.data);
                    setCode(res.data.starter_code_js || '// Write your code here');
                }
            } catch (err) {
                console.error('Error fetching challenge details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, [id]);

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        if (challenge) {
            if (lang === 'javascript') setCode(challenge.starter_code_js);
            else if (lang === 'python') setCode(challenge.starter_code_py);
            else if (lang === 'java') setCode(challenge.starter_code_java);
            else if (lang === 'cpp') setCode(challenge.starter_code_cpp);
        }
    };

    const runCode = async (customInput = '') => {
        setExecuting(true);
        setActiveTab('testcases');
        try {
            const visibleTC = customInput ? [{ input: customInput, output: '', hidden: false }] : challenge.test_cases.filter(tc => !tc.hidden);
            const res = await axios.post('/api/submissions/run-code', {
                code,
                language,
                test_cases: visibleTC
            });
            setResults(res.data);
            if (customInput) setActiveTab('console');
        } catch (err) {
            console.error('Run failed:', err);
            alert('Execution failed. Check connection.');
        } finally {
            setExecuting(false);
        }
    };

    const submitCode = async () => {
        setExecuting(true);
        setActiveTab('testcases');
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await axios.post('/api/submissions/submit-code', {
                challenge_id: challenge.id,
                user_id: user.id,
                code,
                language,
                test_cases: challenge.test_cases 
            });
            setResults(res.data.results);
            if (res.data.submission.status === 'Passed') {
                setActiveTab('testcases');
            }
        } catch (err) {
            console.error('Submit failed:', err);
            alert('Execution failed. Check connection.');
        } finally {
            setExecuting(false);
        }
    };

    useEffect(() => {
        const handleKeyPress = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                runCode();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [code, language]); // Added dependencies to ensure runCode has fresh state

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}><div className="spinner" /></div>;
    if (!challenge) return <div style={{ padding: '4rem', textAlign: 'center' }}><h2>Challenge not found</h2></div>;

    const difficultyColor = challenge.difficulty === 'Easy' ? '#10b981' : challenge.difficulty === 'Medium' ? '#f59e0b' : '#ef4444';

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', color: '#e2e8f0', overflow: 'hidden' }}>
            {/* Professional IDE Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', background: '#1e293b', borderBottom: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/student/coding')} 
                        style={{ padding: '8px', borderRadius: '10px', background: '#334155', border: 'none', cursor: 'pointer', color: 'white' }}
                    >
                        <ChevronLeft size={20} />
                    </motion.button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{challenge.title}</h2>
                            <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: `${difficultyColor}20`, color: difficultyColor, borderRadius: '6px', border: `1px solid ${difficultyColor}40`, fontWeight: '800', textTransform: 'uppercase' }}>
                                {challenge.difficulty}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>Workspace / Coding Arena / {challenge.title}</div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <select 
                            value={language} 
                            onChange={handleLanguageChange}
                            style={{ 
                                padding: '8px 32px 8px 16px', 
                                borderRadius: '8px', 
                                background: '#334155', 
                                border: '1px solid #475569', 
                                color: 'white', 
                                fontSize: '0.85rem', 
                                outline: 'none',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                        <Terminal size={12} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }} />
                    </div>
                    
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/student/coding')}
                        style={{ background: 'transparent', border: '1px solid #475569', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
                    >
                        Save Draft
                    </motion.button>
                </div>
            </div>

            {/* Split Screen Layout */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Panel: Description */}
                <div style={{ width: '35%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155', background: '#1e293b' }}>
                    <div style={{ display: 'flex', padding: '0 1rem', borderBottom: '1px solid #334155' }}>
                        {['Description', 'Submissions', 'Solutions'].map(tab => (
                            <button key={tab} style={{ 
                                padding: '12px 16px', 
                                border: 'none', 
                                background: 'transparent', 
                                color: tab === 'Description' ? '#60a5fa' : '#94a3b8',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                borderBottom: tab === 'Description' ? '2px solid #60a5fa' : 'none',
                                cursor: 'pointer'
                            }}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '6px', background: '#3b82f620', color: '#60a5fa', borderRadius: '8px' }}><Info size={16} /></div>
                            Problem Statement
                        </h3>
                        <div style={{ lineHeight: '1.7', color: '#cbd5e1', fontSize: '0.95rem' }} dangerouslySetInnerHTML={{ __html: challenge.description }} />
                        
                        <h3 style={{ marginTop: '2.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '6px', background: '#8b5cf620', color: '#a78bfa', borderRadius: '8px' }}><Layout size={16} /></div>
                            Example Cases
                        </h3>
                        {challenge.examples && challenge.examples.map((ex, i) => (
                            <div key={i} style={{ padding: '1rem', background: '#0f172a', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #334155' }}>
                                <div style={{ marginBottom: '8px', fontSize: '0.9rem' }}><strong style={{ color: '#94a3b8' }}>Input:</strong> <code style={{ color: '#f8fafc' }}>{ex.input}</code></div>
                                <div style={{ marginBottom: '8px', fontSize: '0.9rem' }}><strong style={{ color: '#94a3b8' }}>Output:</strong> <code style={{ color: '#f8fafc' }}>{ex.output}</code></div>
                                {ex.explanation && <div style={{ fontSize: '0.85rem', color: '#64748b', borderTop: '1px dashed #334155', paddingTop: '8px', marginTop: '8px' }}><strong>Explanation:</strong> {ex.explanation}</div>}
                            </div>
                        ))}

                        <h3 style={{ marginTop: '2.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '6px', background: '#f59e0b20', color: '#fbbf24', borderRadius: '8px' }}><HelpCircle size={16} /></div>
                            Constraints
                        </h3>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', background: '#1e293b', borderLeft: '3px solid #f59e0b', padding: '1rem', borderRadius: '0 12px 12px 0' }}>
                            {challenge.constraints}
                        </div>

                        <motion.button 
                            whileHover={{ background: '#334155' }}
                            onClick={() => setShowHints(!showHints)}
                            style={{ marginTop: '3rem', width: '100%', padding: '14px', borderRadius: '12px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                        >
                            {showHints ? 'Hide AI Assistance' : 'Request AI Hint'}
                        </motion.button>
                        <AnimatePresence>
                            {showHints && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '12px', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.2)', fontSize: '0.9rem' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 'bold' }}>
                                        <Zap size={16} /> Mentordeskk AI
                                    </div>
                                    Think about time complexity and edge cases. Check the solution approach for optimal complexity.
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Panel: Editor + Console */}
                <div style={{ width: '65%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0f172a' }}>
                    <div style={{ flex: '1.5', padding: '0.5rem', overflow: 'hidden' }}>
                        <CodeEditor 
                            language={language}
                            value={code}
                            onChange={(val) => setCode(val)}
                        />
                    </div>
                    
                    <div style={{ flex: '1', padding: '0.5rem', display: 'flex', overflow: 'hidden' }}>
                        <ConsoleOutput 
                            results={results}
                            loading={executing}
                            onRun={runCode}
                            onSubmit={submitCode}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </div>
                </div>
            </div>
            
            {/* Success Overlay Animation */}
            <AnimatePresence>
                {results.length > 0 && results.every(r => r.passed) && activeTab === 'testcases' && !executing && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass"
                        style={{ 
                            position: 'fixed', 
                            bottom: '40px', 
                            right: '40px', 
                            padding: '1.5rem 2.5rem', 
                            borderRadius: '24px', 
                            background: 'rgba(16, 185, 129, 0.95)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            boxShadow: '0 20px 50px rgba(16, 185, 129, 0.4)',
                            zIndex: 1000,
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}
                    >
                        <div style={{ background: 'white', color: '#10b981', padding: '8px', borderRadius: '50%' }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '900' }}>Excellence Achieved!</div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>All test cases passed. Reclaiming rewards...</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChallengeDetails;
