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
  Activity,
  Zap,
  Search,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FacultyDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState({ name: '', course_name: '', start_date: '', end_date: '' });
  
  // Assignment state
  const [selectedBatchAssign, setSelectedBatchAssign] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };
        
        // Parallel fetching
        const [batchesRes, studentsRes] = await Promise.allSettled([
          axios.get('/api/faculty/batches', { headers }),
          axios.get('/api/batch/students', { headers })
        ]);

        if (batchesRes.status === 'fulfilled') setBatches(Array.isArray(batchesRes.value.data) ? batchesRes.value.data : []);
        if (studentsRes.status === 'fulfilled') setStudents(Array.isArray(studentsRes.value.data) ? studentsRes.value.data : []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      // Adding faculty_id manually as a dev mock or ideally from the backend token. 
      // Providing random UUID for testing purposes if context is missing
      const reqData = { ...batchForm, faculty_id: user.id || 'f1b9b9b9-1111-1111-1111-111111111111' };
      
      const res = await axios.post('http://localhost:5000/api/batch/create', reqData);
      setBatches([...batches, res.data.batch]);
      setShowBatchModal(false);
      setBatchForm({ name: '', course_name: '', start_date: '', end_date: '' });
      alert(res.data.msg);
    } catch (err) {
       alert(err.response?.data?.msg || 'Failed to create batch');
    }
  };

  const handleAssignStudent = async (studentId) => {
    if (!selectedBatchAssign) return alert('Please select a batch top right of the student list to assign.');
    try {
      const res = await axios.post('http://localhost:5000/api/batch/add-student', {
        batch_id: selectedBatchAssign,
        student_id: studentId
      });
      alert(res.data.msg);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to assign student');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Students', value: students.length, icon: <Users size={20} />, color: 'var(--primary)' },
    { label: 'Active Batches', value: batches.length, icon: <BarChart3 size={20} />, color: 'var(--secondary)' },
    { label: 'Avg Grade', value: '78%', icon: <CheckCircle size={20} />, color: 'var(--success)' },
    { label: 'Pending Reviews', value: '12', icon: <AlertCircle size={20} />, color: 'var(--warning)' },
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Create Batch Modal */}
      <AnimatePresence>
        {showBatchModal && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="card" style={{ width: '100%', maxWidth: '500px', margin: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Create New Batch</h3>
                <button onClick={() => setShowBatchModal(false)} className="glass" style={{ padding: '8px' }}><X size={18}/></button>
              </div>
              <form onSubmit={handleCreateBatch}>
                <div className="input-group">
                  <label>Batch Name</label>
                  <input required placeholder="e.g. CS101 Section A" value={batchForm.name} onChange={(e) => setBatchForm({...batchForm, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Course Name</label>
                  <input required placeholder="e.g. Introduction to Programming" value={batchForm.course_name} onChange={(e) => setBatchForm({...batchForm, course_name: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Start Date</label>
                    <input type="date" value={batchForm.start_date} onChange={(e) => setBatchForm({...batchForm, start_date: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>End Date</label>
                    <input type="date" value={batchForm.end_date} onChange={(e) => setBatchForm({...batchForm, end_date: e.target.value})} />
                  </div>
                </div>
                <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>Create Batch</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-responsive" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em' }}>Faculty <span className="text-gradient">Command Center</span></h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>Manage your batches and monitor student progress.</p>
        </div>
        <div className="header-actions">
           <button onClick={() => setShowBatchModal(true)} className="glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', border: '1px solid var(--primary)', fontWeight: '700' }}>
             <Plus size={18} /> Create Batch Modal
           </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            key={i} className="card stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <div style={{ width: '40px', height: '40px', background: `${stat.color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>{stat.icon}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>{stat.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900' }}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-layout faculty">
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Batches Section */}
          <div>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={22} color="var(--primary)" /> Active Batches</h3>
            {loading ? <p>Loading your batches...</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {batches.length === 0 ? (
                  <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No batches created yet. Start by creating your first batch.</p>
                  </div>
                ) : (
                  batches.map((batch, i) => (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={batch.id} className="card stat-card" style={{ borderRadius: '24px' }}>
                      <h3 style={{ fontSize: '1.25rem' }}>{batch.name}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{batch.course_name}</p>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Student Directory & Assignment Section */}
          <div className="card">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
               <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} color="var(--primary)"/> Student Directory</h3>
               <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                 <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Search student..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '35px', paddingRight: '15px', paddingBottom: '8px', paddingTop: '8px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                 </div>
                 <select value={selectedBatchAssign} onChange={(e) => setSelectedBatchAssign(e.target.value)} style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                     <option value="">Select Batch to Assign</option>
                     {batches.map(b => (
                       <option key={b.id} value={b.id}>{b.name}</option>
                     ))}
                 </select>
               </div>
             </div>

             {loading ? <p>Loading students...</p> : (
               <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                   <thead>
                     <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                       <th style={{ padding: '1rem' }}>Name</th>
                       <th style={{ padding: '1rem' }}>Email</th>
                       <th style={{ padding: '1rem' }}>Status</th>
                       <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                     </tr>
                   </thead>
                   <tbody>
                     {filteredStudents.length === 0 ? (
                       <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students found</td></tr>
                     ) : (
                       filteredStudents.map(student => (
                         <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                           <td style={{ padding: '1rem', fontWeight: '500' }}>{student.name}</td>
                           <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{student.email}</td>
                           <td style={{ padding: '1rem' }}>
                             <span className="glass" style={{ color: student.email_verified ? 'var(--success)' : 'var(--warning)', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '12px' }}>
                               {student.email_verified ? 'Verified' : 'Pending'}
                             </span>
                           </td>
                           <td style={{ padding: '1rem', textAlign: 'right' }}>
                              <button onClick={() => handleAssignStudent(student.id)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>+ Assign</button>
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
             )}
          </div>

        </div>

        {/* Sidebar Modules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
           <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="var(--primary)" /> Recent Activity
              </h3>
              <p style={{color: 'var(--text-muted)'}}>No recent activity to display.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
