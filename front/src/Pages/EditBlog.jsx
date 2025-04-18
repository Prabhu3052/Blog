import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { blogService } from '../api';
import './Styles/EditBlog.css';

export default function EditBlog() {
  const { id } = useParams();
  const { user, showNotification } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [blog, setBlog] = useState({
    title: '',
    content: '',
    image: '',
    versions: []
  });
  const [activeVersion, setActiveVersion] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await blogService.getBlogById(id);
        setBlog(response);
        setActiveVersion(response);
      } catch (error) {
        setError('Failed to load blog');
        showNotification('Failed to load blog', 'error');
        navigate('/blogs');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleChange = (e) => {
    setActiveVersion({
      ...activeVersion,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setActiveVersion({
        ...activeVersion,
        image: URL.createObjectURL(file),
        imageFile: file
      });
    }
  };

  const saveVersion = async () => {
    if (!activeVersion.title.trim() || !activeVersion.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setSaving(true);
    try {
      const newVersion = {
        id: `v${blog.versions.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        author: user.name,
        summary: prompt('Enter a brief summary of changes:') || 'Updated'
      };
      
      const formData = new FormData();
      formData.append('title', activeVersion.title);
      formData.append('content', activeVersion.content);
      if (activeVersion.imageFile) {
        formData.append('image', activeVersion.imageFile);
      }
      
      await blogService.updateBlog(id, formData);
      
      setBlog({
        ...blog,
        versions: [...blog.versions, newVersion],
        ...activeVersion
      });
      
      showNotification('Version saved successfully');
    } catch (err) {
      setError(err.message || 'Failed to save version');
    } finally {
      setSaving(false);
    }
  };

  const restoreVersion = async (versionId) => {
    if (!window.confirm(`Restore version ${versionId}? This will replace your current changes.`)) {
      return;
    }

    try {
      const versionToRestore = blog.versions.find(v => v.id === versionId);
      if (!versionToRestore) {
        throw new Error('Version not found');
      }

      const response = await blogService.getBlogVersion(id, versionId);
      setActiveVersion(response);
      showNotification('Version restored successfully');
    } catch (err) {
      setError(err.message || 'Failed to restore version');
    }
  };

  if (loading) {
    return <div className="loading">Loading blog post...</div>;
  }

  return (
    <div className="edit-blog-container">
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="editor-column">
        <h1>Edit Blog Post</h1>
        
        <div className="editor-header">
          <button 
            className="version-button"
            onClick={saveVersion}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save New Version'}
          </button>
          <button 
            className="publish-button"
            onClick={saveVersion}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Publish Changes'}
          </button>
        </div>

        <div className="editor-form">
          <div className="form-group">
            <input
              type="text"
              name="title"
              value={activeVersion?.title || ''}
              onChange={handleChange}
              placeholder="Blog title"
              className="title-input"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="image-upload" className={`image-upload-label ${saving ? 'disabled' : ''}`}>
              {activeVersion?.image ? (
                <img 
                  src={activeVersion.image} 
                  alt="Blog cover" 
                  className="image-preview"
                />
              ) : (
                <div className="image-placeholder">
                  <span>+</span>
                  <p>Upload Cover Image</p>
                </div>
              )}
            </label>
            <input
              type="file"
              id="image-upload"
              onChange={handleImageChange}
              accept="image/*"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <textarea
              name="content"
              value={activeVersion?.content || ''}
              onChange={handleChange}
              placeholder="Write your blog content here..."
              className="content-textarea"
              disabled={saving}
            />
          </div>
        </div>
      </div>

      <div className="versions-column">
        <h2>Version History</h2>
        <div className="versions-list">
          {blog.versions.map((version) => (
            <div 
              key={version.id} 
              className={`version-card ${activeVersion?.id === version.id ? 'active' : ''}`}
              onClick={() => restoreVersion(version.id)}
            >
              <div className="version-header">
                <span className="version-id">{version.id}</span>
                <span className="version-date">{version.date}</span>
              </div>
              <p className="version-author">By {version.author}</p>
              <p className="version-summary">{version.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}