import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <Link to="/" className="logo">
            <span>Leafsphere</span>
          </Link>
          
          <nav className="nav">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/application-form" className="nav-link">
              Apply
            </Link>
            <Link to="/employee-ratings" className="nav-link">
              Ratings
            </Link>
            <Link to="/notifications" className="nav-link">
              Notifications
            </Link>
            <Link to="/login" className="login-button">
             Login
            </Link>
          </nav>
          
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </button>
        </div>
        
        {isMenuOpen && (
          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link to="/application-form" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Apply
            </Link>
            <Link to="/employee-ratings" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Ratings
            </Link>
            <Link to="/notifications" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Notifications
            </Link>
             <Link to="/login" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
            Login
          </Link>

          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;