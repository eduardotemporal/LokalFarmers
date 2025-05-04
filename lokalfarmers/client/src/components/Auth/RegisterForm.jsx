import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// No need for useAuth here unless logging in immediately after registration
// import { useAuth } from '../../contexts/AuthContext';
import { registerUser } from '../../services/api'; // Import the API function

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Optional: Add role selection if needed
  // const [role, setRole] = useState('Consumer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // For success message
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Include role in the userData if you have role selection
      const userData = { name, email, password /*, role */ };
      await registerUser(userData);
      setSuccess('Registration successful! Redirecting to login...');
      // Optionally clear form fields here
      setTimeout(() => {
        navigate('/login'); // Redirect to login page after a short delay
      }, 2000); // Wait 2 seconds before redirecting

    } catch (err) {
      // Handle errors from API (e.g., user already exists)
      const errorMessage = err.errors && err.errors.length > 0
                           ? err.errors[0].msg // Display specific error from backend validation
                           : (err.message || 'Registration failed. Please try again.');
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          id="name" name="name" type="text" required value={name}
          onChange={(e) => setName(e.target.value)} disabled={loading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email" name="email" type="email" autoComplete="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} disabled={loading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password" name="password" type="password" required minLength="6" value={password}
          onChange={(e) => setPassword(e.target.value)} disabled={loading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

       {/* Optional Role Selection Example
       <div>
         <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
         <select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
           <option value="Consumer">Consumer</option>
           <option value="Farmer">Farmer</option>
         </select>
       </div>
       */}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
