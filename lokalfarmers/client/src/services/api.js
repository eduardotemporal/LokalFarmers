import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Use environment variable or default
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
// Add a request interceptor to include the token in the headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lokalFarmersToken'); // Retrieve the token from local storage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- API Functions ---

/**
 * Registers a new user.
 * @param {object} userData - The user data (name, email, password, role?).
 * @returns {Promise<object>} The response data from the server.
 */
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    // Handle or throw error for the component to catch
    console.error('Registration API Error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Registration failed');
  }
};

/**
 * Logs in a user.
 * @param {object} credentials - The user credentials (email, password).
 * @returns {Promise<object>} The response data from the server (should include the token).
 */
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    // The backend should return { token: '...' } upon successful login
    if (response.data.token) {
        // Optionally store token here or let the AuthContext handle it
        // localStorage.setItem('lokalFarmersToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login API Error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Login failed');
  }
};

// --- Product API Functions ---

/**
 * Creates a new product. (Farmer only)
 * @param {object} productData - Data for the new product.
 * @returns {Promise<object>} The created product data.
 */
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Create Product API Error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to create product');
  }
};

/**
 * Fetches products listed by the logged-in farmer. (Farmer only)
 * @returns {Promise<Array<object>>} Array of farmer's products.
 */
export const getFarmerProducts = async () => {
  try {
    const response = await api.get('/products/myproducts');
    return response.data;
  } catch (error) {
    console.error('Get Farmer Products API Error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to fetch farmer products');
  }
};

/**
 * Updates a product. (Farmer only)
 * @param {string} productId - The ID of the product to update.
 * @param {object} productData - The updated product data.
 * @returns {Promise<object>} The updated product data.
 */
export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error('Update Product API Error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to update product');
  }
};

/**
 * Deletes a product. (Farmer only)
 * @param {string} productId - The ID of the product to delete.
 * @returns {Promise<object>} Confirmation message.
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    return response.data; // e.g., { msg: 'Product removed successfully' }
  } catch (error) {
    console.error('Delete Product API Error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to delete product');
  }
};

/**
 * Fetches a single product by its ID. (Public)
 * @param {string} productId - The ID of the product to fetch.
 * @returns {Promise<object>} The product data.
 */
export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Get Product By ID API Error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to fetch product');
  }
};

/**
 * Fetches all products with filtering, pagination, and search. (Public)
 * @param {object} [params={}] - Optional query parameters (page, limit, category, minPrice, maxPrice, search).
 * @returns {Promise<object>} Object containing products array and pagination info.
 */
export const getAllProducts = async (params = {}) => {
    try {
      // Axios automatically converts the params object into query string parameters
      const response = await api.get('/products', { params });
      // The backend now returns an object like: { products, page, totalPages, ... }
      return response.data;
    } catch (error) {
      console.error('Get All Products API Error:', error.response ? error.response.data : error.message);
      throw error.response ? error.response.data : new Error('Failed to fetch all products');
    }
};


export default api; // Export the configured instance if needed elsewhere directly
