import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const register = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data && response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
    throw new Error('Registration failed: No token received');
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Registration failed. Please try again.';
    throw new Error(errorMessage);
  }
};

const login = async (credentials) => {
  try {
    console.log('Attempting login with credentials:', { email: credentials.email });
    const response = await axios.post(`${API_URL}/login`, credentials);
    console.log('Login response:', response.data);
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Login failed');
    }
    
    if (!response.data.token || !response.data.user) {
      throw new Error('Invalid response from server');
    }
    
    const userData = {
      token: response.data.token,
      user: {
        _id: response.data.user._id,
        username: response.data.user.username,
        email: response.data.user.email,
        avatar: response.data.user.avatar || '/default-avatar.jpg',
        bio: response.data.user.bio || '',
        role: response.data.user.role
      }
    };
    
    console.log('Storing user data:', userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Login failed. Please try again.';
    throw new Error(errorMessage);
  }
};

const verifyToken = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.token) {
      throw new Error('No token found');
    }
    
    const response = await axios.get(`${API_URL}/verify`, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Token verification error:', error);
    localStorage.removeItem('user');
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('user');
};

// Add these to your authService export
const authService = {
  register,
  login,
  verifyToken,
  logout
};

export default authService;