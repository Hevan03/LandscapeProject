import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Leafsphere</h1>
          <p className="hero-subtitle">
            Creating sustainable landscapes and meaningful employment opportunities
          </p>
          <Link to="/application-form" className="btn btn-primary hero-cta">
            Apply Now
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <span>🌱</span>
              </div>
              <h3 className="feature-title">Landscaping Services</h3>
              <p className="feature-description">
                Professional landscaping solutions for your outdoor spaces with sustainable practices
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <span>👥</span>
              </div>
              <h3 className="feature-title">Employment Opportunities</h3>
              <p className="feature-description">
                Join our team of landscaping professionals and build a rewarding career
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <span>⭐</span>
              </div>
              <h3 className="feature-title">Client Feedback</h3>
              <p className="feature-description">
                See what our clients say about our services and employee performance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Projects Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100+</div>
              <div className="stat-label">Happy Employees</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.8★</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Active Landscapers</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-subtitle">
              Join our growing community of landscaping professionals and satisfied clients
            </p>
            <div className="cta-buttons">
              <Link to="/application-form" className="btn btn-primary">
                Apply Now
              </Link>
              <Link to="/employee-ratings" className="btn btn-outline">
                View Ratings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;