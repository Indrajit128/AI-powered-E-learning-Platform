import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserCircle } from 'lucide-react';

const Register = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, role });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate(res.data.user.role === 'faculty' ? '/faculty' : '/student');
    } catch (err) {
      console.error('Registration Error:', err);
      const msg = err.response?.data?.msg || err.message || 'Registration failed. Is the backend server running?';
      setError(msg);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '400px', margin: '100px auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
              <input 
                type="email" 
                placeholder="you@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>
          <div className="input-group">
            <label>Join As</label>
            <div style={{ position: 'relative' }}>
              <UserCircle size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                required 
                style={{ paddingLeft: '40px' }}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
          </div>
          <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
            Register
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
