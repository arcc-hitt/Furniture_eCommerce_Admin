// OrderCard Component
// Displays individual order information with status controls

import React, { useState } from 'react';
import OrderStatusUpdater from './OrderStatusUpdater';
import OrderDetails from './OrderDetails';

const OrderCard = ({ order, onOrderUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getItemCount = (items) => {
    if (!items) return 0;
    return Object.values(items).reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      // The OrderStatusUpdater will handle the actual update
      // and call onOrderUpdate when successful
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Order Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Order Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Order #{order.id.slice(-8).toUpperCase()}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Customer:</span> {order.deliveryAddress?.name || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {order.deliveryAddress?.phone || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Date:</span> {formatDate(order.createdAt)}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              ₹{order.totalAmount?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-600">
              {getItemCount(order.items)} item(s)
            </div>
          </div>
        </div>
      </div>

      {/* Order Actions */}
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Status Updater */}
          <div className="flex-1">
            <OrderStatusUpdater
              currentStatus={order.status}
              orderId={order.id}
              onStatusUpdate={(updatedOrder) => {
                onOrderUpdate(updatedOrder);
                setIsUpdating(false);
              }}
              disabled={isUpdating}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </button>
          </div>
        </div>
      </div>

      {/* Order Details (Expandable) */}
      {showDetails && (
        <div className="border-t border-gray-200">
          <OrderDetails order={order} />
        </div>
      )}
    </div>
  );
};

export default OrderCard;