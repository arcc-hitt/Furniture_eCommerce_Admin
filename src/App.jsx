
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminLogin, ProtectedRoute, Layout } from './components';
import './index.css';

// Dashboard component - protected route
const Dashboard = () => (
  <Layout>
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome to the Furniture eCommerce Admin Panel</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900">Products</h3>
          <p className="text-blue-700 mt-2">Manage your furniture inventory</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-900">Orders</h3>
          <p className="text-green-700 mt-2">Track and manage customer orders</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-purple-900">Analytics</h3>
          <p className="text-purple-700 mt-2">View sales and performance metrics</p>
        </div>
      </div>
    </div>
  </Layout>
);

// Products component - protected route
const Products = () => (
  <Layout>
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Management</h1>
      <p className="text-gray-600">Product management will be implemented in tasks 5-6</p>
    </div>
  </Layout>
);

// Orders component - protected route
const Orders = () => (
  <Layout>
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Management</h1>
      <p className="text-gray-600">Order management will be implemented in task 7</p>
    </div>
  </Layout>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
