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
    <form onSubmit={handleSubmit} className="form">
      <label>
        קטגוריה
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
          <option value="">בחר קטגוריה</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </label>

      <label>
        תת-קטגוריה
        <select value={subCategoryId} onChange={e => setSubCategoryId(e.target.value)} required>
          <option value="">בחר תת-קטגוריה</option>
          {filteredSubs.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </label>

      <label>
        שאלה ל-AI
        <textarea value={promptText} onChange={e => setPromptText(e.target.value)} rows={4} required />
      </label>

      <button type="submit" className="submit-button">שלח ל־AI</button>
    </form>
  );
}
