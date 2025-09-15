import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token');
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token]);

  const showWelcomeMessage = (userName) => {
    // בעתיד נוכל להוסיף כאן Toast notification
    console.log(`ברוך הבא ${userName}!`);
  };

  const login = async (email, password, recaptchaToken) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, recaptchaToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'שגיאה בהתחברות');
      }

      // שמירת הנתונים
      if (data.token) {
        setToken(data.token);
        try {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (e) {
          console.error('Failed to store auth data:', e);
        }
      }

      setUser(data.user);
      showWelcomeMessage(data.user.name);
      
      // ניווט לדף הפרומפטים עם השהייה קצרה כדי לאפשר הצגת הודעת ברוכים הבאים
      setTimeout(() => {
        navigate('/prompts');
      }, 500);
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, recaptchaToken) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, recaptchaToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'שגיאה בהרשמה');
      }

      if (data.token) {
        setToken(data.token);
        try {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (e) {
          console.error('Failed to store auth data:', e);
        }
      }

      setUser(data.user);
      showWelcomeMessage(data.user.name);
      
      // ניווט לדף הפרומפטים
      navigate('/prompts');

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      // ניסיון לעדכן את השרת
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        await fetch('/api/auth/logout', { 
          method: 'POST',
          headers
        });
      } catch (e) {
        console.warn('Logout request failed:', e);
      }

      // ניקוי נתונים מקומיים
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {
        console.error('Failed to clear local storage:', e);
      }

      setToken(null);
      setUser(null);
      navigate('/');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    if (!token) return;

    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // ניקוי נתוני אימות לא תקינים
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error('Auth check failed:', err);
      setError('בדיקת אימות נכשלה');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };