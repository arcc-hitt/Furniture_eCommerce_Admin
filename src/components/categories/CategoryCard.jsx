import { useState } from 'react';
import { deleteCategory } from '../../services/categoryService';

const CategoryCard = ({ category, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      await deleteCategory(category.id);
      onDelete(category.id);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              <code className="bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(category)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Edit category"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting || (category.productCount > 0)}
              title={category.productCount > 0 ? 'Cannot delete category with products' : 'Delete category'}
              className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>

        {/* Error */}
        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{category.productCount || 0}</p>
              <p className="text-xs text-gray-600">
                {(category.productCount || 0) === 1 ? 'Product' : 'Products'}
              </p>
            </div>
          </div>
          {category.productCount > 0 && (
            <p className="text-xs text-gray-500 italic">Contains products - cannot delete</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
