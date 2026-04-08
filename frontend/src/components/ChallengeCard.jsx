import { Code, ChevronRight, Clock, Star, Trophy, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ChallengeCard = ({ challenge, index }) => {
    const difficultyColors = {
        'Easy': '#10b981',
        'Medium': '#f59e0b',
        'Hard': '#ef4444'
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card stat-card"
            style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                border: '1px solid var(--border)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                ':hover': { transform: 'translateY(-4px)', borderColor: 'var(--primary)' }
            }}
        >
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ padding: '8px', background: `${difficultyColors[challenge.difficulty]}20`, borderRadius: '8px', color: difficultyColors[challenge.difficulty], fontWeight: 'bold', fontSize: '0.75rem' }}>
                        {challenge.difficulty}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <Star size={14} fill="var(--warning)" color="var(--warning)" />
                        <Star size={14} fill="var(--warning)" color="var(--warning)" />
                        <Star size={14} fill="var(--border)" color="var(--border)" />
                    </div>
                </div>
                
                <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.15rem', fontWeight: '700' }}>{challenge.title}</h3>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
                    {challenge.tags && challenge.tags.map(tag => (
                        <span key={tag} style={{ 
                            padding: '2px 8px', 
                            background: '#f1f1f1', 
                            color: '#666', 
                            borderRadius: '4px', 
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <Tag size={10} /> {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> 45 Mins</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Trophy size={14} /> 100 XP</span>
                </div>

                <Link to={`/student/coding-challenge/${challenge.id}`}>
                    <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '10px' }}>
                        Solve Challenge <ChevronRight size={18} />
                    </button>
                </Link>
            </div>
        </motion.div>
    );
};

export default ChallengeCard;
