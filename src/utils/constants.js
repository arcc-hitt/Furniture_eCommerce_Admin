// Application constants

// Order status constants
export const ORDER_STATUS = {
  PLACED: 'placed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELED: 'canceled'
};

// Product categories
export const PRODUCT_CATEGORIES = {
  ONE_DOOR_WARDROBE: '1-door-wardrobe',
  TWO_DOOR_WARDROBE: '2-door-wardrobe',
  SLIDING_WARDROBE: 'sliding-wardrobe'
};

// Category display names
export const CATEGORY_NAMES = {
  [PRODUCT_CATEGORIES.ONE_DOOR_WARDROBE]: '1 Door Wardrobe',
  [PRODUCT_CATEGORIES.TWO_DOOR_WARDROBE]: '2 Door Wardrobe',
  [PRODUCT_CATEGORIES.SLIDING_WARDROBE]: 'Sliding Wardrobe'
};

// Payment methods
export const PAYMENT_METHODS = {
  COD: 'cod'
};

// Firebase collection names
export const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  USERS: 'users',
  CATEGORIES: 'categories'
};

// Admin routes
export const ADMIN_ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  PRODUCTS: '/products',
  ORDERS: '/orders'
};