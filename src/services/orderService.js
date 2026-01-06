// Order Service
// Handles all order-related operations with Firebase Realtime Database

import { database } from '../config/firebase';
import { ref, get, update, query, orderByChild, equalTo } from 'firebase/database';

/**
 * Order status validation
 * @param {string} status - Order status to validate
 * @returns {boolean} - Whether the status is valid
 */
export const isValidOrderStatus = (status) => {
  const validStatuses = ['placed', 'shipped', 'delivered', 'canceled'];
  return validStatuses.includes(status);
};

/**
 * Get all orders
 * @returns {Promise<Array>} - Array of all orders
 */
export const getAllOrders = async () => {
  try {
    const ordersRef = ref(database, 'orders');
    const snapshot = await get(ordersRef);
    
    if (snapshot.exists()) {
      const ordersData = snapshot.val();
      return Object.keys(ordersData).map(key => ({
        id: key,
        ...ordersData[key]
      })).sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object|null>} - Order data or null if not found
 */
export const getOrderById = async (orderId) => {
  try {
    const orderRef = ref(database, `orders/${orderId}`);
    const snapshot = await get(orderRef);
    
    if (snapshot.exists()) {
      return {
        id: orderId,
        ...snapshot.val()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

/**
 * Get orders by status
 * @param {string} status - Order status
 * @returns {Promise<Array>} - Array of orders with the specified status
 */
export const getOrdersByStatus = async (status) => {
  try {
    if (!isValidOrderStatus(status)) {
      throw new Error(`Invalid order status: ${status}`);
    }
    
    const ordersRef = ref(database, 'orders');
    const statusQuery = query(ordersRef, orderByChild('status'), equalTo(status));
    const snapshot = await get(statusQuery);
    
    if (snapshot.exists()) {
      const ordersData = snapshot.val();
      return Object.keys(ordersData).map(key => ({
        id: key,
        ...ordersData[key]
      })).sort((a, b) => b.createdAt - a.createdAt);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    throw error;
  }
};

/**
 * Get orders by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of orders for the specified user
 */
export const getOrdersByUserId = async (userId) => {
  try {
    const ordersRef = ref(database, 'orders');
    const userQuery = query(ordersRef, orderByChild('userId'), equalTo(userId));
    const snapshot = await get(userQuery);
    
    if (snapshot.exists()) {
      const ordersData = snapshot.val();
      return Object.keys(ordersData).map(key => ({
        id: key,
        ...ordersData[key]
      })).sort((a, b) => b.createdAt - a.createdAt);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching orders by user:', error);
    throw error;
  }
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} newStatus - New order status
 * @returns {Promise<Object>} - Updated order data
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    if (!isValidOrderStatus(newStatus)) {
      throw new Error(`Invalid order status: ${newStatus}`);
    }
    
    // Get current order to verify it exists
    const currentOrder = await getOrderById(orderId);
    if (!currentOrder) {
      throw new Error('Order not found');
    }
    
    const updateData = {
      status: newStatus,
      updatedAt: Date.now()
    };
    
    const orderRef = ref(database, `orders/${orderId}`);
    await update(orderRef, updateData);
    
    // Return updated order
    return await getOrderById(orderId);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Get order statistics
 * @returns {Promise<Object>} - Order statistics
 */
export const getOrderStatistics = async () => {
  try {
    const allOrders = await getAllOrders();
    
    const stats = {
      total: allOrders.length,
      placed: 0,
      shipped: 0,
      delivered: 0,
      canceled: 0,
      totalRevenue: 0
    };
    
    allOrders.forEach(order => {
      stats[order.status] = (stats[order.status] || 0) + 1;
      if (order.status !== 'canceled') {
        stats.totalRevenue += order.totalAmount || 0;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
};

/**
 * Search orders by customer name, email, or order ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} - Array of matching orders
 */
export const searchOrders = async (searchTerm) => {
  try {
    const allOrders = await getAllOrders();
    const searchTermLower = searchTerm.toLowerCase();
    
    return allOrders.filter(order => 
      order.id.toLowerCase().includes(searchTermLower) ||
      (order.deliveryAddress && order.deliveryAddress.name && 
       order.deliveryAddress.name.toLowerCase().includes(searchTermLower)) ||
      (order.deliveryAddress && order.deliveryAddress.phone && 
       order.deliveryAddress.phone.includes(searchTerm))
    );
  } catch (error) {
    console.error('Error searching orders:', error);
    throw error;
  }
};