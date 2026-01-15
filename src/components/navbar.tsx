import { useState } from 'react';

interface NavbarProps {
  title?: string;
  links?: Array<{ name: string; path: string }>;
}

const Navbar = ({ title = "Conehub", links = [] }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const defaultLinks = [
    { name: "Comic", path: "/comic" },
    { name: "CQ", path: "/CQ" },
    { name: "About", path: "/about" },
  ];

  const navLinks = links.length > 0 ? links : defaultLinks;

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo/Brand */}
        <div className="nav-brand">
          <a href="/" className="logo">
            {title}
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger"></span>
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className="nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;