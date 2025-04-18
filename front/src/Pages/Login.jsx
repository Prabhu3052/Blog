import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import './Styles/Auth.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      await login(formData, { redirectTo: '/profile' });
      // Optional: Clear form after successful login
      setFormData({ email: '', password: '' });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to your account</p>
        
        {error && (
          <div className="auth-error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="auth-footer-links">
          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <p className="auth-footer">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}