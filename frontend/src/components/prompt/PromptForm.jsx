import { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';

export default function PromptForm({ categories = [], subcategories = [], onSubmit, loading = false }) {
  const [categoryId, setCategoryId] = useState(categories[0]?._id || '');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [promptText, setPromptText] = useState(`תכין שיעור מבוא לאלגברה לכיתה ח'`);
  const [formError, setFormError] = useState('');
  const { user: currentUser } = useAuth();
  
  useEffect(() => {
    // Show welcome message when component mounts
    if (currentUser?.name) {
      setFormError(''); // Clear any previous errors
    }
  }, [currentUser]);

  useEffect(() => {
    if (categories.length && !categoryId) setCategoryId(categories[0]._id);
  }, [categories]);

  useEffect(() => {
    // set default subcategory when category changes
    const subs = subcategories.filter(s => {
      if (!s.category) return false;
      return String(s.category) === String(categoryId) || (s.category._id && String(s.category._id) === String(categoryId));
    });
    setSubCategoryId(subs[0]?._id || '');
  }, [categoryId, subcategories]);

  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validation
    if (!currentUser) {
      setFormError('נא להתחבר למערכת תחילה');
      return;
    }

    if (!categoryId) {
      setFormError('נא לבחור קטגוריה');
      return;
    }

    if (!subCategoryId) {
      setFormError('נא לבחור תת-קטגוריה');
      return;
    }

    if (!promptText.trim()) {
      setFormError('נא להזין טקסט לשאלה');
      return;
    }

    if (promptText.trim().length < 10) {
      setFormError('נא להזין טקסט באורך של לפחות 10 תווים');
      return;
    }

    try {
      onSubmit({ 
        category: categoryId, 
        subCategory: subCategoryId, 
        prompt: promptText.trim() 
      });
    } catch (err) {
      setFormError(err.message || 'אירעה שגיאה בשליחת הבקשה');
    }
  };

  const filteredSubs = subcategories.filter(s => {
    if (!s.category) return true;
    return String(s.category) === String(categoryId) || (s.category._id && String(s.category._id) === String(categoryId));
  });

  return (
    <div className="prompt-form">
      <div className="form-header">
        <h2>יצירת שיעור חדש</h2>
        <p>בחר נושא וכתוב שאלה או בקשה ל-AI</p>
      </div>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-grid">
          <div className="form-group">
            <label>
              קטגוריה
              <select 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)} 
                required
                disabled={loading}
              >
                <option value="">בחר קטגוריה</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </label>
          </div>

          <div className="form-group">
            <label>
              תת-קטגוריה
              <select 
                value={subCategoryId} 
                onChange={e => setSubCategoryId(e.target.value)} 
                required
                disabled={loading}
              >
                <option value="">בחר תת-קטגוריה</option>
                {filteredSubs.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </label>
          </div>

          <div className="form-group full-width">
            <label>
              שאלה ל-AI
              <textarea 
                value={promptText} 
                onChange={e => setPromptText(e.target.value)} 
                rows={6} 
                required
                disabled={loading}
                placeholder="תאר את הנושא שברצונך ללמוד או שאל שאלה ספציפית..."
              />
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          className={`submit-button ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'שולח בקשה...' : 'שלח ל־AI'}
        </button>
      </form>
    </div>
  );
}
