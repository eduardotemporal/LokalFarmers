import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getFarmerProducts, deleteProduct } from '../../services/api'; // Import API functions
import ProductListItem from './ProductListItem'; // Import the list item component

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getFarmerProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch products.');
      console.error("Fetch products error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies, fetch on mount

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // Run fetchProducts when component mounts

  const handleDelete = async (productId) => {
    // Note: Confirmation is handled in ProductListItem
    try {
      await deleteProduct(productId);
      // Remove the deleted product from the state
      setProducts(currentProducts => currentProducts.filter(p => p._id !== productId));
      // Optional: Show success message
    } catch (err) {
      setError(err.message || 'Failed to delete product.');
      console.error("Delete product error:", err);
      // Optional: Show error message to user
    }
  };

  if (isLoading) {
    return <div className="text-center mt-10">Loading your products...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Manage Your Products</h2>
        <Link
          to="/farmer/products/new"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          + Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-600">You haven't added any products yet.</p>
      ) : (
        <div className="space-y-4">
          {products.map(product => (
            <ProductListItem
              key={product._id}
              product={product}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
