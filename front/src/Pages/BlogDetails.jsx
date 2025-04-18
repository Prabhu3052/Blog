import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { blogService } from '../api';
import './Styles/BlogDetails.css';

export default function BlogDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState('');
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const [blogData, relatedData, commentsData] = await Promise.all([
          blogService.getBlogById(id),
          blogService.getRelatedBlogs(id),
          blogService.getBlogComments(id)
        ]);

        setBlog(blogData);
        setRelatedBlogs(relatedData);
        setComments(commentsData);
        
        if (user) {
          const [liked, bookmarked] = await Promise.all([
            blogService.checkLikeStatus(id),
            blogService.checkBookmarkStatus(id)
          ]);
          setIsLiked(liked);
          setIsBookmarked(bookmarked);
        }
      } catch (error) {
        setError('Failed to load blog data');
        console.error("Failed to fetch blog:", error);
      } finally {
        setLoading(false);
        setLoadingRelated(false);
        setLoadingComments(false);
      }
    };
    
    fetchBlogData();
  }, [id, user]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    setIsSubmitting(true);
    try {
      const comment = await blogService.addComment(id, newComment);
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      setError('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    
    try {
      if (isLiked) {
        await blogService.unlikeBlog(id);
        setBlog(prev => ({ ...prev, likes: prev.likes - 1 }));
      } else {
        await blogService.likeBlog(id);
        setBlog(prev => ({ ...prev, likes: prev.likes + 1 }));
      }
      setIsLiked(!isLiked);
    } catch (error) {
      setError('Failed to update like status');
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    
    try {
      if (isBookmarked) {
        await blogService.removeBookmark(id);
      } else {
        await blogService.addBookmark(id);
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      setError('Failed to update bookmark status');
    }
  };

  if (loading) {
    return <div className="loading">Loading blog post...</div>;
  }

  if (!blog) {
    return <div className="error">Blog not found</div>;
  }

  return (
    <div className="blog-details-container">
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <article className="blog-content">
        <header className="blog-header">
          <div className="blog-meta">
            <Link to={`/profile/${blog.author.name}`} className="author-info">
              <img 
                src={blog.author.avatar} 
                alt={blog.author.name} 
                className="author-avatar"
              />
              <div>
                <span className="author-name">{blog.author.name}</span>
                <span className="publish-date">
                  {new Date(blog.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </Link>
            <div className="blog-tags">
              {blog.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
          
          <h1 className="blog-title">{blog.title}</h1>
          
          <div className="featured-image-container">
            <img 
              src={blog.image} 
              alt={blog.title} 
              className="featured-image"
            />
          </div>
        </header>

        <div 
          className="blog-body" 
          dangerouslySetInnerHTML={{ __html: blog.content }}
        ></div>

        <footer className="blog-actions">
          <div className="action-group">
            <button 
              className={`action-button ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={!user}
            >
              <i className={`fas fa-heart ${isLiked ? 'solid' : 'regular'}`}></i>
              <span>{blog.likes} Likes</span>
            </button>
            <button className="action-button">
              <i className="fas fa-share"></i>
              <span>Share</span>
            </button>
            <button 
              className={`action-button ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmark}
              disabled={!user}
            >
              <i className={`fas fa-bookmark ${isBookmarked ? 'solid' : 'regular'}`}></i>
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>
          
          {user && user.id === blog.author.id && (
            <Link to={`/edit/${blog.id}`} className="edit-button">
              <i className="fas fa-edit"></i> Edit Post
            </Link>
          )}
        </footer>
      </article>

      <section className="comments-section">
        <h2 className="section-title">Discussion ({comments.length})</h2>
        
        {user ? (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <img 
              src={user.avatar || "/default-avatar.jpg"} 
              alt={user.name} 
              className="comment-avatar"
            />
            <div className="comment-input-group">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows="3"
                disabled={isSubmitting}
              ></textarea>
              <button 
                type="submit" 
                className="submit-comment"
                disabled={isSubmitting || !newComment.trim()}
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="login-prompt">
            <Link to="/login">Log in</Link> to join the conversation
          </div>
        )}

        {loadingComments ? (
          <div className="loading">Loading comments...</div>
        ) : (
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment">
                <img 
                  src={comment.author.avatar || "/default-avatar.jpg"} 
                  alt={comment.author.name} 
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{comment.author.name}</span>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="related-blogs">
        <h2 className="section-title">Related Stories</h2>
        {loadingRelated ? (
          <div className="loading">Loading related blogs...</div>
        ) : (
          <div className="related-blogs-grid">
            {relatedBlogs.map(blog => (
              <Link key={blog.id} to={`/blogs/${blog.id}`} className="related-blog-card">
                <img src={blog.image} alt={blog.title} />
                <h3>{blog.title}</h3>
                <p>{blog.excerpt}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}