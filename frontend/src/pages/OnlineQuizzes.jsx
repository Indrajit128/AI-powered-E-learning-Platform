import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, ChevronRight, Clock, Star, Trophy, FileText, Zap, Search, Plus, Loader2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const OnlineQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/quizzes', {
        headers: { 'x-auth-token': token }
      });
      setQuizzes(res.data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!topic) return;
    
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/quizzes/generate', 
        { topic, difficulty, timeLimit: 15 },
        { headers: { 'x-auth-token': token } }
      );
      setShowAIModal(false);
      setTopic('');
      fetchQuizzes();
    } catch (err) {
      alert('Failed to generate quiz. AI might be busy!');
    } finally {
      setGenerating(false);
    }
  };

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        marginBottom: '3rem',
        padding: '0 1rem'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.04em' }}>
            Quiz <span className="text-gradient">Engine</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1.1rem', fontWeight: '500' }}>
            Master your subjects with AI-powered adaptive assessments.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAIModal(true)}
          style={{ 
            background: 'var(--text-main)', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '0.95rem',
            fontWeight: '700',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }}
        >
          <Zap size={18} fill="currentColor" /> Generate AI Quiz
        </motion.button>
      </div>

      {/* Global Search */}
      <div style={{ maxWidth: '600px', margin: '0 auto 3rem', position: 'relative' }}>
         <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
         <input 
            type="text" 
            placeholder="Search by topic or subject..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '16px 16px 16px 48px', 
              borderRadius: '18px', 
              border: '1px solid var(--border)',
              background: 'white',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: 'var(--shadow)'
            }}
         />
      </div>

      {/* Quizzes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
        {loading && quizzes.length === 0 ? (
          Array(6).fill(0).map((_, i) => (
             <div key={i} className="card" style={{ height: '300px', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
          ))
        ) : filteredQuizzes.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '6rem 2rem' }}>
            <FileText size={64} style={{ color: 'var(--border)', marginBottom: '1.5rem' }} />
            <h2 style={{ fontWeight: '800' }}>No quizzes found</h2>
            <p style={{ color: 'var(--text-muted)' }}>Generate one with AI or try a different search!</p>
          </div>
        ) : (
          filteredQuizzes.map((quiz, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={quiz.id} 
              className="card stat-card"
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              {/* Badge for AI Generated */}
              {quiz.is_ai_generated && (
                <div style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '12px', 
                  background: 'var(--primary)', 
                  color: 'white', 
                  fontSize: '0.65rem', 
                  fontWeight: '900', 
                  padding: '4px 8px', 
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Zap size={10} fill="currentColor" /> AI ENGINE
                </div>
              )}

              <div style={{ padding: '40px 30px' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '10px' }}>
                   <div style={{ padding: '6px 12px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                      {quiz.difficulty.toUpperCase()}
                   </div>
                   <div style={{ padding: '6px 12px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)' }}>
                      {quiz.topic.toUpperCase()}
                   </div>
                </div>

                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '800', lineHeight: '1.3' }}>{quiz.title}</h3>
                
                <div style={{ display: 'flex', gap: '20px', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {quiz.time_limit}m</span>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> 10 Qs</span>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Trophy size={16} color="var(--warning)" /> 100 XP</span>
                </div>

                <Link to={`/student/quiz/${quiz.id}`} style={{ textDecoration: 'none' }}>
                  <motion.button 
                    whileHover={{ x: 5 }}
                    style={{ 
                      width: '100%', 
                      background: 'var(--text-main)', 
                      color: 'white', 
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '1rem',
                      fontWeight: '700',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '10px' 
                    }}
                  >
                    Attempt Quiz <ChevronRight size={18} />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* AI Generation Modal */}
      <AnimatePresence>
        {showAIModal && (
          <div style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(15, 23, 42, 0.4)', 
            backdropFilter: 'blur(8px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000,
            padding: '1rem'
          }}>
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="card"
               style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '24px' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '60px', height: '60px', background: 'var(--bg-main)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                   <Zap size={32} color="var(--primary)" fill="var(--primary)30" />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '900', margin: '0 0 0.5rem' }}>AI Quiz Generator</h2>
                <p style={{ color: 'var(--text-muted)' }}>Generate a custom MCQ challenge in seconds.</p>
              </div>

              <form onSubmit={handleGenerateQuiz}>
                <div className="input-group">
                  <label>What topic do you want to master?</label>
                  <input 
                    type="text" 
                    placeholder="e.g. React Hooks, Node.js Streams, OS Scheduling" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Difficulty Level</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="Easy">Beginner Friendly</option>
                    <option value="Medium">Standard Challenge</option>
                    <option value="Hard">Advanced Master</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowAIModal(false)}
                    style={{ flex: 1, background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={generating}
                    style={{ flex: 2, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {generating ? (
                      <><Loader2 className="spinner-small" size={18} /> Generating...</>
                    ) : (
                      'Generate Quiz'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default OnlineQuizzes;
