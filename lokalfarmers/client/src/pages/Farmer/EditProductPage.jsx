import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../../components/Farmer/ProductForm'; // Import the form component
import { getProductById, updateProduct } from '../../services/api'; // Import API functions

const EditProductPage = () => {
  const { productId } = useParams(); // Get product ID from URL
  const navigate = useNavigate();
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch product data when component mounts or productId changes
  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getProductById(productId);
      // TODO: Add check here to ensure the fetched product belongs to the logged-in farmer
      // This check should ideally happen on the backend, but a frontend check adds an extra layer.
      // We might need to adjust AuthContext or API to facilitate this easily.
      setProductData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch product data.');
      console.error("Fetch product error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]); // Depend on productId

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Handle form submission
  const handleSubmit = async (updatedData) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await updateProduct(productId, updatedData);
      setSuccess('Product updated successfully! Redirecting...');
      // Consider disabling the form here
      setTimeout(() => {
        navigate('/farmer/products'); // Redirect back to the product list
      }, 2000); // Wait 2 seconds
    } catch (err) {
       const errorMessage = err.errors && err.errors.length > 0
                           ? err.errors[0].msg // Display specific error from backend validation
                           : (err.message || 'Failed to update product. Please try again.');
      setError(errorMessage);
      console.error('Update product error:', err);
      setIsSubmitting(false); // Re-enable form on error
    }
     // No need to set isSubmitting to false on success because we are navigating away
  };

  if (isLoading) {
    return <div className="text-center mt-10">Loading product details...</div>;
  }

  if (error && !productData) { // Show error only if loading failed completely
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Edit Product</h1>
       {/* Show submit errors/success messages */}
       {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
       {success && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</p>}

      {productData ? (
        <ProductForm
          initialData={productData} // Pass fetched data to the form
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Update Product"
        />
      ) : (
         // This case should ideally be covered by the loading/error states above
         <p>Product data could not be loaded.</p>
      )}
    </div>
  );
};

export default EditProductPage;
