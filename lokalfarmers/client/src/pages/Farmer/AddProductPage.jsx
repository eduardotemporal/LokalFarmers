import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/Farmer/ProductForm'; // Import the form component
import { createProduct } from '../../services/api'; // Import the API function

const AddProductPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (productData) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await createProduct(productData);
      setSuccess('Product added successfully! Redirecting...');
      // Consider clearing the form or disabling it here
      setTimeout(() => {
        navigate('/farmer/products'); // Redirect to the product list page
      }, 2000); // Wait 2 seconds before redirecting
    } catch (err) {
      const errorMessage = err.errors && err.errors.length > 0
                           ? err.errors[0].msg // Display specific error from backend validation
                           : (err.message || 'Failed to add product. Please try again.');
      setError(errorMessage);
      console.error('Add product error:', err);
      setIsSubmitting(false); // Re-enable form submission on error
    }
    // No need to set isSubmitting to false on success because we are navigating away
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Add New Product</h1>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
      {success && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</p>}
      <ProductForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Add Product"
      />
    </div>
  );
};

export default AddProductPage;
