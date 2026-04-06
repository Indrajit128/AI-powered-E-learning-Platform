import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, ChevronRight, Clock, Star, Trophy, Crosshair, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PracticeAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/student/assignments/batch_0', { // Mock batch_0
          headers: { 'x-auth-token': token }
        });
        // Filter for crossword, flashcards, fill_blanks, etc.
        const practiceTasks = res.data.filter(a => a.type !== 'quiz' && a.type !== 'coding');
        setAssignments(practiceTasks);
      } catch (err) {
        console.error('Error fetching practice assignments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em' }}>
          Practice <span className="text-gradient">Hub</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>
          Interactive tools to master your subjects through crosswords and flashcards.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <p>Loading practices...</p>
        ) : assignments.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
            <Zap size={64} style={{ color: 'var(--border)', marginBottom: '1.5rem' }} />
            <h3>No practice tasks yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>We're preparing interactive modules for you.</p>
          </div>
        ) : (
          assignments.map((task, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={task.id} 
              className="card stat-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ padding: '10px', background: 'var(--secondary)15', borderRadius: '12px', color: 'var(--secondary)' }}>
                  <Crosshair size={24} />
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', background: 'var(--success)10', color: 'var(--success)', padding: '4px 10px', borderRadius: '100px' }}>
                  INTERACTIVE
                </div>
              </div>
              
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem' }}>{task.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Type: <strong>{task.type.toUpperCase()}</strong> - Fun and interactive way to learn <strong>{task.subject}</strong> concepts.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                <div style={{ padding: '8px 12px', background: 'var(--background)', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)' }}>
                   <Clock size={14} color="var(--primary)" /> 15 Mins
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--background)', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)' }}>
                   <BookOpen size={14} color="var(--secondary)" /> Practice Hub
                </div>
              </div>

              <Link to={`/student/attempt/${task.id}`}>
                <button style={{ width: '100%', background: 'transparent', border: '1.5px solid var(--primary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  Start Practice <ChevronRight size={18} />
                </button>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default PracticeAssignments;
