import { useAuth } from '../../providers/AuthProvider';
import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <h1>Welcome to AI Learning Platform</h1>
      <p>Enhance your learning experience with AI-powered assistance</p>
      
      {user ? (
        <div className="user-actions">
          <Link to="/prompts" className="action-button">
            Create New Prompt
          </Link>
          <Link to="/history" className="action-button">
            View Learning History
          </Link>
        </div>
      ) : (
        <div className="auth-actions">
          <Link to="/login" className="action-button">
            Get Started
          </Link>
        </div>
      )}

      <section className="features">
        <h2>Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>AI-Powered Learning</h3>
            <p>Get personalized assistance and explanations tailored to your needs</p>
          </div>
          <div className="feature-card">
            <h3>Track Progress</h3>
            <p>Monitor your learning journey and review past interactions</p>
          </div>
          <div className="feature-card">
            <h3>Multiple Subjects</h3>
            <p>Access help across various subjects and topics</p>
          </div>
        </div>
      </section>
    </div>
  );
}