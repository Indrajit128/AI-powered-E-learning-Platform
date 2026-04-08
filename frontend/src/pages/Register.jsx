import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserCircle, Key, RefreshCw } from 'lucide-react';

const Register = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (password.length < 6) {
      setLoading(false);
      return setError('Password must be at least 6 characters.');
    }

    try {
      const res = await axios.post('/api/auth/register', { 
        name, email, password, role 
      });
      setSuccessMsg(res.data.msg);
      setStep('otp');
    } catch (err) {
      console.error('Registration API Error:', err);
      setError(err.response?.data?.msg || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // verify-otp now returns token + full user object directly
      const res = await axios.post('/api/auth/verify-otp', { email, otp });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      
      const targetRoute = res.data.user.role === 'admin' ? '/admin' : res.data.user.role === 'faculty' ? '/faculty' : '/student';
      navigate(targetRoute);
    } catch (err) {
      console.error('OTP Verify Error:', err);
      setError(err.response?.data?.msg || err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/resend-otp', { email });
      setSuccessMsg(res.data.msg);
      setOtp('');
    } catch (err) {
      console.error('Resend OTP Error:', err);
      setError(err.response?.data?.msg || err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '420px', margin: '80px auto' }}>
      <div className="card">
        {/* Progress indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'var(--primary)' }} />
          <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step === 'otp' ? 'var(--primary)' : 'var(--border)' }} />
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
          {step === 'form' ? '✨ Create Account' : '📧 Verify Email'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {step === 'form' ? 'Join the EduERP platform today' : `OTP sent to ${email}`}
        </p>
        
        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', background: '#fee2e2', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}
        {successMsg && (
          <div style={{ color: '#10b981', marginBottom: '1rem', background: '#d1fae5', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
            ✅ {successMsg}
          </div>
        )}
        
        {step === 'form' ? (
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748b' }} />
                <input 
                  type="text" placeholder="John Doe" value={name}
                  onChange={(e) => setName(e.target.value)} required 
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748b' }} />
                <input 
                  type="email" placeholder="you@gmail.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required 
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
            <div className="input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748b' }} />
                <input 
                  type="password" placeholder="Min. 6 characters" value={password}
                  onChange={(e) => setPassword(e.target.value)} required 
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
            <div className="input-group">
              <label>Join As</label>
              <div style={{ position: 'relative' }}>
                <UserCircle size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748b', zIndex: 1 }} />
                <select 
                  value={role} onChange={(e) => setRole(e.target.value)} required 
                  style={{ paddingLeft: '40px', width: '100%' }}
                >
                  <option value="student">🎓 Student</option>
                  <option value="faculty">👨‍🏫 Faculty</option>
                  <option value="admin">🏛️ Administrator (ERP)</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sending OTP...' : 'Register & Send OTP →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="input-group">
              <label>Enter 6-digit OTP</label>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                Valid for <strong>30 minutes</strong>. Check your spam folder if not received.
              </p>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748b' }} />
                <input 
                  type="text" placeholder="_ _ _ _ _ _" value={otp} maxLength={6}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required 
                  style={{ paddingLeft: '40px', letterSpacing: '8px', textAlign: 'center', fontSize: '1.4rem', fontWeight: '800' }}
                />
              </div>
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} style={{ width: '100%', marginTop: '1rem', opacity: (loading || otp.length !== 6) ? 0.7 : 1 }}>
              {loading ? 'Verifying...' : '✓ Verify & Enter Platform'}
            </button>

            {/* Resend OTP */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Didn't receive it or OTP expired?
              </p>
              <button 
                type="button" onClick={handleResendOTP} disabled={resending}
                className="glass"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', border: 'none' }}
              >
                <RefreshCw size={14} className={resending ? 'spin' : ''} />
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
        
        {step === 'form' && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
              Login here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
