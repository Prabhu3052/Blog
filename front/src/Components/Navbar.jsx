import { Link } from 'react-router-dom';
import './Styles/Navbar.css';

export default function Navbar() {
  return (
    <nav className="floating-nav">
      <div className="nav-logo">✨ BlogVerse</div>
      <div className="nav-links">
        <Link to="/" className="nav-link hover-underline">Home</Link>
        <Link to="/blogs" className="nav-link hover-underline">Explore</Link>
        <Link to="/create" className="nav-link cta-button">Create</Link>
        <Link to="/login" className="nav-link auth-button">Sign In</Link>
      </div>
    </nav>
  );
}