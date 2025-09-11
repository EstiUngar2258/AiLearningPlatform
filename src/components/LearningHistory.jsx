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
    if (!userId) return;
    
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/prompts/user/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        const data = await response.json();
        setHistory(data);
        setError(null);
      } catch (err) {
        setError('Failed to load learning history');
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
              <span className="date">
                {new Date(item.createdAt).toLocaleDateString('he-IL')}
              </span>
            </div>
            <div className="history-content">
              <div className="history-prompt">
                <strong>שאלה:</strong> {item.prompt}
              </div>
              <div className="history-response">
                <strong>תשובה:</strong>
                <article className="lesson-article" dangerouslySetInnerHTML={{
                  __html: item.response
                    ? DOMPurify.sanitize(marked.parse(item.response))
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
