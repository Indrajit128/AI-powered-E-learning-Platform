import { Code, ChevronRight, Clock, Star, Trophy, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ChallengeCard = ({ challenge, index }) => {
    const difficultyColors = {
        'Easy': '#10b981',
        'Medium': '#f59e0b',
        'Hard': '#ef4444'
    };

    const color = difficultyColors[challenge.difficulty];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{ y: -10, boxShadow: `0 20px 40px -12px ${color}30` }}
            className="glass"
            style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                padding: '2rem',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.4)',
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer'
            }}
        >
            {/* Background Glow */}
            <div style={{ 
                position: 'absolute', 
                top: '-10%', 
                right: '-10%', 
                width: '100px', 
                height: '100px', 
                background: color, 
                filter: 'blur(60px)', 
                opacity: 0.1,
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ 
                        padding: '6px 12px', 
                        background: `${color}15`, 
                        borderRadius: '10px', 
                        color: color, 
                        fontWeight: '800', 
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        border: `1px solid ${color}30`
                    }}>
                        {challenge.difficulty}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3].map((s) => (
                            <Star 
                                key={s} 
                                size={12} 
                                fill={s <= (challenge.difficulty === 'Easy' ? 1 : challenge.difficulty === 'Medium' ? 2 : 3) ? color : 'var(--border)'} 
                                color="transparent" 
                            />
                        ))}
                    </div>
                </div>
                
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.35rem', fontWeight: '800', lineHeight: '1.3', color: 'var(--text-main)' }}>
                    {challenge.title}
                </h3>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '2rem' }}>
                    {challenge.tags && challenge.tags.map(tag => (
                        <span key={tag} style={{ 
                            padding: '4px 10px', 
                            background: 'white', 
                            color: 'var(--text-muted)', 
                            borderRadius: '8px', 
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            border: '1px solid var(--border)'
                        }}>
                            <Tag size={10} color="var(--primary)" /> {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> 45m</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Trophy size={16} color="var(--warning)" /> 100 XP</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Code size={16} color="var(--secondary)" /> DSA</span>
                </div>

                <Link to={`/student/coding-challenge/${challenge.id}`} style={{ textDecoration: 'none' }}>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ 
                            width: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '10px', 
                            borderRadius: '16px',
                            padding: '14px',
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            background: 'var(--text-main)',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        Solve Challenge <ChevronRight size={18} />
                    </motion.button>
                </Link>
            </div>
        </motion.div>
    );
};

export default ChallengeCard;
