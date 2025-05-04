import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductListPage from './pages/ProductListPage'; // Import Product List Page
import ProductDetailPage from './pages/ProductDetailPage'; // Import Product Detail Page
import ProtectedRoute from './utils/ProtectedRoute'; // Import ProtectedRoute

// Farmer Pages
import FarmerDashboardPage from './pages/Farmer/FarmerDashboardPage';
import ManageProductsPage from './pages/Farmer/ManageProductsPage';
import AddProductPage from './pages/Farmer/AddProductPage';
import EditProductPage from './pages/Farmer/EditProductPage';


// Simple Navbar for navigation demonstration
function Navbar() {
  const { isAuthenticated, user, logout } = useAuth(); // Add 'user' to get role info

  return (
    <nav className="bg-green-600 text-white p-4 mb-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-green-200">LokalFarmers</Link>
        <div className="flex items-center space-x-4">
          {/* Always show Home link */}
          <Link to="/" className="hover:text-green-200">Home</Link>

          {/* Conditionally show Farmer links */}
          {isAuthenticated && user?.role === 'Farmer' && (
            <>
              <Link to="/farmer/dashboard" className="hover:text-green-200">Dashboard</Link>
              <Link to="/farmer/products" className="hover:text-green-200">My Products</Link>
            </>
          )}

           {/* Conditionally show Consumer links (placeholder) */}
           {isAuthenticated && user?.role === 'Consumer' && (
            <>
              {/* <Link to="/browse" className="hover:text-green-200">Browse</Link> */}
              {/* <Link to="/orders" className="hover:text-green-200">My Orders</Link> */}
            </>
          )}

          {/* Auth links */}
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="hover:text-green-200">Login</Link>
              <Link to="/register" className="hover:text-green-200">Register</Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
            >
              Logout ({user?.role}) {/* Optionally show role */}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

// Component to handle redirection for already authenticated users trying to access login/register
function PublicRouteRedirect() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>; // Or a loading spinner
    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}


function AppContent() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductListPage />} /> {/* Product Listing */}
        <Route path="/products/:productId" element={<ProductDetailPage />} /> {/* Product Detail */}

        {/* --- Protected Routes --- */}

        {/* General Protected Routes (Any logged-in user) */}
        {/* NOTE: Changed HomePage route from "/" to avoid conflict with farmer/consumer specific dashboards potentially */}
        <Route element={<ProtectedRoute />}>
           <Route path="/home" element={<HomePage />} /> {/* Renamed path */}
          {/* Add other general protected routes here */}
          {/* e.g., <Route path="/profile" element={<ProfilePage />} /> */}
        </Route>

        {/* Farmer Specific Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Farmer']} />}>
          <Route path="/farmer/dashboard" element={<FarmerDashboardPage />} />
          <Route path="/farmer/products" element={<ManageProductsPage />} />
          <Route path="/farmer/products/new" element={<AddProductPage />} />
          <Route path="/farmer/products/edit/:productId" element={<EditProductPage />} />
          {/* Add other farmer-specific routes here */}
        </Route>

        {/* Optional: Fallback route for 404 */}
        {/* Redirect base path "/" to "/products" for browsing */}
        <Route path="/" element={<Navigate to="/products" replace />} />

        {/* Fallback route for 404 */}
        <Route path="*" element={
          <div className="text-center mt-10">
            <h1 className="text-2xl font-bold">404 - Not Found</h1>
            <p>Sorry, the page you are looking for does not exist.</p>
            <Link to="/products" className="text-blue-500 hover:underline mt-4 inline-block">Browse Products</Link>
          </div>
        } />
      </Routes>
    </Router>
  );
}


// Main App component wraps everything in the AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
