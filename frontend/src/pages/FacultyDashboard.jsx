import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Users, 
  BookOpen, 
  Clock, 
  ChevronRight, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Activity,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FacultyDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/faculty/batches', {
          headers: { 'x-auth-token': token }
        });
        setBatches(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setBatches([]);
        console.error('Error fetching batches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  const stats = [
    { label: 'Total Students', value: '124', icon: <Users size={20} />, color: 'var(--primary)' },
    { label: 'Active Batches', value: (batches || []).length, icon: <BarChart3 size={20} />, color: 'var(--secondary)' },
    { label: 'Avg Grade', value: '78%', icon: <CheckCircle size={20} />, color: 'var(--success)' },
    { label: 'Pending Reviews', value: '12', icon: <AlertCircle size={20} />, color: 'var(--warning)' },
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Header */}
      <div className="flex-responsive" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em' }}>Faculty <span className="text-gradient">Command Center</span></h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>Manage your batches and monitor student progress.</p>
        </div>
        <div className="header-actions">
          <Link to="/faculty/create-batch">
            <button className="glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', border: '1px solid var(--primary)', fontWeight: '700' }}>
              <Plus size={18} /> Create Batch
            </button>
          </Link>
          <Link to="/faculty/create-assignment">
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)' }}>
              <Plus size={18} /> New Assignment
            </button>
          </Link>
        </div>
      </div>

      {/* Analytics Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="card stat-card" 
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <div style={{ width: '40px', height: '40px', background: `${stat.color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>{stat.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900' }}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-layout faculty">
        {/* Batch Management */}
        <div>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={22} color="var(--primary)" /> Active Batches</h3>
          {loading ? (
            <p>Loading your batches...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {(!batches || batches.length === 0) ? (
                <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                  <Users size={64} style={{ color: 'var(--border)', marginBottom: '1.5rem' }} />
                  <h3>No batches created yet</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Start by creating your first batch of students.</p>
                  <Link to="/faculty/create-batch">
                    <button style={{ marginTop: '1rem' }}>Create First Batch</button>
                  </Link>
                </div>
              ) : (
                batches.map((batch, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={batch.id} 
                    className="card stat-card" 
                    style={{ borderRadius: '24px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div className="glass" style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Users size={28} />
                      </div>
                      <span className="glass" style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '100px', fontWeight: '800', color: 'var(--text-muted)' }}>ID: {batch.id}</span>
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '850' }}>{batch.name}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          <BookOpen size={16} /> <span>12 Assignments Published</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          <Clock size={16} /> <span>Full-term Course</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Link to={`/faculty/results/${batch.id}`} style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Performance Report <ChevronRight size={18} />
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sidebar Modules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
           {/* Recent Submissions Feed */}
           <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="var(--primary)" /> Recent Submissions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <SubmissionItem name="Rahul Sharma" assignment="Network Quiz #3" time="10 mins ago" score="95%" />
                 <SubmissionItem name="Ananya Iyer" assignment="Binary Tree Lab" time="45 mins ago" score="88%" />
                 <SubmissionItem name="Vikram Singh" assignment="Network Quiz #3" time="2 hours ago" score="72%" />
                 <SubmissionItem name="Sneha Patel" assignment="API Documentation" time="5 hours ago" score="100%" />
              </div>
              <button className="glass" style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.875rem', fontWeight: '700' }}>View All Activity</button>
           </div>

           {/* Quick Action Hub */}
           <div className="card" style={{ background: 'var(--text-main)', color: 'white' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} color="var(--warning)" /> Quick Actions
              </h3>
              <div className="quick-actions-grid">
                 <ActionBtn icon={<FileText size={18} />} label="Export Grades" />
                 <ActionBtn icon={<Users size={18} />} label="Sync Students" />
                 <ActionBtn icon={<Plus size={18} />} label="Add Resource" />
                 <ActionBtn icon={<Activity size={18} />} label="Run Audit" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const SubmissionItem = ({ name, assignment, time, score }) => (
  <div className="activity-item" style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '1.25rem', paddingBottom: '1.25rem' }}>
    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{name}</div>
    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{assignment} • {time}</div>
    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--success)' }}>Score: {score}</div>
  </div>
);

const ActionBtn = ({ icon, label }) => (
  <div style={{ 
    background: 'rgba(255, 255, 255, 0.1)', 
    padding: '1rem', 
    borderRadius: '12px', 
    textAlign: 'center', 
    cursor: 'pointer',
    transition: 'background 0.2s'
  }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}>
    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <div style={{ fontSize: '0.75rem', fontWeight: '600' }}>{label}</div>
  </div>
);

export default FacultyDashboard;
