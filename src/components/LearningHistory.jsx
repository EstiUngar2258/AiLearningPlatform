import { useState, useEffect } from 'react';
import './LearningHistory.css';

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
                {item.parsedResponse ? (
                  <div className="parsed-response">
                    <h3>{item.parsedResponse.title}</h3>
                    <div className="lesson">{item.parsedResponse.lesson}</div>
                    {item.parsedResponse.steps?.length > 0 && (
                      <div className="steps">
                        <h4>שלבים:</h4>
                        <ol>
                          {item.parsedResponse.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {item.parsedResponse.examples?.length > 0 && (
                      <div className="examples">
                        <h4>דוגמאות:</h4>
                        <ul>
                          {item.parsedResponse.examples.map((example, i) => (
                            <li key={i}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.parsedResponse.exercises?.length > 0 && (
                      <div className="exercises">
                        <h4>תרגילים:</h4>
                        <ul>
                          {item.parsedResponse.exercises.map((exercise, i) => (
                            <li key={i}>{exercise}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.parsedResponse.summary && (
                      <div className="summary">
                        <h4>סיכום:</h4>
                        <p>{item.parsedResponse.summary}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <pre>{item.response}</pre>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
