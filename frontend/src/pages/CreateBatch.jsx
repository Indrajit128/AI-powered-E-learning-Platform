import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const CreateBatch = () => {
  const [name, setName] = useState('');
  const [emails, setEmails] = useState(['']);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAddEmail = () => setEmails([...emails, '']);
  const handleRemoveEmail = (idx) => setEmails(emails.filter((_, i) => i !== idx));
  const handleEmailChange = (idx, val) => {
    const newEmails = [...emails];
    newEmails[idx] = val;
    setEmails(newEmails);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return setError('Batch name is required');
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      
      const batchRes = await axios.post('/api/faculty/batches', { name }, { headers });
      const batchId = batchRes.data.id;

      // Add students
      const studentPromises = emails
        .filter(email => email.trim() !== '')
        .map(email => axios.post(`/api/faculty/batches/${batchId}/students`, { email }, { headers }));
      
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
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Add Students (Emails)
              <button type="button" onClick={handleAddEmail} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                <Plus size={14} /> Add More
              </button>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {emails.map((email, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Mail size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
                    <input 
                      type="email" 
                      placeholder="student@email.com" 
                      value={email} 
                      onChange={e => handleEmailChange(idx, e.target.value)} 
                      style={{ paddingLeft: '35px' }}
                    />
                  </div>
                  {emails.length > 1 && (
                    <button type="button" onClick={() => handleRemoveEmail(idx)} style={{ background: '#fee2e2', color: '#ef4444', padding: '0 12px' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
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
