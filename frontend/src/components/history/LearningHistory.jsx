import { useState, useEffect } from 'react';
import './LearningHistory.css';
import './HistoryResponse.css';

export default function LearningHistory({ userId, token }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(`/api/prompts/user/${userId}`, { headers });
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
                <div className="history-response-wrapper">
                  {item.parsedResponse ? (
                    <div className="parsed-response">
                      <div className="response-title">
                        <h3>{item.parsedResponse.title}</h3>
                      </div>
                      <div className="response-content">
                        <div className="lesson-section">
                          <h4>תוכן השיעור:</h4>
                          <div className="lesson-text">{item.parsedResponse.lesson}</div>
                        </div>
                        
                        {item.parsedResponse.steps?.length > 0 && (
                          <div className="steps-section">
                            <h4>שלבי הלמידה:</h4>
                            <ol>
                              {item.parsedResponse.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                        
                        {item.parsedResponse.examples?.length > 0 && (
                          <div className="examples-section">
                            <h4>דוגמאות:</h4>
                            <ul>
                              {item.parsedResponse.examples.map((example, i) => (
                                <li key={i}>{example}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {item.parsedResponse.exercises?.length > 0 && (
                          <div className="exercises-section">
                            <h4>תרגילים מומלצים:</h4>
                            <ul>
                              {item.parsedResponse.exercises.map((exercise, i) => (
                                <li key={i}>{exercise}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {item.parsedResponse.summary && (
                          <div className="summary-section">
                            <h4>סיכום:</h4>
                            <p>{item.parsedResponse.summary}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="raw-response">
                      <pre>{item.response}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
