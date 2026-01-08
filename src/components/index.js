// Components index file
// This file will export all components for easy importing

// Authentication components
export { default as AdminLogin } from './auth/AdminLogin';
export { default as ProtectedRoute } from './auth/ProtectedRoute';

// Category management components
export { default as CategoryList } from './categories/CategoryList';
export { default as CategoryForm } from './categories/CategoryForm';
export { default as CategoryCard } from './categories/CategoryCard';

// Product management components
export { default as ProductList } from './products/ProductList';
export { default as ProductForm } from './products/ProductForm';
export { default as ProductCard } from './products/ProductCard';
export { default as CategorySelector } from './products/CategorySelector';

// Order management components
export { default as OrderList } from './orders/OrderList';
export { default as OrderCard } from './orders/OrderCard';
export { default as OrderStatusUpdater } from './orders/OrderStatusUpdater';
export { default as OrderDetails } from './orders/OrderDetails';

// Layout components
export { default as Layout } from './layout/Layout';
export { default as Header } from './layout/Header';

export default {};