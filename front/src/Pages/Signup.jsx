import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import './Styles/Signup.css';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    avatar: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const { showNotification, register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image
    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image size should be less than 5MB');
      return;
    }

    setError(null);
    setFormData(prev => ({ ...prev, avatar: file }));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return 'Username can only contain letters, numbers and underscores';
        }
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email';
        }
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Include at least one uppercase letter';
        if (!/[0-9]/.test(value)) return 'Include at least one number';
        return '';
      case 'confirmPassword':
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  }, [formData.password]);

  const validateCurrentStep = useCallback(() => {
    let isValid = true;
    
    if (step === 1) {
      const usernameError = validateField('username', formData.username);
      const emailError = validateField('email', formData.email);
      
      if (usernameError) {
        showNotification(usernameError, 'error');
        isValid = false;
      }
      if (emailError) {
        showNotification(emailError, 'error');
        isValid = false;
      }
    } else if (step === 2) {
      const passwordError = validateField('password', formData.password);
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      
      if (passwordError) {
        showNotification(passwordError, 'error');
        isValid = false;
      }
      if (confirmError) {
        showNotification(confirmError, 'error');
        isValid = false;
      }
    }
    
    return isValid;
  }, [step, formData, validateField, showNotification]);

  const nextStep = useCallback(() => {
    if (!validateCurrentStep()) return;
    setStep(prev => prev + 1);
  }, [validateCurrentStep]);

  const prevStep = useCallback(() => {
    setStep(prev => prev - 1);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateCurrentStep()) return;

    if (step !== 3) {
      nextStep();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('password', formData.password);
      formDataToSend.append('bio', formData.bio.trim() || 'New user');
      
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      await register(formDataToSend, { redirectTo: '/profile' });
      
      showNotification('Account created successfully!', 'success');
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Registration failed. Please try again.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [formData, loading, register, showNotification, validateCurrentStep, step, nextStep]);

  const getFieldError = (name) => {
    return touched[name] ? validateField(name, formData[name]) : '';
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-progress">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`progress-step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
            >
              <div className="step-number">{i}</div>
              <div className="step-label">
                {i === 1 ? 'Basic Info' : i === 2 ? 'Password' : 'Profile'}
              </div>
            </div>
          ))}
          <div className="progress-bar" style={{ width: `${(step - 1) * 50}%` }}></div>
        </div>

        <form onSubmit={handleSubmit} className="signup-form" noValidate>
          {step === 1 && (
            <div className={`form-step ${step === 1 ? 'active' : ''}`}>
              <h2>Create Your Account</h2>
              <p className="subtext">Join our community in just a few steps</p>
              
              <div className="input-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
                  placeholder="e.g. johndoe123"
                  required
                  autoFocus
                  className={touched.username && getFieldError('username') ? 'error' : ''}
                />
                {touched.username && getFieldError('username') && (
                  <span className="error-message">{getFieldError('username')}</span>
                )}
              </div>
              
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  placeholder="your@email.com"
                  required
                  className={touched.email && getFieldError('email') ? 'error' : ''}
                />
                {touched.email && getFieldError('email') && (
                  <span className="error-message">{getFieldError('email')}</span>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={`form-step ${step === 2 ? 'active' : ''}`}>
              <h2>Set Your Password</h2>
              <p className="subtext">Create a strong password to secure your account</p>
              
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                  placeholder="At least 8 characters"
                  required
                  minLength="8"
                  className={touched.password && getFieldError('password') ? 'error' : ''}
                />
                {touched.password && getFieldError('password') && (
                  <span className="error-message">{getFieldError('password')}</span>
                )}
                <div className="password-hints">
                  <span className={formData.password.length >= 8 ? 'valid' : ''}>
                    • 8+ characters
                  </span>
                  <span className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                    • Uppercase letter
                  </span>
                  <span className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                    • Number
                  </span>
                </div>
              </div>
              
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                  placeholder="Re-enter your password"
                  required
                  className={touched.confirmPassword && getFieldError('confirmPassword') ? 'error' : ''}
                />
                {touched.confirmPassword && getFieldError('confirmPassword') && (
                  <span className="error-message">{getFieldError('confirmPassword')}</span>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={`form-step ${step === 3 ? 'active' : ''}`}>
              <h2>Complete Your Profile</h2>
              <p className="subtext">Add some personal touches (optional)</p>
              
              <div className="avatar-upload-container">
                <label htmlFor="avatar" className="avatar-upload-label">
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" className="avatar-preview" />
                      <div className="avatar-change-text">Change Photo</div>
                    </>
                  ) : (
                    <div className="avatar-placeholder">
                      <i className="fas fa-camera"></i>
                      <span>Add Photo</span>
                    </div>
                  )}
                </label>
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="avatar-input"
                />
                {error && <p className="avatar-error">{error}</p>}
                <p className="avatar-note">Max 5MB • JPG, PNG</p>
              </div>
              
              <div className="input-group">
                <label htmlFor="bio">Short Bio (Optional)</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us a bit about yourself..."
                  rows="3"
                  maxLength="150"
                />
                <div className="bio-counter">
                  <span>{formData.bio.length}/150</span>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            {step > 1 && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={prevStep}
                disabled={loading}
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={nextStep}
                disabled={loading}
              >
                Continue
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span> Creating Account...
                  </>
                ) : (
                  'Complete Signup'
                )}
              </button>
            )}
          </div>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Log in</Link></p>
            <p className="terms-notice">
              By signing up, you agree to our <Link to="/terms" className="auth-link">Terms</Link> and <Link to="/privacy" className="auth-link">Privacy Policy</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}