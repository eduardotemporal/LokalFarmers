import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // To get user info

const FarmerDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Farmer Dashboard</h1>
      <p className="mb-6 text-lg text-gray-700">
        Welcome, {user?.name || 'Farmer'}! Manage your farm and products here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card for Managing Products */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3 text-green-700">Manage Products</h2>
          <p className="text-gray-600 mb-4">
            View, add, edit, or remove your product listings.
          </p>
          <Link
            to="/farmer/products"
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Go to My Products
          </Link>
        </div>

        {/* Placeholder Card 1 */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3 text-blue-700">View Orders (Coming Soon)</h2>
          <p className="text-gray-600 mb-4">
            Check orders placed for your products.
          </p>
           <button disabled className="inline-block bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded cursor-not-allowed">
             Feature Unavailable
           </button>
        </div>

         {/* Placeholder Card 2 */}
         <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3 text-purple-700">Farm Profile (Coming Soon)</h2>
          <p className="text-gray-600 mb-4">
            Update your farm details and information.
          </p>
           <button disabled className="inline-block bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded cursor-not-allowed">
             Feature Unavailable
           </button>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboardPage;
