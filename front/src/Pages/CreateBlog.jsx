import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { blogService } from '../api';
import './Styles/CreateBlog.css';

export default function CreateBlog() {
  const navigate = useNavigate();
  const { showNotification } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [blog, setBlog] = useState({
    title: '',
    content: '',
    image: null
  });

  const handleChange = (e) => {
    setBlog({
      ...blog,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setBlog({
        ...blog,
        image: file
      });
    }
  };

  const validateForm = () => {
    if (!blog.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!blog.content.trim()) {
      setError('Content is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', blog.title);
      formData.append('content', blog.content);
      if (blog.image) {
        formData.append('image', blog.image);
      }

      await blogService.createBlog(formData);
      showNotification('Blog created successfully!');
      navigate('/blogs');
    } catch (err) {
      setError(err.message || 'Failed to create blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h1>Create New Blog</h1>
        <div className="editor-actions">
          <button 
            className="publish" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="editor-main">
        <div className="editor-title">
          <input
            type="text"
            name="title"
            placeholder="Your amazing blog title..."
            value={blog.title}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="editor-image-upload">
          <label htmlFor="blog-image" className={loading ? 'disabled' : ''}>
            {blog.image ? (
              <img 
                src={URL.createObjectURL(blog.image)} 
                alt="Preview" 
                className="image-preview"
              />
            ) : (
              <div className="image-placeholder">
                <span>+</span>
                <p>Add Featured Image</p>
              </div>
            )}
          </label>
          <input
            type="file"
            id="blog-image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
          />
        </div>

        <div className="editor-content">
          <textarea
            name="content"
            placeholder="Start writing your story here..."
            value={blog.content}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="editor-toolbar">
          <button className="tool-button">H1</button>
          <button className="tool-button">H2</button>
          <button className="tool-button">B</button>
          <button className="tool-button">I</button>
          <button className="tool-button">Link</button>
          <button className="tool-button">Image</button>
          <button className="tool-button">Quote</button>
        </div>
      </div>
    </div>
  );
}
