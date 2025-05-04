import React from 'react';
import { Link } from 'react-router-dom';

const ProductListItem = ({ product, onDelete }) => {
  const handleDeleteClick = () => {
    // Optional: Add confirmation dialog before deleting
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      onDelete(product._id);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 border rounded-lg shadow-sm bg-white mb-3">
      <div className="flex-1 mb-3 sm:mb-0">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-600">
          Category: <span className="font-medium">{product.category}</span>
        </p>
        <p className="text-sm text-gray-600">
          Price: <span className="font-medium">${product.price?.toFixed(2)}</span>
        </p>
        <p className="text-sm text-gray-600">
          Quantity: <span className="font-medium">{product.quantity}</span>
        </p>
        {product.images && product.images.length > 0 && (
           <p className="text-sm text-gray-500 mt-1">Image 1: {product.images[0].substring(0, 30)}...</p>
        )}
      </div>
      <div className="flex space-x-2">
        <Link
          to={`/farmer/products/edit/${product._id}`}
          className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit
        </Link>
        <button
          onClick={handleDeleteClick}
          className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProductListItem;
