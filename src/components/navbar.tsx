import { useState } from 'react';
import { Link } from 'react-router-dom'; 

interface NavbarProps {
  title?: string;
  links?: Array<{ name: string; path: string }>;
}

const Navbar = ({ title = "Conehub", links = [] }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const defaultLinks = [
    { name: "Comic", path: "/comic" },
    { name: "CQ", path: "/CQ" },
    { name: "Contacts", path: "/contacts" },
  ];

  const navLinks = links.length > 0 ? links : defaultLinks;

  // Close menu when clicking outside (optional)
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo/Brand - FIXED: Button NOT inside Link */}
        <div className="nav-brand">
          <Link to="/" className="logo" onClick={handleLinkClick}>
            {title}
          </Link>
        </div>

        {/* Mobile Menu Button - FIXED: Separate button */}
        <button 
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className="hamburger"></span>
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="nav-link"
              onClick={handleLinkClick}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;