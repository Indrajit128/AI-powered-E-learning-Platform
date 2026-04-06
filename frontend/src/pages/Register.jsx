import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserCircle, Key } from 'lucide-react';

const Register = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [otp, setOtp] = useState('');
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password.length < 6) {
        return setError('Password must be at least 6 characters.');
    }

    try {
      // Step 1: Register User and trigger OTP
      const res = await axios.post('http://localhost:5000/api/auth/register', { 
        name, email, password, role 
      });
      
      setSuccessMsg(res.data.msg);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Step 2: Verify OTP
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      
      // Auto-Login after verification
      const loginRes = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      localStorage.setItem('token', loginRes.data.token);
      localStorage.setItem('user', JSON.stringify(loginRes.data.user));
      setUser(loginRes.data.user);
      
      const targetRoute = role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/student';
      navigate(targetRoute);
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid OTP verification');
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '400px', margin: '100px auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{step === 'form' ? 'Create Account' : 'Verify Email'}</h2>
        
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', background: '#fee2e2', padding: '0.8rem', borderRadius: '8px' }}>{error}</div>}
        {successMsg && <div style={{ color: '#10b981', marginBottom: '1rem', background: '#d1fae5', padding: '0.8rem', borderRadius: '8px' }}>{successMsg}</div>}
        
        {step === 'form' ? (
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
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <UserCircle size={18} style={{ position: 'absolute', left: '10px', color: '#64748b' }} />
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  required 
                  style={{ paddingLeft: '40px', width: '100%' }}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Administrator (ERP)</option>
                </select>
              </div>
            </div>
            <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
              Register & Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <p style={{marginBottom: '1rem', textAlign: 'center', color: '#64748b'}}>Please check {email} for your one-time password.</p>
            <div className="input-group">
              <label>Enter OTP</label>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
                <input 
                  type="text" 
                  placeholder="123456" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  required 
                  style={{ paddingLeft: '40px', letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
                />
              </div>
            </div>
            <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
              Verify & Login
            </button>
          </form>
        )}
        
        {step === 'form' && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Login here</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
