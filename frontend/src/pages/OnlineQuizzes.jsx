import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, ChevronRight, Clock, Star, Trophy, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const OnlineQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/student/assignments/batch_0', { // Mock batch_0
          headers: { 'x-auth-token': token }
        });
        const quizTasks = res.data.filter(a => a.type === 'quiz');
        setQuizzes(quizTasks);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em' }}>
          Assessment <span className="text-gradient">Center</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>
          Evaluate your understanding with AI-powered quizzes.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <p>Loading quizzes...</p>
        ) : quizzes.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
            <FileText size={64} style={{ color: 'var(--border)', marginBottom: '1.5rem' }} />
            <h3>No quizzes available right now</h3>
            <p style={{ color: 'var(--text-muted)' }}>Stay tuned for upcoming assessments.</p>
          </div>
        ) : (
          quizzes.map((quiz, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              key={quiz.id} 
              className="card stat-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ padding: '10px', background: '#ec489915', borderRadius: '12px', color: '#ec4899' }}>
                  <BookOpen size={24} />
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', background: '#ec489920', color: '#ec4899', padding: '4px 10px', borderRadius: '100px' }}>
                  TIMED QUIZ
                </div>
              </div>
              
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem' }}>{quiz.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Subject: <strong>{quiz.subject}</strong> - Focus on core concepts and logical reasoning.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                <div style={{ padding: '8px 12px', background: 'var(--background)', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <Clock size={14} color="var(--primary)" /> 20 Minutes
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--background)', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <BookOpen size={14} color="var(--success)" /> Exam Hub
                </div>
              </div>

              <Link to={`/student/attempt/${quiz.id}`}>
                <button style={{ width: '100%', background: 'var(--text-main)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  Start Quiz <ChevronRight size={18} />
                </button>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default OnlineQuizzes;
