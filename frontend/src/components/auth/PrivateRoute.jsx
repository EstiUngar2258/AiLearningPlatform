import { Navigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    // אפשר להוסיף כאן קומפוננטת טעינה
    return <div>טוען...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}