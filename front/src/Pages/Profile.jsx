import { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { userService, blogService } from '../api';
import BlogCard from '../Components/BlogCard';
import { useNavigate } from 'react-router-dom';
import './Styles/Profile.css';

export default function Profile() {
  const { user, showNotification, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    website: '',
    social: {
      twitter: '',
      instagram: ''
    }
  });
  const [userBlogs, setUserBlogs] = useState([]);
  const [likedBlogs, setLikedBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [profile, blogs] = await Promise.all([
          userService.getProfile(),
          blogService.getUserBlogs()
        ]);
        
        setProfileData({
          name: profile.name || user.name || '',
          bio: profile.bio || 'Writer, storyteller, and coffee enthusiast.',
          website: profile.website || '',
          social: {
            twitter: profile.social?.twitter || '',
            instagram: profile.social?.instagram || ''
          }
        });
        
        setUserBlogs(blogs);
        setAvatarPreview(user.avatar || '/default-avatar.jpg');
      } catch (error) {
        console.error('Profile fetch error:', error);
        setError(error.message || 'Failed to load profile data');
        if (error.response?.status === 401) {
          logout({ redirect: false });
          showNotification('Session expired. Please login again.', 'error');
        }
      } finally {
        setLoading(false);
        setLoadingBlogs(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user, logout, showNotification]);

  // Fetch liked blogs when tab changes
  useEffect(() => {
    const fetchLikedBlogs = async () => {
      if (activeTab === 'liked') {
        setLoadingBlogs(true);
        try {
          const blogs = await blogService.getLikedBlogs();
          setLikedBlogs(blogs);
        } catch (error) {
          console.error('Liked blogs fetch error:', error);
          setError(error.message || 'Failed to load liked blogs');
        } finally {
          setLoadingBlogs(false);
        }
      }
    };

    fetchLikedBlogs();
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'avatar') {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
        setProfileData(prev => ({
          ...prev,
          avatarFile: file
        }));
      }
      return;
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Append all profile data
      formData.append('name', profileData.name);
      formData.append('bio', profileData.bio);
      formData.append('website', profileData.website);
      formData.append('social', JSON.stringify(profileData.social));
      
      if (profileData.avatarFile) {
        formData.append('avatar', profileData.avatarFile);
      }

      const updatedProfile = await userService.updateProfile(formData);
      
      setProfileData(prev => ({
        ...prev,
        name: updatedProfile.name,
        bio: updatedProfile.bio,
        website: updatedProfile.website,
        social: updatedProfile.social
      }));
      
      showNotification('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null; // Already redirected by useEffect
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
          <button onClick={() => setError('')} className="error-close">
            &times;
          </button>
        </div>
      )}

      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={avatarPreview} 
            alt={profileData.name} 
            className="avatar-image"
          />
          {editMode && (
            <>
              <label htmlFor="avatar-upload" className="avatar-edit-button">
                <i className="fas fa-camera"></i>
                <input
                  id="avatar-upload"
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
              </label>
            </>
          )}
        </div>

        <div className="profile-info">
          {editMode ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Display Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className="profile-input"
                  disabled={saving}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  className="profile-textarea"
                  rows="3"
                  disabled={saving}
                  maxLength="200"
                />
                <small className="char-count">
                  {profileData.bio.length}/200 characters
                </small>
              </div>
              
              <div className="social-inputs">
                <div className="input-group">
                  <i className="fas fa-globe"></i>
                  <input
                    type="url"
                    name="website"
                    value={profileData.website}
                    onChange={handleChange}
                    placeholder="Your website URL"
                    disabled={saving}
                  />
                </div>
                <div className="input-group">
                  <i className="fab fa-twitter"></i>
                  <input
                    type="text"
                    name="social.twitter"
                    value={profileData.social.twitter}
                    onChange={handleChange}
                    placeholder="@username"
                    disabled={saving}
                  />
                </div>
                <div className="input-group">
                  <i className="fab fa-instagram"></i>
                  <input
                    type="text"
                    name="social.instagram"
                    value={profileData.social.instagram}
                    onChange={handleChange}
                    placeholder="@username"
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setEditMode(false);
                    setAvatarPreview(user.avatar || '/default-avatar.jpg');
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2>{profileData.name}</h2>
              <p className="profile-bio">{profileData.bio}</p>
              
              <div className="social-links">
                {profileData.website && (
                  <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-globe"></i>
                    <span>Website</span>
                  </a>
                )}
                {profileData.social.twitter && (
                  <a 
                    href={`https://twitter.com/${profileData.social.twitter.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-twitter"></i>
                    <span>Twitter</span>
                  </a>
                )}
                {profileData.social.instagram && (
                  <a 
                    href={`https://instagram.com/${profileData.social.instagram.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-instagram"></i>
                    <span>Instagram</span>
                  </a>
                )}
              </div>
              
              <div className="profile-actions">
                <button 
                  className="edit-profile-button" 
                  onClick={() => setEditMode(true)}
                >
                  <i className="fas fa-edit"></i> Edit Profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
          disabled={loadingBlogs}
        >
          My Posts {!loadingBlogs && <span>({userBlogs.length})</span>}
        </button>
        <button 
          className={`tab-button ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
          disabled={loadingBlogs}
        >
          Liked Posts {!loadingBlogs && activeTab === 'liked' && <span>({likedBlogs.length})</span>}
        </button>
      </div>

      <div className="profile-content">
        {loadingBlogs ? (
          <div className="loading-blogs">
            <div className="spinner small"></div>
            <p>Loading {activeTab === 'posts' ? 'your posts' : 'liked posts'}...</p>
          </div>
        ) : activeTab === 'posts' ? (
          <div className="blog-list">
            {userBlogs.length > 0 ? (
              userBlogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} showActions={true} />
              ))
            ) : (
              <div className="empty-state">
                <i className="fas fa-pen-fancy"></i>
                <h3>No Posts Yet</h3>
                <p>You haven't written any posts yet. Start sharing your thoughts!</p>
                <button 
                  className="create-post-button"
                  onClick={() => navigate('/create-post')}
                >
                  Create Your First Post
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="blog-list">
            {likedBlogs.length > 0 ? (
              likedBlogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} />
              ))
            ) : (
              <div className="empty-state">
                <i className="fas fa-heart"></i>
                <h3>No Liked Posts</h3>
                <p>You haven't liked any posts yet. Explore the community!</p>
                <button 
                  className="explore-button"
                  onClick={() => navigate('/')}
                >
                  Explore Posts
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}