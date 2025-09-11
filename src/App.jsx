import { useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import PromptForm from './components/PromptForm';
import AuthForms from './components/AuthForms';
import LearningHistory from './components/LearningHistory';
import { AuthContext } from './context/AuthContext';

function App() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [result, setResult] = useState(null);
  const [errorBanner, setErrorBanner] = useState('');
  const { userId, userName, token } = useContext(AuthContext);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(data));

    fetch('/api/subcategories')
      .then(r => r.json())
      .then(data => setSubcategories(data));
  }, []);

  // called by PromptForm
  async function handlePromptSubmit({ category, subCategory, prompt }) {
    setErrorBanner('');
    setResult(null);
    try {
      const headers = { 'Content-Type': 'application/json' };

      // מוסיף את המידע על הקטגוריות
      const selectedCategory = categories.find(c => c._id === category);
      const selectedSubCategory = subcategories.find(s => s._id === subCategory);

      // בודק אם המשתמש מחובר
      if (!userId || !token) {
        setErrorBanner('יש להתחבר למערכת תחילה');
        return;
      }
      
      const res = await fetch('/api/prompts', { 
        method: 'POST', 
        headers: { 
          ...headers,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          category, 
          subCategory, 
          prompt,
          user: userId,
          meta: {
            userName,
            categoryName: selectedCategory?.name,
            subCategoryName: selectedSubCategory?.name
          }
        }) 
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.error === 'OPENAI_API_KEY_INVALID') {
          setErrorBanner('מפתח ה‑OpenAI לא תקין. עדכן את OPENAI_API_KEY בשרת.');
          return;
        }
        if (err.error === 'AUTH_REQUIRED') {
          setErrorBanner('יש להתחבר למערכת כדי ליצור שיעור חדש');
          return;
        }
        setErrorBanner(err.message || `שגיאה בשרת: ${res.status}`);
        return;
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
    <Router>
      <div className="app">
        <Navbar />
        
        {errorBanner && (
          <div className="error-banner">{errorBanner}</div>
        )}

        <Routes>
          <Route path="/" element={<HomePage />} />
          
          <Route path="/login" element={
            <div className="auth-center">
              <div className="recaptcha-note">reCAPTCHA לא מוגדר</div>
              <AuthForms onRecaptchaToken={async () => null} />
            </div>
          } />
          
          <Route path="/register" element={
            <div className="auth-center">
              <div className="recaptcha-note">reCAPTCHA לא מוגדר</div>
              <AuthForms onRecaptchaToken={async () => null} />
            </div>
          } />
          
          <Route path="/prompts" element={
            <div className="main-section">
              <PromptForm
                categories={categories}
                subcategories={subcategories}
                onSubmit={handlePromptSubmit}
              />
              {result && (
                <div className="result">
                  <h2>Response</h2>
                  <pre>{JSON.stringify(result.parsedResponse || result, null, 2)}</pre>
                </div>
              )}
            </div>
          } />
          
          <Route path="/history" element={<LearningHistory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;