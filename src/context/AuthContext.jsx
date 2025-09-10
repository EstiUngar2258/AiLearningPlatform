import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

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
    const json = await res.json();
    if (json.token) {
      setToken(json.token);
      localStorage.setItem('token', json.token);
      setUserId(json.user._id);
      setUserName(json.user.name);
      return true;
    }
    throw new Error(json.error || 'Login failed');
  };

  const register = async (name, email, password, recaptchaToken) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, recaptchaToken })
    });
    const json = await res.json();
    if (json.token) {
      setToken(json.token);
      localStorage.setItem('token', json.token);
      setUserId(json.user._id);
      setUserName(json.user.name);
      return true;
    }
    throw new Error(json.error || 'Registration failed');
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
