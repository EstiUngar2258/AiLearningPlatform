import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LearningHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;
    
    fetchHistory();
  }, [userId]);

  async function fetchHistory() {
    try {
      setLoading(true);
      const res = await fetch(`/api/prompts/user/${userId}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
       } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>טוען היסטוריה...</div>;

  return (
    <div className="learning-history">
      <h2>היסטוריית למידה</h2>
      {history.length === 0 ? (
        <p>אין עדיין היסטוריית למידה</p>
         ) : (
        <div className="history-items">
          {history.map(item => (
            <div key={item._id} className="history-item">
              <div className="history-meta">
                <span className="category">{item.category?.name}</span>
                <span className="subcategory">{item.subCategory?.name}</span>
                <span className="date">
                  {new Date(item.createdAt).toLocaleDateString('he-IL')}
                </span>
              </div>
              <div className="history-prompt">{item.prompt}</div>
              <div className="history-response">{item.response}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}