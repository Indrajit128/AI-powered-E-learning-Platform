import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart3, Users, Trophy, Download, Search, CheckCircle2, ChevronLeft, Activity, Percent, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const ViewResults = () => {
  const { id } = useParams(); // Batch ID
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/faculty/submissions/${id}`, {
          headers: { 'x-auth-token': token }
        });
        setSubmissions(res.data);
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [id]);

  return (
    <div className="fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Header */}
      <div className="flex-responsive" style={{ marginBottom: '2.5rem' }}>
        <div>
          <button 
            onClick={() => navigate('/faculty')}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', padding: 0, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem', cursor: 'pointer' }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Results <span className="text-gradient">Directory</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <BookOpen size={18} /> Analytics for Batch #{id}
          </p>
        </div>
        
        <div className="header-actions">
           <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)', fontWeight: '800' }}>
              <Download size={18} /> Export Matrix
           </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
            <div style={{ padding: '1rem', background: '#4f46e510', color: 'var(--primary)', borderRadius: '12px' }}><Users size={28} /></div>
            <div><div style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>Submissions</div><div style={{ fontSize: '2rem', fontWeight: '900' }}>{submissions.length}</div></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem', borderColor: 'var(--success)' }}>
            <div style={{ padding: '1rem', background: '#10b98110', color: 'var(--success)', borderRadius: '12px' }}><Trophy size={28} /></div>
            <div><div style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>Class Average</div><div style={{ fontSize: '2rem', fontWeight: '900', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>84<span style={{ fontSize: '1rem', paddingBottom: '4px', color: 'var(--text-muted)' }}>%</span></div></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
            <div style={{ padding: '1rem', background: '#0ea5e910', color: '#0ea5e9', borderRadius: '12px' }}><BarChart3 size={28} /></div>
            <div><div style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>High Achievers</div><div style={{ fontSize: '2rem', fontWeight: '900' }}>12</div></div>
          </motion.div>
        </div>

        {/* Results Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Performance Directory</h3>
              <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="text" placeholder="Search cadet..." style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none' }} />
              </div>
          </div>
          
          <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Student</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Score</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Timestamp</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '700' }}>Loading records...</td></tr>
                ) : submissions.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '700' }}>NO RECORDS FOUND</td></tr>
                ) : (
                  submissions.map((sub, i) => (
                    <motion.tr 
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                       key={sub.id} 
                       style={{ borderBottom: '1px solid var(--border)', background: 'white' }}
                       className="hover:bg-muted/10 transition-colors"
                    >
                      <td style={{ padding: '1rem 1.5rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#4f46e515', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '800' }}>{sub.student_name?.[0] || 'A'}</div>
                          {sub.student_name}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>{sub.student_email}</td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: '800' }}>
                         <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: Number(sub.score) >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                             {sub.score}<Percent size={14}/>
                         </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>{new Date(sub.submitted_at).toLocaleString()}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', background: '#10b98115', color: 'var(--success)', border: '1px solid #10b98130', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                           <CheckCircle2 size={14} /> Graded
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewResults;
