import React, { useState, useEffect } from 'react';

const ProductForm = ({ initialData, onSubmit, isSubmitting, submitButtonText = "Submit" }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    images: '', // Keep images simple for now (comma-separated URLs)
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      // Populate form if initialData is provided (for editing)
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || '',
        price: initialData.price || '',
        quantity: initialData.quantity || '',
        images: initialData.images ? initialData.images.join(', ') : '', // Join array to string
      });
    } else {
      // Reset form if no initial data (for adding)
      setFormData({
        name: '', description: '', category: '', price: '', quantity: '', images: '',
      });
    }
  }, [initialData]); // Rerun effect if initialData changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Basic validation
    if (!formData.name || !formData.description || !formData.category || formData.price === '' || formData.quantity === '') {
        setError('Please fill in all required fields (Name, Description, Category, Price, Quantity).');
        return;
    }
    if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
        setError('Price must be a non-negative number.');
        return;
    }
     if (isNaN(formData.quantity) || !Number.isInteger(parseFloat(formData.quantity)) || parseInt(formData.quantity) < 0) {
        setError('Quantity must be a non-negative whole number.');
        return;
    }


    // Prepare data for submission (convert images string back to array)
    const submissionData = {
      ...formData,
      price: parseFloat(formData.price), // Ensure price is a number
      quantity: parseInt(formData.quantity), // Ensure quantity is an integer
      images: formData.images.split(',').map(url => url.trim()).filter(url => url !== ''), // Split string to array
    };

    onSubmit(submissionData); // Call the onSubmit prop passed from the parent page
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
       {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name <span className="text-red-500">*</span></label>
        <input
          type="text" name="name" id="name" required value={formData.name} onChange={handleChange} disabled={isSubmitting}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
        <textarea
          name="description" id="description" rows="3" required value={formData.description} onChange={handleChange} disabled={isSubmitting}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
        ></textarea>
      </div>
       <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
        <input
          type="text" name="category" id="category" required value={formData.category} onChange={handleChange} disabled={isSubmitting}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
        />
        {/* Consider making this a select dropdown later */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($) <span className="text-red-500">*</span></label>
            <input
            type="number" name="price" id="price" required step="0.01" min="0" value={formData.price} onChange={handleChange} disabled={isSubmitting}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
            />
        </div>
        <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity <span className="text-red-500">*</span></label>
            <input
            type="number" name="quantity" id="quantity" required step="1" min="0" value={formData.quantity} onChange={handleChange} disabled={isSubmitting}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
            />
        </div>
      </div>
      <div>
        <label htmlFor="images" className="block text-sm font-medium text-gray-700">Image URLs (comma-separated)</label>
        <input
          type="text" name="images" id="images" value={formData.images} onChange={handleChange} disabled={isSubmitting}
          placeholder="e.g., https://example.com/img1.jpg, https://example.com/img2.jpg"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
