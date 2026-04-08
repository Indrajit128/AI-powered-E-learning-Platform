import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, UserPlus, CheckCircle2, Loader2, X, BookOpen, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateBatch = () => {
  const [name, setName] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/faculty/students', {
          headers: { 'x-auth-token': token }
        });
        setAllStudents(res.data);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students list');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const toggleStudent = (student) => {
    if (selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const filteredStudents = allStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return setError('Batch name is required');
    if (selectedStudents.length === 0) return setError('Please select at least one student');
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      
      const batchRes = await axios.post('/api/faculty/batches', { name }, { headers });
      const batchId = batchRes.data.id;

      // Add selected students
      const studentPromises = selectedStudents.map(student => 
        axios.post(`/api/faculty/batches/${batchId}/students`, { email: student.email }, { headers })
      );
      
      await Promise.all(studentPromises);
      navigate('/faculty');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create batch');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '4rem', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          Initialize <span className="text-gradient">Batch</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>
          Group your students into manageable cohorts.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Batch Identifier</label>
            <div style={{ position: 'relative' }}>
               <BookOpen size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
               <input 
                 type="text" 
                 placeholder="e.g. Masterclass 2026-A" 
                 value={name} 
                 onChange={e => setName(e.target.value)} 
                 required 
                 style={{ paddingLeft: '3rem', paddingRight: '1rem', paddingTop: '1rem', paddingBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}
               />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Select Cadets</label>
              <span style={{ fontSize: '0.75rem', padding: '4px 12px', background: '#4f46e510', color: 'var(--primary)', borderRadius: '20px', fontWeight: '700' }}>
                {selectedStudents.length} Selected
              </span>
            </div>

            {/* Selected Students Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem', minHeight: '44px', background: 'var(--bg-main)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <AnimatePresence>
                {selectedStudents.map(student => (
                  <motion.div 
                    key={student.id} 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{ 
                       display: 'inline-flex', alignItems: 'center', gap: '6px', 
                       background: 'var(--primary)', color: 'white', 
                       padding: '4px 8px 4px 12px', borderRadius: '8px', 
                       fontSize: '0.8rem', fontWeight: '600' 
                    }}
                  >
                    {student.name}
                    <button 
                      type="button" 
                      onClick={() => toggleStudent(student)} 
                      style={{ background: 'transparent', border: 'none', padding: '2px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {selectedStudents.length === 0 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '4px 8px' }}>No students assigned to this batch yet.</span>
              )}
            </div>

            {/* Search Input */}
            <div className="input-group">
               <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Filter directory by name or email..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    style={{ paddingLeft: '3rem' }}
                  />
               </div>
            </div>

            {/* Students List */}
            <div className="custom-scrollbar" style={{ height: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-main)' }}>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                  <p style={{ fontWeight: '700' }}>Scanning Directory...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p style={{ fontWeight: '700' }}>{searchTerm ? 'No matching cadets found.' : 'Directory is empty.'}</p>
                </div>
              ) : (
                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {filteredStudents.map(student => {
                    const isSelected = selectedStudents.find(s => s.id === student.id);
                    return (
                      <div 
                        key={student.id} 
                        onClick={() => toggleStudent(student)}
                        style={{ 
                          padding: '1rem', borderRadius: '8px', cursor: 'pointer', 
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: isSelected ? '#10b98110' : 'white',
                          border: `1px solid ${isSelected ? 'var(--success)' : 'transparent'}`,
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                             width: '40px', height: '40px', borderRadius: '10px', 
                             display: 'flex', alignItems: 'center', justifyContent: 'center', 
                             fontWeight: '800', fontSize: '1.1rem',
                             background: isSelected ? 'var(--success)' : '#f1f5f9',
                             color: isSelected ? 'white' : 'var(--text-muted)'
                          }}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '1rem', color: isSelected ? 'var(--success)' : 'var(--text-main)' }}>
                              {student.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '500', color: isSelected ? '#10b98190' : 'var(--text-muted)' }}>
                              {student.email}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          {isSelected ? (
                            <CheckCircle2 size={24} color="var(--success)" />
                          ) : (
                            <UserPlus size={20} color="var(--border)" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div style={{ padding: '1rem', background: '#ef444415', border: '1px solid #ef444450', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSaving} 
            style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {isSaving ? (
              <><Loader2 size={22} className="animate-spin" /> Initializing...</>
            ) : (
              <><CheckCircle2 size={22} /> Confirm & Deploy Batch</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateBatch;
