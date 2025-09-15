import { useAuth } from '../../providers/AuthProvider';
import './WelcomeBanner.css';

export default function WelcomeBanner() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="welcome-banner">
      <span className="welcome-text">היי {user.name}! ברוכים הבאים לפלטפורמת הלמידה</span>
    </div>
  );
}