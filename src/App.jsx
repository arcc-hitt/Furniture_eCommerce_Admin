
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Placeholder components - will be implemented in later tasks
const Dashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
    <p>Welcome to the Furniture eCommerce Admin Panel</p>
  </div>
);

const Login = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Admin Login</h1>
    <p>Login form will be implemented in task 4</p>
  </div>
);

const Products = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Product Management</h1>
    <p>Product management will be implemented in tasks 5-6</p>
  </div>
);

const Orders = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Order Management</h1>
    <p>Order management will be implemented in task 7</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
