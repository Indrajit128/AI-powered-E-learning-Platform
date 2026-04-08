import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, ChevronLeft, Flag, HelpCircle, Loader2 } from 'lucide-react';

const QuizAttempt = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: selectedIndex }
    const [timeLeft, setTimeLeft] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/api/quizzes/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                setQuiz(res.data);
                setTimeLeft(res.data.time_limit * 60);
            } catch (err) {
                console.error('Error fetching quiz:', err);
                navigate('/student/quizzes');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id, navigate]);

    useEffect(() => {
        if (timeLeft > 0 && !isFinished) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isFinished && quiz) {
            handleSubmit();
        }
    }, [timeLeft, isFinished, quiz]);

    const handleAnswerSelect = (index) => {
        if (isFinished) return;
        setAnswers({
            ...answers,
            [quiz.questions[currentQuestionIndex].id]: index
        });
    };

    const handleSubmit = async () => {
        if (isFinished) return;
        setIsFinished(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/quizzes/submit', {
                quizId: id,
                answers,
                timeTaken: quiz.time_limit * 60 - timeLeft
            }, {
                headers: { 'x-auth-token': token }
            });
            setResults(res.data);
        } catch (err) {
            console.error('Error submitting quiz:', err);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <Loader2 className="spinner" size={48} color="var(--primary)" />
            <p style={{ marginTop: '1rem', fontWeight: '600' }}>Loading Quiz Environment...</p>
        </div>
    );

    if (isFinished && results) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fade-in"
                style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'center' }}
            >
                <div className="card" style={{ padding: '4rem 2rem', borderRadius: '32px' }}>
                    <div style={{ width: '100px', height: '100px', background: 'var(--success)15', color: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <Trophy size={48} />
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 1rem' }}>Quiz Completed!</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem' }}>
                        Great job completing the <strong>{quiz.title}</strong> challenge.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)' }}>{results.score}/{results.total}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>SCORE</div>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>{Math.round((results.score / results.total) * 100)}%</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>ACCURACY</div>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--warning)' }}>+100</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>XP EARNED</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                         <button 
                            onClick={() => navigate('/student/quizzes')}
                            style={{ padding: '14px 32px', borderRadius: '14px', background: 'var(--text-main)', color: 'white', fontWeight: '700' }}
                         >
                            Back to Quizzes
                         </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div style={{ minHeight: '100vh', padding: '1rem' }}>
            {/* Quiz Top Bar */}
            <div style={{ 
                maxWidth: '1000px', 
                margin: '0 auto 2rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                background: 'white',
                borderRadius: '16px',
                boxShadow: 'var(--shadow)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'var(--primary)15', color: 'var(--primary)', borderRadius: '10px' }}>
                        <HelpCircle size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>{quiz.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Question {currentQuestionIndex + 1} of {quiz.questions.length}</div>
                    </div>
                </div>

                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '8px 16px', 
                    background: timeLeft < 60 ? '#fee2e2' : 'var(--bg-main)', 
                    color: timeLeft < 60 ? 'var(--danger)' : 'var(--text-main)',
                    borderRadius: '12px',
                    fontWeight: '800'
                }}>
                    <Clock size={18} /> {formatTime(timeLeft)}
                </div>
            </div>

            {/* Main Quiz Area */}
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem' }}>
                <div className="card" style={{ padding: '3rem', borderRadius: '24px' }}>
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '10px', marginBottom: '3rem', overflow: 'hidden' }}>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                            style={{ height: '100%', background: 'var(--primary)' }}
                        />
                    </div>

                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', lineHeight: '1.4', marginBottom: '2.5rem' }}>
                        {currentQuestion.question_text}
                    </h2>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {currentQuestion.options.map((option, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => handleAnswerSelect(idx)}
                                style={{ 
                                    padding: '1.25rem 1.5rem', 
                                    borderRadius: '16px', 
                                    border: '2px solid', 
                                    borderColor: answers[currentQuestion.id] === idx ? 'var(--primary)' : 'var(--border)',
                                    background: answers[currentQuestion.id] === idx ? 'var(--primary)05' : 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px'
                                }}
                            >
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '8px', 
                                    background: answers[currentQuestion.id] === idx ? 'var(--primary)' : 'var(--bg-main)',
                                    color: answers[currentQuestion.id] === idx ? 'white' : 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '0.9rem'
                                }}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span style={{ fontWeight: '600' }}>{option}</span>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between' }}>
                        <button 
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(v => v - 1)}
                            style={{ background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', border: 'none' }}
                        >
                            <ChevronLeft size={20} /> Previous
                        </button>
                        
                        {currentQuestionIndex === quiz.questions.length - 1 ? (
                            <button 
                                onClick={handleSubmit}
                                style={{ background: 'var(--success)', color: 'white', padding: '12px 32px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                Finish Quiz <CheckCircle2 size={20} />
                            </button>
                        ) : (
                            <button 
                                onClick={() => setCurrentQuestionIndex(v => v + 1)}
                                style={{ background: 'var(--text-main)', color: 'white', padding: '12px 32px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                Next Question <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Question Navigator Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                        <h4 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <Layout size={18} /> Question Map
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                            {quiz.questions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentQuestionIndex(i)}
                                    style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        padding: 0,
                                        borderRadius: '10px',
                                        background: i === currentQuestionIndex ? 'var(--text-main)' : answers[q.id] !== undefined ? 'var(--primary)15' : 'var(--bg-main)',
                                        color: i === currentQuestionIndex ? 'white' : answers[q.id] !== undefined ? 'var(--primary)' : 'var(--text-muted)',
                                        border: 'none',
                                        fontWeight: '700',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                         <Info size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> 
                         Your progress is saved automatically. Don't refresh the page.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QuizAttempt;
