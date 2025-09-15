import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './styles/App.css';
import './styles/result.css';
import './components/history/HistoryResponse.css';
import Navbar from './components/common/Navbar.jsx';
import HomePage from './components/common/HomePage.jsx';
import PromptForm from './components/prompt/PromptForm.jsx';
import AuthForms from './components/auth/AuthForms.jsx';
import LearningHistory from './components/history/LearningHistory.jsx';
import PrivateRoute from './components/auth/PrivateRoute';
import { useAuth } from './providers/AuthProvider';
import WelcomeBanner from './components/common/WelcomeBanner';

function App() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [result, setResult] = useState(null);
  const [errorBanner, setErrorBanner] = useState('');
  const { user, token } = useAuth();

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
      if (!user) {
        setErrorBanner('יש להתחבר למערכת תחילה');
        return;
      }
      
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/prompts', { 
        method: 'POST', 
        headers: { 
          ...headers,
          ...authHeaders
        },
        body: JSON.stringify({ 
          category, 
          subCategory, 
          prompt,
          user: user?._id,
          meta: {
            categoryName: selectedCategory?.name,
            subCategoryName: selectedSubCategory?.name
          }
        }) 
      });

      if (!res.ok) {
        const err = await res.json();
        
        // טיפול בשגיאות ספציפיות
        switch (err.error) {
          case 'OPENAI_API_KEY_INVALID':
            setErrorBanner('מפתח ה‑OpenAI לא תקין. אנא פנה למנהל המערכת.');
            return;
          case 'AUTH_REQUIRED':
            setErrorBanner('יש להתחבר למערכת כדי ליצור שיעור חדש');
            return;
          case 'OPENAI_ERROR':
            if (err.message.includes('Rate limit')) {
              setErrorBanner('המערכת עמוסה כרגע. אנא נסה שוב בעוד מספר דקות.');
            } else {
              setErrorBanner(`שגיאה בשירות AI: ${err.message}`);
            }
            return;
          default:
            setErrorBanner(err.message || `שגיאה בשרת: ${res.status}`);
            return;
        }
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setErrorBanner('שגיאה בקשת הרשת: ' + err.message);
    }
  }

  return (
    <div className="app">
      <Navbar />
      <WelcomeBanner />
      
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
            <PrivateRoute>
              <div className="main-section">
                <PromptForm
                  categories={categories}
                  subcategories={subcategories}
                  onSubmit={handlePromptSubmit}
                />
                {result && (
                  <div className="result">
                    <div className="history-response-wrapper">
                      {result.parsedResponse ? (
                        <div className="parsed-response">
                          <div className="response-title">
                            <h3>{result.parsedResponse.title}</h3>
                          </div>
                          <div className="response-content">
                            <div className="lesson-section">
                              <h4>תוכן השיעור:</h4>
                              <div className="lesson-text">{result.parsedResponse.lesson}</div>
                            </div>
                            
                            {result.parsedResponse.steps?.length > 0 && (
                              <div className="steps-section">
                                <h4>שלבי הלמידה:</h4>
                                <ol>
                                  {result.parsedResponse.steps.map((step, i) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}
                            
                            {result.parsedResponse.examples?.length > 0 && (
                              <div className="examples-section">
                                <h4>דוגמאות:</h4>
                                <ul>
                                  {result.parsedResponse.examples.map((example, i) => (
                                    <li key={i}>{example}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {result.parsedResponse.exercises?.length > 0 && (
                              <div className="exercises-section">
                                <h4>תרגילים מומלצים:</h4>
                                <ul>
                                  {result.parsedResponse.exercises.map((exercise, i) => (
                                    <li key={i}>{exercise}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {result.parsedResponse.summary && (
                              <div className="summary-section">
                                <h4>סיכום:</h4>
                                <p>{result.parsedResponse.summary}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="raw-response">
                          <pre>{result.response || JSON.stringify(result, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </PrivateRoute>
          } />
          
          <Route path="/history" element={
            <PrivateRoute>
              <LearningHistory userId={user?._id} token={token} />
            </PrivateRoute>
          } />
        </Routes>
      </div>
  );
}

export default App;