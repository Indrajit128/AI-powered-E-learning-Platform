import { useState, useEffect } from 'react';
import axios from 'axios';
import { Code, ChevronRight, Clock, Star, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CodingChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const token = localStorage.getItem('token');
        // In a real app, this would be a filtered API call
        const res = await axios.get('/api/student/assignments/batch_0', { // Using mock batch_0
          headers: { 'x-auth-token': token }
        });
        const codingTasks = res.data.filter(a => a.type === 'coding');
        setChallenges(codingTasks);
      } catch (err) {
        console.error('Error fetching coding challenges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em' }}>
          Coding <span className="text-gradient">Arena</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>
          Sharpen your skills with AI-generated programming challenges.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <p>Loading challenges...</p>
        ) : challenges.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
            <Code size={64} style={{ color: 'var(--border)', marginBottom: '1.5rem' }} />
            <h3>No coding challenges available</h3>
            <p style={{ color: 'var(--text-muted)' }}>Check back later for new programming tasks.</p>
          </div>
        ) : (
          challenges.map((challenge, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={challenge.id} 
              className="card stat-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ padding: '10px', background: '#4f46e515', borderRadius: '12px', color: 'var(--primary)' }}>
                  <Code size={24} />
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <Star size={14} fill="var(--warning)" color="var(--warning)" />
                  <Star size={14} fill="var(--warning)" color="var(--warning)" />
                  <Star size={14} fill="var(--border)" color="var(--border)" />
                </div>
              </div>
              
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem' }}>{challenge.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {challenge.subject} - AI generated challenge to test your logic and syntax.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> 45 Mins</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Trophy size={14} /> 100 Pts</span>
              </div>

              <Link to={`/student/attempt/${challenge.id}`}>
                <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  Solve Challenge <ChevronRight size={18} />
                </button>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default CodingChallenges;
