import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, settings } = useAuth();
  const navigate = useNavigate();

  const themeColors = settings?.theme_colors ? JSON.parse(settings.theme_colors) : ['#1a237e', '#311b92'];
  const gradient = `linear-gradient(135deg, ${themeColors.join(', ')})`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire('Error', 'Please fill all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      Swal.fire({ icon: 'success', title: 'Welcome Back!', text: `Logged in as ${user.role}`, timer: 1500, showConfirmButton: false });
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'client') navigate('/client/dashboard');
      else if (user.role === 'employee') navigate('/employee/dashboard');
    } catch (err) {
      Swal.fire('Login Failed', err.response?.data?.message || 'Invalid credentials', 'error');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: gradient,
      padding: 20
    }}>
      <div className="animate-scaleIn" style={{
        background: 'white', borderRadius: 24, padding: 48, width: '100%', maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" style={{ height: 64, width: 'auto', marginBottom: 16 }} />
          ) : (
            <div style={{
              width: 64, height: 64, background: 'linear-gradient(135deg, #1a237e, #3949ab)',
              borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(26,35,126,0.3)'
            }}>
              <FiLogIn size={28} color="white" />
            </div>
          )}
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a237e', marginBottom: 4 }}>Welcome Back</h1>
          <p style={{ color: '#6c757d', fontSize: 14 }}>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiMail style={{ marginRight: 6 }} />Email</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label><FiLock style={{ marginRight: 6 }} />Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} className="form-control" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
          New client? <Link to="/signup" style={{ color: '#1a237e', fontWeight: 700, textDecoration: 'none' }}>Register here</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#999', padding: '12px', background: '#f8f9fa', borderRadius: 12 }}>
          <strong>Admin Access</strong><br/>admin@admin.com / Admin@123
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
