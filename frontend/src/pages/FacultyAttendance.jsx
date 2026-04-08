import { useState, useEffect } from 'react';
import { Users, Search, Calendar, CheckSquare, XSquare, ShieldCheck, Download, Activity, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const FacultyAttendance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceLog, setAttendanceLog] = useState({}); // { studentId: 'present' | 'absent' }
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Mocked API fetch for students
    setTimeout(() => {
      setStudents([
        { id: 1, name: 'Alice Parker', email: 'alice@student.com' },
        { id: 2, name: 'Bob Smith', email: 'bob@student.com' },
        { id: 3, name: 'Charlie Davis', email: 'charlie@student.com' },
        { id: 4, name: 'Diana Prince', email: 'diana@student.com' },
        { id: 5, name: 'Evan Wright', email: 'evan@student.com' },
      ]);
      // Set all base as present initially
      const initialLog = {
        1: 'present', 2: 'present', 3: 'absent', 4: 'present', 5: 'absent'
      };
      setAttendanceLog(initialLog);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleStatus = (id, status) => {
    setAttendanceLog(prev => ({ ...prev, [id]: status }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Attendance securely logged for ' + attendanceDate);
    }, 800);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Header */}
      <div className="flex-responsive" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="text-gradient">Attendance</span> Tracker
            <ShieldCheck size={32} color="var(--primary)" />
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>
            Monitor participation and register daily presence.
          </p>
        </div>
        
        <div className="header-actions">
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', fontWeight: '800' }}>
            <Download size={18} /> Export Matrix
          </button>
          <button onClick={handleSave} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '800' }}>
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Lock Registry
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)' }}>
            <div className="input-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
               <div style={{ position: 'relative' }}>
                 <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                 <input 
                   type="date" 
                   value={attendanceDate}
                   onChange={(e) => setAttendanceDate(e.target.value)}
                   style={{ paddingLeft: '3rem', margin: 0, width: '100%' }}
                 />
               </div>
            </div>
            
            <div className="input-group" style={{ marginBottom: 0, flex: 2, minWidth: '250px' }}>
               <div style={{ position: 'relative' }}>
                 <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                 <input 
                   type="text" 
                   placeholder="Search cadet..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   style={{ paddingLeft: '3rem', margin: 0, width: '100%' }}
                 />
               </div>
            </div>
        </div>

        <div style={{ padding: '2rem', background: 'white' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <div style={{ gridColumn: '1 / -1', padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <Activity size={40} className="animate-pulse" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                        <p style={{ fontWeight: '800', fontSize: '1.1rem', margin: 0 }}>Loading Directory...</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '800', fontSize: '1.1rem' }}>
                        No matches found.
                    </div>
                ) : (
                    filteredStudents.map((s, i) => {
                        const status = attendanceLog[s.id];
                        return (
                           <motion.div 
                             initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                             key={s.id} 
                             style={{
                                padding: '1.5rem', borderRadius: '16px', border: '1px solid',
                                background: status === 'present' ? '#10b98105' : status === 'absent' ? '#ef444405' : 'white',
                                borderColor: status === 'present' ? '#10b98130' : status === 'absent' ? '#ef444430' : 'var(--border)'
                             }}
                             className="stat-card"
                           >
                             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                                 <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '800',
                                    background: status === 'present' ? 'var(--success)' : status === 'absent' ? 'var(--danger)' : '#f1f5f9',
                                    color: status === 'present' || status === 'absent' ? 'white' : 'var(--text-muted)'
                                 }}>
                                    {s.name[0]}
                                 </div>
                                 <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: status === 'present' ? 'var(--success)' : status === 'absent' ? 'var(--danger)' : 'var(--text-main)' }}>
                                        {s.name}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{s.email}</div>
                                 </div>
                             </div>

                             <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-main)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                 <button 
                                     onClick={() => toggleStatus(s.id, 'present')}
                                     style={{
                                        flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: 'none',
                                        background: status === 'present' ? 'var(--success)' : 'transparent',
                                        color: status === 'present' ? 'white' : 'var(--text-muted)'
                                     }}
                                 >
                                     <CheckSquare size={16} /> Present
                                 </button>
                                 <button 
                                     onClick={() => toggleStatus(s.id, 'absent')}
                                     style={{
                                        flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: 'none',
                                        background: status === 'absent' ? 'var(--danger)' : 'transparent',
                                        color: status === 'absent' ? 'white' : 'var(--text-muted)'
                                     }}
                                 >
                                     <XSquare size={16} /> Absent
                                 </button>
                             </div>
                           </motion.div>
                        );
                    })
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyAttendance;
