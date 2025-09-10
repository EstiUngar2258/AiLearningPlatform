import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import './App.css';
import PromptForm from './components/PromptForm';
import AuthForms from './components/AuthForms';
import LearningHistory from './components/LearningHistory';

function App() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState(null);
  const [errorBanner, setErrorBanner] = useState('');
  const { token, userName, userId: authUserId, isAuthenticated } = useAuth();

  // sync userId with auth context when available
  useEffect(() => {
    if (authUserId) setUserId(authUserId);
  }, [authUserId]);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(data));

    fetch('/api/subcategories')
      .then(r => r.json())
      .then(data => setSubcategories(data));

    fetch('/api/users')
      .then(r => r.json())
      .then(data => { if (data[0]) setUserId(data[0]._id); });
  }, []);

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

  function handleLogout() {
    setToken('');
    localStorage.removeItem('token');
    setUserId('');
    setUserName('');
    localStorage.removeItem('userName');
  }

  // called by PromptForm
  async function handlePromptSubmit({ category, subCategory, prompt }) {
    setErrorBanner('');
    setResult(null);
    if (!userId) {
      setErrorBanner('אין משתמש נבחר. ודא שיש משתמש במערכת.');
      return;
    }
    try {
      const body = { user: userId, category, subCategory, prompt, meta: { userName: userName || 'משתמש' } };
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/prompts', { method: 'POST', headers, body: JSON.stringify(body) });
      if (res.status === 400) {
        const err = await res.json();
        if (err && err.error === 'OPENAI_API_KEY_INVALID') {
          setErrorBanner('מפתח ה‑OpenAI לא תקין. עדכן את OPENAI_API_KEY בשרת.');
          return;
        }
      }
      if (!res.ok) {
        const text = await res.text();
        setErrorBanner(`שגיאה בשרת: ${res.status} ${text}`);
        return;
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setErrorBanner('שגיאה בקשת הרשת: ' + err.message);
    }
  }

  return (
    <div className="app">
      <h1>AI Learning — Demo</h1>

      {errorBanner && (
        <div className="error-banner">{errorBanner}</div>
      )}

      {!isAuthenticated ? (
        <div className="auth-center">
          <div className="recaptcha-note">reCAPTCHA לא מוגדר</div>
          <AuthForms onRecaptchaToken={async () => null} />
        </div>
      ) : (
        <div className="app-main">
          <div className="top-row">
            <div className="user-info">מחובר כ: <strong>{userName || 'משתמש'}</strong></div>
            <div><button className="btn-logout" onClick={handleLogout}>התנתק</button></div>
          </div>

          <div className="main-section">
            <PromptForm
              categories={categories}
              subcategories={subcategories}
              userId={userId}
              onSubmit={handlePromptSubmit}
            />

            {result && (
              <div className="result">
                <h2>Response</h2>
                <pre>{JSON.stringify(result.parsedResponse || result, null, 2)}</pre>
              </div>
            )}

            <LearningHistory userId={userId} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;