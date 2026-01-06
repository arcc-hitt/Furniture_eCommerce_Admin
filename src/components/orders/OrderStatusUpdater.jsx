// OrderStatusUpdater Component
// Handles updating order status with validation and confirmation

import React, { useState } from 'react';
import { updateOrderStatus } from '../../services/orderService';

const OrderStatusUpdater = ({ currentStatus, orderId, onStatusUpdate, disabled = false }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const statusOptions = [
    { value: 'placed', label: 'Placed', color: 'text-yellow-600' },
    { value: 'shipped', label: 'Shipped', color: 'text-blue-600' },
    { value: 'delivered', label: 'Delivered', color: 'text-green-600' },
    { value: 'canceled', label: 'Canceled', color: 'text-red-600' }
  ];

  const getStatusFlow = (current) => {
    switch (current) {
      case 'placed':
        return ['shipped', 'canceled'];
      case 'shipped':
        return ['delivered', 'canceled'];
      case 'delivered':
        return []; // No further status changes allowed
      case 'canceled':
        return []; // No further status changes allowed
      default:
        return [];
    }
  };

  const availableStatuses = getStatusFlow(currentStatus);

  const handleStatusChange = (newStatus) => {
    if (newStatus === currentStatus) return;
    
    // Show confirmation for critical status changes
    if (newStatus === 'canceled' || newStatus === 'delivered') {
      setPendingStatus(newStatus);
      setShowConfirmation(true);
    } else {
      updateStatus(newStatus);
    }
  };

  const updateStatus = async (newStatus) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      onStatusUpdate(updatedOrder);
      setShowConfirmation(false);
      setPendingStatus(null);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmStatusChange = () => {
    if (pendingStatus) {
      updateStatus(pendingStatus);
    }
  };

  const cancelStatusChange = () => {
    setShowConfirmation(false);
    setPendingStatus(null);
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'text-gray-600';
  };

  if (availableStatuses.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Status:</span>
        <span className={`text-sm font-medium ${getStatusColor(currentStatus)}`}>
          {getStatusLabel(currentStatus)}
        </span>
        <span className="text-xs text-gray-500">(Final)</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Current Status and Update Options */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`text-sm font-medium ${getStatusColor(currentStatus)}`}>
            {getStatusLabel(currentStatus)}
          </span>
        </div>

        {!showConfirmation && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Update to:</span>
            <div className="flex gap-2">
              {availableStatuses.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={disabled || isUpdating}
                  className={`px-3 py-1 text-sm font-medium rounded-lg border transition-colors ${
                    status === 'canceled'
                      ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                      : status === 'delivered'
                      ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
                      : 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isUpdating ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    getStatusLabel(status)
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && pendingStatus && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800">
                Confirm Status Change
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Are you sure you want to change the order status to "{getStatusLabel(pendingStatus)}"?
                {pendingStatus === 'canceled' && ' This action cannot be undone.'}
                {pendingStatus === 'delivered' && ' This will mark the order as complete.'}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={confirmStatusChange}
                  disabled={isUpdating}
                  className="px-3 py-1 text-sm font-medium text-white bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Confirm'}
                </button>
                <button
                  onClick={cancelStatusChange}
                  disabled={isUpdating}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-600">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusUpdater;