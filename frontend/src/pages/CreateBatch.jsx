import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, UserPlus, CheckCircle2, Loader2, X } from 'lucide-react';

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
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Create New Batch</h1>
      
      <div className="card">
        <form onSubmit={handleCreate}>
          <div className="input-group">
            <label>Batch Name</label>
            <div style={{ position: 'relative' }}>
              <Users size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="e.g. Computer Networks 2026-A" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '1rem', display: 'block' }}>
              Select Students
            </label>

            {/* Selected Students Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
              {selectedStudents.map(student => (
                <div key={student.id} style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid var(--primary-border)' }}>
                  {student.name}
                  <button type="button" onClick={() => toggleStudent(student)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', marginLeft: '4px', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              {selectedStudents.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>No students selected yet.</span>}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                style={{ paddingLeft: '38px', borderRadius: '10px' }}
              />
            </div>

            {/* Students List */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '10px', background: '#f8fafc' }}>
              {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                  <p>Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {searchTerm ? 'No results found' : 'No registered students found'}
                </div>
              ) : (
                filteredStudents.map(student => {
                  const isSelected = selectedStudents.find(s => s.id === student.id);
                  return (
                    <div 
                      key={student.id} 
                      onClick={() => toggleStudent(student)}
                      style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid var(--border)', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        background: isSelected ? '#4f46e505' : 'transparent',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>{student.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.email}</div>
                      </div>
                      {isSelected ? (
                        <div style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '2px' }}><CheckCircle2 size={16} /></div>
                      ) : (
                        <UserPlus size={18} style={{ color: 'var(--border)' }} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {error && <p style={{ color: 'red', marginTop: '1rem', fontSize: '0.85rem' }}>{error}</p>}

          <button type="submit" disabled={isSaving} style={{ width: '100%', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isSaving ? 'Creating...' : <><CheckCircle2 size={18} /> Create Batch & Invite Students</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBatch;
