import './Styles/BlogCard.css';

export default function BlogCard({ blog }) {
  return (
    <div className="blog-card">
      <div className="card-inner">
        <div className="card-front">
          <img src={blog.image || '/default-blog.jpg'} alt={blog.title} />
          <div className="card-content">
            <h3>{blog.title}</h3>
            <p className="excerpt">{blog.excerpt}</p>
          </div>
        </div>
        <div className="card-back">
          <div className="back-content">
            <p className="author">By {blog.author}</p>
            <p className="date">{new Date(blog.createdAt).toLocaleDateString()}</p>
            <button className="read-more">Read More</button>
          </div>
        </div>
      </div>
    </div>
  );
}