import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (!token) {
      setUserName('');
      localStorage.removeItem('userName');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload && payload.name) {
        setUserName(payload.name);
        localStorage.setItem('userName', payload.name);
      }
      if (payload && payload.userId) {
        setUserId(payload.userId);
      }
    } catch (err) {
      // ignore decode errors
    }
  }, [token]);

  const login = async (email, password, recaptchaToken) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, recaptchaToken })
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.token) {
      setToken(json.token);
      localStorage.setItem('token', json.token);
      setUserId(json.user._id);
      setUserName(json.user.name);
      return true;
    }
    // map common backend errors to friendly messages
    if (res.status === 401) throw new Error('אימייל או סיסמה שגויים');
    if (res.status === 400 && json && json.error === 'recaptcha_failed') throw new Error('אימות reCAPTCHA נכשל');
    throw new Error(json.error || 'Login failed');
  };

  const register = async (name, email, password, recaptchaToken) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, recaptchaToken })
      });

      const json = await res.json().catch(() => ({}));
      
      if (res.ok && json.token) {
        setToken(json.token);
        localStorage.setItem('token', json.token);
        setUserId(json.user._id);
        setUserName(json.user.name);
        return true;
      }

      if (res.status === 409) {
        throw new Error('משתמש עם אימייל זה כבר קיים. התחבר/י או השתמש/י באימייל אחר');
      }
      
      if (res.status === 400 && json && json.error === 'recaptcha_failed') {
        throw new Error('אימות reCAPTCHA נכשל');
      }

      if (res.status === 500) {
        console.error('Server error:', json);
        throw new Error('שגיאת שרת. אנא נסה שוב מאוחר יותר.');
      }

      throw new Error(json.error || 'ההרשמה נכשלה. אנא נסה שוב.');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    setUserId('');
    setUserName('');
    localStorage.removeItem('userName');
  };

  return (
    <AuthContext.Provider value={{
      token,
      userName,
      userId,
      isAuthenticated: !!token,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
