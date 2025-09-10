import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function PromptForm({ onSubmit }) {
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [promptText, setPromptText] = useState(`תכין שיעור מבוא לאלגברה לכיתה ח'`);
  const { userName } = useAuth();
  const { categories, getFilteredSubcategories } = useData();

  const handleSubmit = (e) => {
    e.preventDefault();
    const category = categories.find(c => c._id === categoryId);
    const subCategory = getFilteredSubcategories(categoryId).find(s => s._id === subCategoryId);

    onSubmit({
      category: categoryId,
      subCategory: subCategoryId,
      prompt: promptText,
      meta: {
        userName: userName || 'מורה',
        categoryName: category?.name || '',
        subCategoryName: subCategory?.name || ''
      }
    });
  };

  const filteredSubcategories = getFilteredSubcategories(categoryId);

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        קטגוריה
        <select 
          value={categoryId} 
          onChange={e => setCategoryId(e.target.value)}
          required
        >
          <option value="">בחר קטגוריה</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </label>

      <label>
        תת-קטגוריה
        <select 
          value={subCategoryId} 
          onChange={e => setSubCategoryId(e.target.value)}
          required
        >
          <option value="">בחר תת-קטגוריה</option>
          {filteredSubcategories.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </label>

      <label>
        שאלה ל-AI
        <textarea 
          value={promptText} 
          onChange={e => setPromptText(e.target.value)}
          rows={4}
          required 
        />
      </label>

      <button type="submit" className="submit-button">
        שלח ל־AI
      </button>
    </form>
  );
}
