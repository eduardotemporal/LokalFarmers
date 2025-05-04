import React from 'react';
import { Link } from 'react-router-dom';

// Placeholder image URL
const placeholderImageUrl = "https://via.placeholder.com/300x200.png?text=No+Image";

const ProductCard = ({ product }) => {
  // Use the first image or the placeholder
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : placeholderImageUrl;

  return (
    <div className="border rounded-lg shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow duration-200 ease-in-out">
      <Link to={`/products/${product._id}`} className="block">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src=placeholderImageUrl; }} // Handle image loading errors
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate" title={product.name}>
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-1">{product.category}</p>
          <p className="text-md font-bold text-green-600 mb-2">${product.price?.toFixed(2)}</p>
          <p className="text-xs text-gray-600">
            Sold by: <span className="font-medium">{product.farmer?.name || 'Unknown Farmer'}</span>
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
