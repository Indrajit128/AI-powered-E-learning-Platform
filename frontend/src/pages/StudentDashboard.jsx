import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  Trophy, 
  BarChart3, 
  Target, 
  Zap, 
  Calendar,
  ChevronRight,
  Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };

        const [batchesRes, performanceRes] = await Promise.all([
          axios.get('/api/student/batches', { headers }),
          axios.get('/api/student/performance', { headers })
        ]);

        setBatches(batchesRes.data);
        setPerformance(performanceRes.data);

        if (batchesRes.data.length > 0) {
          const assignmentsRes = await axios.get(`/api/student/assignments/${batchesRes.data[0].id}`, { headers });
          setAssignments(assignmentsRes.data);
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

    batches.forEach(b => socket.emit('join_batch', b.id));
    
    socket.on('new_assignment', (assignment) => {
      setAssignments(prev => [assignment, ...prev]);
    });

    return () => socket.disconnect();
  }, [batches.length]);

  const skillData = [
    { subject: 'Logic', A: 80, fullMark: 100 },
    { subject: 'Speed', A: 65, fullMark: 100 },
    { subject: 'Syntax', A: 90, fullMark: 100 },
    { subject: 'Networking', A: 70, fullMark: 100 },
    { subject: 'Theory', A: 85, fullMark: 100 },
  ];

  const journeySteps = [
    { name: 'Basics', status: 'completed', icon: <CheckCircle2 size={18} /> },
    { name: 'Functions', status: 'completed', icon: <CheckCircle2 size={18} /> },
    { name: 'Pointers', status: 'current', icon: <Target size={18} /> },
    { name: 'Memory', status: 'locked', icon: <Lock size={18} /> },
    { name: 'Final Proj', status: 'locked', icon: <Trophy size={18} /> },
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Header with Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em' }}>
            Hey, <span className="text-gradient">Ready to Learn?</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>
            You have {assignments.length} assignments waiting for you today.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
           <div className="glass" style={{ padding: '0.75rem 1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Flame color="#f97316" fill="#f97316" size={20} />
              <div style={{ fontWeight: '800', fontSize: '1.25rem' }}>12 Day Streak</div>
           </div>
        </div>
      </div>

      {/* Learning Journey Roadmap */}
      <section className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Target size={20} color="var(--primary)" /> Your Learning Journey
        </h3>
        <div className="journey-roadmap">
          {journeySteps.map((step, i) => (
            <div key={i} className="journey-node">
              <div className="journey-icon" style={{ 
                borderColor: step.status === 'locked' ? 'var(--border)' : 'var(--primary)',
                color: step.status === 'locked' ? 'var(--text-muted)' : 'var(--primary)',
                background: step.status === 'completed' ? 'var(--primary)' : 'white'
              }}>
                {step.status === 'completed' ? <CheckCircle2 size={24} color="white" /> : step.icon}
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: step.status === 'locked' ? 'var(--text-muted)' : 'var(--text-main)' }}>{step.name}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Active Assignments */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="var(--primary)" /> Active Assignments
              </h3>
              <Link to="#" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>View All</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loading ? (
                <p>Loading assignments...</p>
              ) : assignments.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                  <Clock size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>All caught up! Why not explore a new topic?</p>
                </div>
              ) : (
                assignments.map((assign, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={assign.id} 
                    className="card stat-card" 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px' }}
                  >
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div className="glass" style={{ width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        {assign.type === 'quiz' ? <Zap size={26} /> : <BookOpen size={26} />}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem' }}>{assign.title}</h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>{assign.type}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> 2 days left</span>
                          <span>{assign.subject}</span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/student/attempt/${assign.id}`}>
                      <button style={{ borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.25rem', fontWeight: '700' }}>
                        Start <PlayCircle size={18} />
                      </button>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* AI Recommended Learning */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <Zap size={24} fill="white" />
                  <h3 style={{ margin: 0 }}>LearnAI Personalized Suggestion</h3>
                </div>
                <p style={{ fontSize: '1.1rem', opacity: 0.95, lineHeight: '1.6', maxWidth: '80%' }}>
                   "Based on your recent 95% in Networks, you might enjoy <strong>Cloud Infrastructure</strong>. 
                   We've unlocked a preview module for you!"
                </p>
                <button style={{ background: 'white', color: 'var(--primary)', border: 'none', marginTop: '1.5rem', fontWeight: '800' }}>Explore Module</button>
             </div>
             <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.15 }}>
                <Trophy size={200} />
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Skill Radar */}
          <div className="card" style={{ height: '350px' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="var(--primary)" /> Skill Mastery
            </h3>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--text-muted)', fontSize: 10}} />
                  <Radar
                    name="Student"
                    dataKey="A"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="var(--primary)"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--primary)" /> Deadlines
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="activity-item">
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Mid-term Project Submissions</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due Tomorrow, 11:59 PM</div>
              </div>
              <div className="activity-item">
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Cloud Networking Quiz</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due in 3 days</div>
              </div>
              <div className="activity-item" style={{ borderLeft: 'none' }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Practical Lab Viva</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due in 5 days</div>
              </div>
            </div>
          </div>

          {/* Performance Summary Button */}
          <Link to="/student/performance" style={{ textDecoration: 'none' }}>
            <div className="card stat-card glass" style={{ textAlign: 'center', padding: '1.5rem', border: '1px solid var(--primary)' }}>
              <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.1rem' }}>Detailed Performance Analytics</h4>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>View charts, trends, and AI feedback</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

const Lock = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

export default StudentDashboard;
