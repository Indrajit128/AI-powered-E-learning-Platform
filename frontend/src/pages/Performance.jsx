import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, BarChart3, Clock, CheckCircle2, ChevronRight, TrendingUp, Zap, Target, BrainCircuit, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

const Performance = () => {
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studyPlan, setStudyPlan] = useState(null);
  const [studyPlanLoading, setStudyPlanLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/student/performance', {
          headers: { 'x-auth-token': token }
        });
        setPerformance(res.data);
      } catch (err) {
        console.error('Error fetching performance:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchStudyPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/student/study-plan', {
          headers: { 'x-auth-token': token }
        });
        setStudyPlan(res.data);
      } catch (err) {
        console.error('Error fetching study plan:', err);
      } finally {
        setStudyPlanLoading(false);
      }
    };

    fetchPerformance();
    fetchStudyPlan();
  }, []);

  const avgScore = performance.length > 0 ? (performance.reduce((acc, curr) => acc + Number(curr.score), 0) / performance.length).toFixed(1) : 0;

  // Prepare data for the AreaChart
  const chartData = performance.map((p, index) => ({
    name: `A${index + 1}`,
    score: Number(p.score),
    title: p.title
  })).reverse();

  // Prepare data for the PieChart
  const subjectData = [
    { name: 'Networks', value: 88, color: '#4f46e5' },
    { name: 'C Programming', value: 72, color: '#0ea5e9' },
    { name: 'Practical Lab', value: 95, color: '#10b981' },
    { name: 'Others', value: 65, color: '#f59e0b' }
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Performance <span className="text-gradient">Analytics</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Data-driven insights into your academic journey.</p>
        </div>
        <div className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary)' }}>
          Last Updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard title="OVERALL SCORE" value={`${avgScore}%`} icon={<Trophy size={20} />} trend="+2.4%" color="var(--primary)" />
        <StatCard title="COMPLETED" value={performance.length} icon={<CheckCircle2 size={20} />} trend="+3" color="var(--success)" />
        <StatCard title="LEARNING HOURS" value="12.5" icon={<Clock size={20} />} trend="+1.2" color="var(--secondary)" />
        <StatCard title="CURRENT RANK" value="#12" icon={<Target size={20} />} trend="Top 5%" color="var(--warning)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><TrendingUp size={20} color="var(--primary)" /> Score Progression</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ background: '#f1f5f9', color: 'var(--text-main)', fontSize: '0.75rem', padding: '4px 12px', border: 'none' }}>Weekly</button>
              <button style={{ background: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '4px 12px', border: 'none' }}>Monthly</button>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '300px' }}>
            {loading ? (
               <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
            ) : performance.length === 0 ? (
               <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: 'var(--primary)', fontWeight: '700' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Zap size={20} color="var(--warning)" /> Subject Mastery</h3>
          <div style={{ width: '100%', height: '250px' }}>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            {subjectData.map((sub, i) => (
              <div key={i} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: '600' }}>{sub.name}</span>
                  <span style={{ color: sub.color, fontWeight: '700' }}>{sub.value}%</span>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sub.value}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    style={{ height: '100%', background: sub.color }}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', position: 'relative', overflow: 'hidden', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', zIndex: 1, flex: '1 1 300px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><BrainCircuit /> AI Learning Assistant</h3>
          <p style={{ opacity: 0.9, maxWidth: '600px', lineHeight: '1.6', fontSize: '1.1rem' }}>
            {studyPlanLoading ? "Analyzing your academic portfolio..." : `"${studyPlan?.summary || "Keep up the great work! Let's build a focused plan to improve your skills further."}"`}
          </p>
          <button onClick={() => setShowPlanModal(true)} disabled={studyPlanLoading} style={{ marginTop: '1.5rem', background: 'white', color: 'var(--primary)', fontWeight: '700', padding: '0.75rem 1.5rem', opacity: studyPlanLoading ? 0.7 : 1, border: 'none', borderRadius: '12px', cursor: studyPlanLoading ? 'default' : 'pointer' }}>Generate Custom Study Plan</button>
        </div>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, pointerEvents: 'none' }}>
          <BrainSVG size={180} />
        </div>
      </div>

      {showPlanModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className="card" 
            style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative', borderRadius: '24px' }}
          >
            <button onClick={() => setShowPlanModal(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '50%', color: 'var(--text-main)', cursor: 'pointer' }}>
               <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', color: 'var(--primary)' }}>
               <BrainCircuit size={32} />
               <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Your AI Study Plan</h2>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>{studyPlan?.summary}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '16px' }}>
                <h4 style={{ color: 'var(--success)', marginBottom: '0.75rem' }}>Strengths</h4>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(studyPlan?.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div style={{ background: '#fef2f2', padding: '1.25rem', borderRadius: '16px' }}>
                <h4 style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>Focus Areas</h4>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(studyPlan?.weaknesses || []).map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>

            <h3 style={{ marginBottom: '1.25rem' }}>Weekly Roadmap</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {(studyPlan?.plan || []).map((day, idx) => (
                 <div key={idx} style={{ display: 'flex', gap: '1.5rem', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '16px', background: '#f8fafc' }}>
                    <div style={{ minWidth: '100px', fontWeight: '800', color: 'var(--primary)' }}>{day.day}</div>
                    <div>
                      <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{day.focus}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{day.action}</div>
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="card stat-card" 
    style={{ position: 'relative', overflow: 'hidden' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
        {icon}
      </div>
      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--success)', background: '#f0fdf4', padding: '2px 8px', borderRadius: '100px' }}>
        {trend}
      </div>
    </div>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
    <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)' }}>{value}</div>
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: color, opacity: 0.4 }}></div>
  </motion.div>
);

const BrainSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0 .94 4.82 2.5 2.5 0 0 0 0 4.28 2.5 2.5 0 0 0-1.04 4.86 2.5 2.5 0 0 0 1.98 3.32 2.5 2.5 0 0 0 4.96-.34"/><path d="M12 4.5V21"/><path d="M12 4.5a2.5 2.5 0 0 1 4.96-.46 2.5 2.5 0 0 1 1.98 3 2.5 2.5 0 0 1-.94 4.82 2.5 2.5 0 0 1 0 4.28 2.5 2.5 0 0 1 1.04 4.86 2.5 2.5 0 0 1-1.98 3.32 2.5 2.5 0 0 1-4.96-.34"/><path d="M9 10h1"/><path d="M14 10h1"/><path d="M9 14h1"/><path d="M14 14h1"/><path d="M9 18h1"/><path d="M14 18h1"/></svg>
);

export default Performance;
