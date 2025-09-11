import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function PromptForm({ categories = [], subcategories = [], onSubmit }) {
  const [categoryId, setCategoryId] = useState(categories[0]?._id || '');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [promptText, setPromptText] = useState(`תכין שיעור מבוא לאלגברה לכיתה ח'`);

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

  const { isAuthenticated } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return alert('נא להתחבר למערכת תחילה');
    onSubmit({ category: categoryId, subCategory: subCategoryId, prompt: promptText });
  };

  const filteredSubs = subcategories.filter(s => {
    if (!s.category) return true;
    return String(s.category) === String(categoryId) || (s.category._id && String(s.category._id) === String(categoryId));
  });

  return (
    <div className="prompt-form">
      <div className="form-header">
        <h2>יצירת שיעור חדש</h2>
        <p>בחר קטגוריה ותת-קטגוריה, והקלד את השאלה שלך</p>
      </div>
      
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-grid">
          <div className="form-group">
            <label className="label-text">
              קטגוריה
              <select 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)} 
                required
                className="select-styled"
              >
                <option value="">בחר קטגוריה</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </label>
          </div>

          <div className="form-group">
            <label className="label-text">
              תת-קטגוריה
              <select 
                value={subCategoryId} 
                onChange={e => setSubCategoryId(e.target.value)} 
                required
                className="select-styled"
                disabled={!categoryId}
              >
                <option value="">בחר תת-קטגוריה</option>
                {filteredSubs.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </label>
          </div>

          <div className="form-group full-width">
            <label className="label-text">
              שאלה ל-AI
              <textarea 
                value={promptText} 
                onChange={e => setPromptText(e.target.value)} 
                rows={4} 
                required
                placeholder="תאר את הנושא שברצונך ללמוד או שאל שאלה ספציפית..."
                className="textarea-styled"
              />
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={!isAuthenticated}>
            {isAuthenticated ? 'צור שיעור חדש' : 'נא להתחבר תחילה'}
          </button>
        </div>
      </form>
    </div>
  );
}
