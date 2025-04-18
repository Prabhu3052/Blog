import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../api/auth';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  // Persistent login check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedData = localStorage.getItem('user');
        if (!storedData) {
          setLoading(false);
          return;
        }

        const userData = JSON.parse(storedData);
        if (userData?.token) {
          const verifiedUser = await authService.verifyToken();
          if (verifiedUser) {
            setUser({
              id: verifiedUser._id,
              username: verifiedUser.username,
              name: verifiedUser.name,
              email: verifiedUser.email,
              avatar: verifiedUser.avatar || '/default-avatar.jpg',
              bio: verifiedUser.bio || ''
            });
            setToken(userData.token);
          } else {
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const storeAuthData = useCallback((userData) => {
    const authData = {
      user: {
        id: userData._id,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        bio: userData.bio
      },
      token: userData.token
    };
    
    localStorage.setItem('user', JSON.stringify(authData));
    setUser(authData.user);
    setToken(authData.token);
  }, []);

  const login = async (credentials, options = {}) => {
    try {
      setLoading(true);
      const userData = await authService.login(credentials);
      
      if (!userData?.token) {
        throw new Error('Login failed: Invalid response from server');
      }
      
      storeAuthData(userData);
      
      showNotification('Login successful!', 'success');
      
      if (options.redirect !== false) {
        navigate(options.redirectTo || '/profile');
      }
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      showNotification(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please try again.', 
        'error'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData, options = {}) => {
    try {
      setLoading(true);
      const newUser = await authService.register(formData);
      
      if (!newUser?.token) {
        throw new Error('Registration failed: Invalid response from server');
      }
      
      storeAuthData(newUser);
      
      showNotification(
        `Welcome ${newUser.username || newUser.name}! Account created successfully`,
        'success'
      );
      
      if (options.redirect !== false) {
        navigate(options.redirectTo || '/profile');
      }
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      showNotification(
        error.response?.data?.message || 
        error.message || 
        'Registration failed. Please try again.', 
        'error'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (options = {}) => {
    try {
      authService.logout();
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      
      showNotification('Logged out successfully', 'success');
      
      if (options.redirect !== false) {
        navigate(options.redirectTo || '/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification(
        error.message || 'Logout failed. Please try again.',
        'error'
      );
    }
  };

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    const timer = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(timer);
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    showNotification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✓' : '⚠'}
            </span>
            {notification.message}
          </div>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            &times;
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
}