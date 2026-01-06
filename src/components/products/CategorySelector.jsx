import { useState, useEffect } from 'react';
import { getAllCategories } from '../../services/categoryService';

const CategorySelector = ({ value, onChange, required = false, className = '' }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category {required && <span className="text-red-500">*</span>}
        </label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category {required && <span className="text-red-500">*</span>}
        </label>
        <div className="text-red-600 text-sm">{error}</div>
        <button
          onClick={loadCategories}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Category {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name} ({category.productCount || 0} products)
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategorySelector;