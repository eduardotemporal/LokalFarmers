import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/api'; // Import API function

// Placeholder image URL
const placeholderImageUrl = "https://via.placeholder.com/600x400.png?text=No+Image";

const ProductDetailPage = () => {
  const { productId } = useParams(); // Get product ID from URL
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getProductById(productId);
      setProduct(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch product details.');
      console.error("Fetch product details error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]); // Depend on productId

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Function to handle image loading errors
  const handleImageError = (e) => {
      e.target.onerror = null; // prevent infinite loop if placeholder also fails
      e.target.src = placeholderImageUrl;
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-10 text-center">Loading product details...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-10 text-center text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-10 text-center">Product not found.</div>;
  }

  // Use the first image or the placeholder
  const mainImageUrl = product.images && product.images.length > 0 ? product.images[0] : placeholderImageUrl;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <img
              src={mainImageUrl}
              alt={product.name}
              className="w-full h-auto max-h-96 object-contain rounded-md border"
              onError={handleImageError}
            />
            {/* Optional: Thumbnail gallery if multiple images exist */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {product.images.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                    onError={handleImageError}
                    // onClick={() => setMainImageUrl(imgUrl)} // Logic to change main image
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-lg text-gray-600 mb-4">{product.category}</p>
            <p className="text-2xl font-bold text-green-700 mb-4">${product.price?.toFixed(2)}</p>

            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-700 mb-1">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

             <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-700 mb-1">Quantity Available</h3>
                <p className="text-gray-600">{product.quantity}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-700 mb-1">Sold by</h3>
              <p className="text-gray-600">{product.farmer?.name || 'Unknown Farmer'}</p>
              {/* Optional: Link to farmer profile if available */}
            </div>

            {/* Action Button */}
            <button
              // onClick={() => addToCart(product)} // Implement cart logic later
              disabled={product.quantity === 0} // Disable if out of stock
              className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {product.quantity > 0 ? 'Add to Cart (Coming Soon)' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-8">
        <Link to="/" className="text-blue-500 hover:underline">
          &larr; Back to Products
        </Link>
      </div>
    </div>
  );
};

export default ProductDetailPage;
