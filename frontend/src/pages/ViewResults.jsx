import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BarChart3, Users, Trophy, Download } from 'lucide-react';

const ViewResults = () => {
  const { id } = useParams(); // Batch ID
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
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Assignment Results</h1>
          <p style={{ color: 'var(--text-muted)' }}>Detailed performance analytics for Batch #{id}</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#4f46e510', color: 'var(--primary)', padding: '1rem', borderRadius: '12px' }}><Users size={24} /></div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{submissions.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>SUBMISSIONS</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#10b98110', color: 'var(--success)', padding: '1rem', borderRadius: '12px' }}><Trophy size={24} /></div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>84%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>AVG SCORE</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#0ea5e910', color: 'var(--secondary)', padding: '1rem', borderRadius: '12px' }}><BarChart3 size={24} /></div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>12</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOP PERFORMERS</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>STUDENT NAME</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>EMAIL</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>SCORE</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>SUBMITTED AT</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading results...</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>No submissions yet.</td></tr>
            ) : (
              submissions.map(sub => (
                <tr key={sub.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{sub.student_name}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{sub.student_email}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '700', color: Number(sub.score) >= 70 ? 'var(--success)' : 'var(--warning)' }}>{sub.score}%</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>{new Date(sub.submitted_at).toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', background: '#dcfce7', color: '#166534' }}>GRADED</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewResults;
