import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Leafsphere</h3>
            <p className="footer-text">
              Creating sustainable landscapes and meaningful employment opportunities for our community.
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-subtitle">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/application-form" className="footer-link">Apply Now</Link></li>
              <li><Link to="/ratings" className="footer-link">Employee Ratings</Link></li>
              <li><Link to="/notifications" className="footer-link">Notifications</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-subtitle">Contact Info</h4>
            <div className="footer-contacts">
              <p>📧 info@leafsphere.com</p>
              <p>📞 (555) 123-4567</p>
              <p>📍 123 Green Street, Garden City</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Leafsphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;