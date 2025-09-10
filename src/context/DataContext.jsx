import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/subcategories').then(r => r.json())
      ]);
      setCategories(categoriesRes);
      setSubcategories(subcategoriesRes);
    } catch (err) {
      setError('Failed to load data');
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSubcategories = (categoryId) => {
    return subcategories.filter(s => 
      !s.category || 
      s.category === categoryId || 
      s.category?._id === categoryId
    );
  };

  return (
    <DataContext.Provider value={{
      categories,
      subcategories,
      loading,
      error,
      getFilteredSubcategories,
      refreshData: fetchData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
