import { useState } from 'react';

const ProductCard = ({ product, onEdit, onDelete, onUpdateQuantity }) => {
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [newQuantity, setNewQuantity] = useState(product.quantity);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleQuantityUpdate = async () => {
    if (newQuantity === product.quantity) return;
    
    try {
      setIsUpdatingQuantity(true);
      await onUpdateQuantity(product.id, parseInt(newQuantity));
    } catch (error) {
      console.error('Error updating quantity:', error);
      setNewQuantity(product.quantity); // Reset on error
    } finally {
      setIsUpdatingQuantity(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(product.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getStockStatus = () => {
    if (product.quantity === 0) {
      return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    } else if (product.quantity <= 5) {
      return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
    }
  };

  const stockStatus = getStockStatus();
  const primaryImage = product.images?.image1 || Object.values(product.images || {})[0];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Product Image */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
            {product.name}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
            {stockStatus.text}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center mb-3">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-gray-500 capitalize">
            {product.category?.replace(/-/g, ' ')}
          </span>
        </div>

        {/* Quantity Update */}
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm font-medium text-gray-700">Quantity:</label>
          <input
            type="number"
            min="0"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUpdatingQuantity}
          />
          {newQuantity != product.quantity && (
            <button
              onClick={handleQuantityUpdate}
              disabled={isUpdatingQuantity}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdatingQuantity ? 'Updating...' : 'Update'}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Product
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{product.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;