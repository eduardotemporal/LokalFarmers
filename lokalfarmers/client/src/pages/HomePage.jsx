import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

const HomePage = () => {
  const { user, logout } = useAuth(); // Get user info and logout function from context

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to LokalFarmers!</h1>
      {user ? (
        <div>
          <p className="mb-2">You are logged in as: <span className="font-semibold">{user.id}</span></p>
          <p className="mb-4">Your role: <span className="font-semibold">{user.role}</span></p>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Please log in or register.</p> // Should not be reachable if ProtectedRoute works
      )}
      {/* Add more content for the homepage here */}
    </div>
  );
};

export default HomePage;
