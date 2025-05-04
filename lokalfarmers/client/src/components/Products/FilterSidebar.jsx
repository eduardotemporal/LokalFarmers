import React, { useState, useEffect } from 'react';

const hardcodedCategories = ["Vegetables", "Fruits", "Dairy", "Meat", "Bakery", "Other"];

const FilterSidebar = ({ onFilterChange, currentFilters = {} }) => {
  const [category, setCategory] = useState(currentFilters.category || '');
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');

  // Update local state if currentFilters prop changes (e.g., when cleared)
  useEffect(() => {
    setCategory(currentFilters.category || '');
    setMinPrice(currentFilters.minPrice || '');
    setMaxPrice(currentFilters.maxPrice || '');
  }, [currentFilters]);

  const handleApplyFilters = () => {
    // Construct filter object, omitting empty values
    const filters = {};
    if (category) filters.category = category;
    if (minPrice !== '') filters.minPrice = parseFloat(minPrice);
    if (maxPrice !== '') filters.maxPrice = parseFloat(maxPrice);

    // Basic validation for price range
    if (filters.minPrice && filters.maxPrice && filters.minPrice > filters.maxPrice) {
        alert("Minimum price cannot be greater than maximum price.");
        return;
    }

    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onFilterChange({}); // Pass empty object to clear filters
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white space-y-4">
      <h3 className="text-lg font-semibold mb-3">Filters</h3>

      {/* Category Filter */}
      <div>
        <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category-filter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All Categories</option>
          {hardcodedCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Price Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price Range ($)
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min="0"
            step="0.01"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
            step="0.01"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2 pt-2">
         <button
          onClick={handleApplyFilters}
          className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClearFilters}
          className="w-full px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
