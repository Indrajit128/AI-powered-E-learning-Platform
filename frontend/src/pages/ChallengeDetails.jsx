import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Info, HelpCircle, Layout, Terminal, Play, Save, CheckCircle, XCircle } from 'lucide-react';
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
                setChallenge(res.data);
                // Initial code set
                setCode(res.data.starter_code_js || '// Write your code here');
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
        // Switch starter code
        if (challenge) {
            if (lang === 'javascript') setCode(challenge.starter_code_js);
            else if (lang === 'python') setCode(challenge.starter_code_py);
            else if (lang === 'java') setCode(challenge.starter_code_java);
            else if (lang === 'cpp') setCode(challenge.starter_code_cpp);
        }
    };

    const runCode = async () => {
        setExecuting(true);
        setActiveTab('testcases');
        try {
            // Run against non-hidden test cases
            const visibleTC = challenge.test_cases.filter(tc => !tc.hidden);
            const res = await axios.post('/api/submissions/run-code', {
                code,
                language,
                test_cases: visibleTC
            });
            setResults(res.data);
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
                test_cases: challenge.test_cases // Run all test cases
            });
            setResults(res.data.results);
            if (res.data.submission.status === 'Passed') {
                alert('Congratulations! All test cases passed! 🚀');
            } else {
                alert('Submission failed. Some test cases didn\'t pass.');
            }
        } catch (err) {
            console.error('Submit failed:', err);
            alert('Execution failed. Check connection.');
        } finally {
            setExecuting(false);
        }
    };

    if (loading) return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
    if (!challenge) return <div style={{ padding: '4rem', textAlign: 'center' }}><h2>Challenge not found</h2></div>;

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/student/coding')} style={{ padding: '8px', borderRadius: '50%', background: '#f5f5f5', border: 'none', cursor: 'pointer' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>{challenge.title}</h2>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Difficulty: {challenge.difficulty}</span>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select 
                        value={language} 
                        onChange={handleLanguageChange}
                        style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.9rem', outline: 'none' }}
                    >
                        {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Split Screen Layout */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Panel: Description */}
                <div style={{ width: '40%', padding: '2rem', overflowY: 'auto', borderRight: '1px solid var(--border)', background: '#fff' }}>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Info size={20} color="var(--primary)" /> Description</h3>
                    <div style={{ lineHeight: '1.6', color: '#444' }} dangerouslySetInnerHTML={{ __html: challenge.description }} />
                    
                    <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Layout size={20} color="var(--primary)" /> Examples</h3>
                    {challenge.examples && challenge.examples.map((ex, i) => (
                        <div key={i} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #eee' }}>
                            <div style={{ marginBottom: '8px' }}><strong>Input:</strong> <code>{ex.input}</code></div>
                            <div style={{ marginBottom: '8px' }}><strong>Output:</strong> <code>{ex.output}</code></div>
                            {ex.explanation && <div style={{ fontSize: '0.9rem', color: '#666', borderTop: '1px dashed #ddd', paddingTop: '8px' }}><strong>Explanation:</strong> {ex.explanation}</div>}
                        </div>
                    ))}

                    <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><HelpCircle size={20} color="var(--primary)" /> Constraints</h3>
                    <div style={{ color: '#666', fontSize: '0.9rem', background: '#fff9e6', padding: '1rem', borderRadius: '12px', border: '1px solid #ffeeba' }}>
                        {challenge.constraints}
                    </div>

                    <button 
                        onClick={() => setShowHints(!showHints)}
                        style={{ marginTop: '2rem', width: '100%', padding: '12px', borderRadius: '10px', background: '#f5f5f5', border: '1px solid #ddd', color: '#666', fontWeight: 'bold' }}
                    >
                        {showHints ? 'Hide Hints' : 'Show Hints'}
                    </button>
                    {showHints && (
                        <div className="fade-in" style={{ marginTop: '1rem', padding: '1rem', background: '#e0e7ff50', borderRadius: '12px', color: 'var(--primary)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                            Hint: Think about time complexity and edge cases. Check the solution approach for optimal complexity.
                        </div>
                    )}
                </div>

                {/* Right Panel: Editor + Console */}
                <div style={{ width: '60%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ flex: '3', padding: '1rem', overflow: 'hidden' }}>
                        <CodeEditor 
                            language={language}
                            value={code}
                            onChange={(val) => setCode(val)}
                        />
                    </div>
                    
                    <div style={{ flex: '1.5', padding: '1rem', paddingTop: 0, overflow: 'hidden' }}>
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
        </div>
    );
};

export default ChallengeDetails;
