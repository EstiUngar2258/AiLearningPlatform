import { Link } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">AI Learning Platform</Link>
      </div>
      <div className="navbar-menu">
        {user ? (
          <>
            <Link to="/prompts" className="navbar-item">New Prompt</Link>
            <Link to="/history" className="navbar-item">History</Link>
            <button onClick={handleLogout} className="navbar-item logout-button">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar-item">Login/Register</Link>
        )}
      </div>
    </nav>
  );
}