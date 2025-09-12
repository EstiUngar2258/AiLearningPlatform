import { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './LearningHistory.css';

// הגדרות marked עבור תמיכה בעברית
marked.setOptions({
  gfm: true,
  breaks: true,
  smartypants: true
});

export default function LearningHistory({ userId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('LearningHistory: userId changed:', userId);
    if (!userId) {
      console.log('LearningHistory: no userId provided');
      return;
    }
    
    const fetchHistory = async () => {
      try {
        setLoading(true);
        console.log('LearningHistory: fetching history for userId:', userId);
        const response = await fetch(`http://localhost:5000/api/prompts/user/${userId}`);

        if (!response.ok) {
          const txt = await response.text();
          console.error('API returned error', response.status, txt);
          throw new Error('שגיאה בשרת: ' + (txt || response.statusText));
        }

        const contentType = response.headers.get('content-type') || '';
        let data = [];
        if (contentType.includes('application/json')) {
          const txt = await response.text();
          try {
            data = JSON.parse(txt);
          } catch (e) {
            console.warn('Invalid JSON returned from API, falling back to empty array. Raw:', txt);
            data = [];
          }
        } else {
          // unexpected content type (HTML/text) - log and show friendly message
          const txt = await response.text();
          console.warn('Non-JSON response from history API:', txt);
          throw new Error('תשובת שרת לא תקינה');
        }

        setHistory(data.map(item => ({ ...item, displayResponse: item.displayResponse || item.response || item.rawResponse || '' })));
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load learning history');
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (loading) {
    return <div className="loading">טוען היסטוריית שיעורים...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (history.length === 0) {
    return <div className="no-history">אין עדיין היסטוריית שיעורים</div>;
  }

  return (
    <div className="learning-history">
      <h2>היסטוריית שיעורים</h2>
      <div className="history-items">
        {history.map((item) => (
          <div key={item._id} className="history-item">
            <div className="history-meta">
              <span className="category">
                {item.category?.name || 'ללא קטגוריה'}
              </span>
              {item.subCategory?.name && (
                <span className="subcategory">
                  {item.subCategory.name}
                </span>
              )}
              <span className="date" dir="rtl">
                {new Date(item.createdAt).toLocaleDateString('he-IL', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="history-content">
              <div className="history-prompt">
                <strong>שאלה:</strong> {item.prompt}
              </div>
              <div className="history-response">
                <strong>תשובה:</strong>
                <article className="lesson-article" dangerouslySetInnerHTML={{
                  __html: item.displayResponse
                    ? DOMPurify.sanitize(marked.parse(item.displayResponse))
                    : DOMPurify.sanitize('<p>לא נמצא תוכן</p>')
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
