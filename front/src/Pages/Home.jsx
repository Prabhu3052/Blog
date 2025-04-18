import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import BlogCard from '../Components/BlogCard';
import './Styles/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const animateText = () => {
      const elements = document.querySelectorAll('.hero-text span');
      elements.forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = 1;
          el.style.transform = 'translateY(0)';
        }, i * 100);
      });
    };
    animateText();
  }, []);

  const handleStartWriting = () => {
    if (user) {
      // If user is logged in, navigate to create blog page
      navigate('/create');
    } else {
      // If not logged in, navigate to login page with redirect
      navigate('/login', { state: { from: '/create' } });
      // Alternatively, you could show a login modal instead
    }
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-text">
            <span>Share</span>
            <span>Your</span>
            <span>Story</span>
            <span>With</span>
            <span>The</span>
            <span>World</span>
          </h1>
          <p className="hero-subtext">A creative space for passionate writers and curious readers</p>
          <button 
            className="hero-cta"
            onClick={handleStartWriting}
          >
            Start Writing
          </button>
        </div>
        <div className="hero-image">
          <div className="gradient-circle"></div>
          <div className="gradient-circle small"></div>
        </div>
      </section>

      <section className="featured-blogs">
        <h2>Featured Stories</h2>
        <div className="blogs-grid">
          {[1, 2, 3].map((blog) => (
            <BlogCard key={blog} blog={{
              title: "The Art of Creative Writing",
              excerpt: "Discover how to unlock your creative potential and craft stories that captivate readers...",
              author: "Jane Doe",
              createdAt: new Date(),
              image: "/writing.jpg"
            }} />
          ))}
        </div>
      </section>
    </div>
  );
}