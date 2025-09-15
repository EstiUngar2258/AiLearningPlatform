import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">Welcome to AI Learning Platform</h1>
        <p className="hero-subtitle">
          Enhance your learning experience with AI-powered conversations
        </p>
      </div>
      
      <div className="features-grid">
        <div className="feature-card">
          <h3>Smart Conversations</h3>
          <p>Engage in meaningful dialogues with our AI tutor</p>
        </div>
        <div className="feature-card">
          <h3>Track Progress</h3>
          <p>Monitor your learning journey with detailed history</p>
        </div>
        <div className="feature-card">
          <h3>Personalized Learning</h3>
          <p>Get customized responses based on your needs</p>
        </div>
      </div>
      
      {!isAuthenticated && (
        <div className="cta-section">
          <h2>Ready to Start Learning?</h2>
          <div className="cta-buttons">
            <a href="/register" className="cta-button primary">Sign Up Now</a>
            <a href="/login" className="cta-button secondary">Login</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
