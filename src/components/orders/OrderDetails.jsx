// OrderDetails Component
// Displays detailed order information including items and delivery address

import React from 'react';

const OrderDetails = ({ order }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getOrderItems = () => {
    if (!order.items) return [];
    return Object.values(order.items);
  };

  const calculateSubtotal = () => {
    const items = getOrderItems();
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const orderItems = getOrderItems();
  const subtotal = calculateSubtotal();

  return (
    <div className="p-6 space-y-6">
      {/* Order Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium capitalize">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">Cash on Delivery (COD)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-medium">{formatDate(order.createdAt)}</span>
            </div>
            {order.updatedAt && order.updatedAt !== order.createdAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">{formatDate(order.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
          {order.deliveryAddress ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="font-medium text-gray-900">
                  {order.deliveryAddress.name}
                </div>
                <div className="text-gray-600">
                  {order.deliveryAddress.phone}
                </div>
                <div className="text-gray-600">
                  {order.deliveryAddress.address}
                </div>
                <div className="text-gray-600">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}
                </div>
                <div className="text-gray-600">
                  PIN: {order.deliveryAddress.pincode}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic">No delivery address provided</div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
        {orderItems.length > 0 ? (
          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.productName}</h4>
                  <div className="text-sm text-gray-600">
                    Product ID: {item.productId}
                  </div>
                </div>

                {/* Quantity and Price */}
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ₹{item.price?.toLocaleString()} × {item.quantity}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total: ₹{(item.price * item.quantity)?.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Total Amount:</span>
                  <span>₹{order.totalAmount?.toLocaleString() || subtotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 italic">No items found in this order</div>
        )}
      </div>

      {/* Additional Notes */}
      {order.notes && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{order.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;