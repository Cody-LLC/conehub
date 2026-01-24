import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      {/* Hero Cone Section */}
      <section className="cone-hero">
        <div className="cone-icon">🔺</div>
        <h1 className="cone-title">Welcome to Conehub</h1>
        <p className="cone-subtitle">Where Cones Manage Cones</p>
        <p className="cone-motto">Training Never Stops... Neither Does CQ</p>
      </section>

      {/* Cone Features */}
      <section className="cone-features">
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>CQ Scheduler</h3>
            <p>Stop arguing about who has duty. Let the Cone decide!</p>
            <Link to="/CQ" className="feature-btn">
              Schedule Like a Cone →
            </Link>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Cone Comics</h3>
            <p>Laugh at our pain. Weekly comics about cone life.</p>
            <Link to="/comic" className="feature-btn">
              Read Cone Funnies →
            </Link>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📞</div>
            <h3>Who to Cone-tact</h3>
            <p>Lost? Confused? Need a grown-up? We got you.</p>
            <Link to="/contacts" className="feature-btn">
              Find Your People →
            </Link>
          </div>
        </div>
      </section>

      {/* Cone Stats */}
      <section className="cone-stats">
        <h2 className="section-title">Cone Stats</h2>
        <div className="stats-grid">
          <div className="stat">
            <div className="stat-number">∞</div>
            <div className="stat-label">CQ Shifts Avoided</div>
          </div>
          <div className="stat">
            <div className="stat-number">100%</div>
            <div className="stat-label">Cone-fusion Rate</div>
          </div>
          <div className="stat">
            <div className="stat-number">2026</div>
            <div className="stat-label">Year of the Cone</div>
          </div>
        </div>
      </section>
      <p className="disclaimer">
          *Not actually endorsed by the Air Force. Probably.
        </p>
    </div>
  );
};

export default Home;