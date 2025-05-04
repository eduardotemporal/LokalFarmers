import React, { useState } from 'react';

const SearchBar = ({ onSearch, initialValue = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent form submission from reloading the page
    onSearch(searchTerm.trim()); // Call the callback function with the trimmed search term
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full max-w-lg mx-auto">
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <input
        type="search"
        id="product-search"
        placeholder="Search for products..."
        value={searchTerm}
        onChange={handleInputChange}
        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
