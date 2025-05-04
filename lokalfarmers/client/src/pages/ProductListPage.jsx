import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'; // To manage state in URL

import { getAllProducts } from '../services/api';
import ProductCard from '../components/Products/ProductCard';
import SearchBar from '../components/Products/SearchBar';
import FilterSidebar from '../components/Products/FilterSidebar';
import Pagination from '../components/Products/Pagination';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12, // Items per page
  });

  // Use URLSearchParams to manage filters, search, and page
  const [searchParams, setSearchParams] = useSearchParams();

  // Function to build query parameters from searchParams
  const buildQueryParams = useCallback(() => {
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: pagination.limit,
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
    };
    // Remove empty params
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || (key === 'page' && params[key] === 1)) {
        delete params[key];
      }
    });
    return params;
  }, [searchParams, pagination.limit]);

  // Fetch products whenever query params change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError('');
      const params = buildQueryParams();

      try {
        const data = await getAllProducts(params);
        setProducts(data.products || []);
        setPagination(prev => ({
          ...prev,
          currentPage: data.page || 1,
          totalPages: data.totalPages || 1,
          totalProducts: data.totalProducts || 0,
        }));
      } catch (err) {
        setError(err.message || 'Failed to fetch products.');
        console.error("Fetch products error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, buildQueryParams]); // Re-fetch when searchParams change

  // Handlers to update searchParams
  const handleSearch = (searchTerm) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (searchTerm) {
        newParams.set('search', searchTerm);
      } else {
        newParams.delete('search');
      }
      newParams.delete('page'); // Reset to page 1 on new search
      return newParams;
    });
  };

  const handleFilterChange = (filters) => {
     setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        // Set or delete each filter
        Object.keys(filters).forEach(key => {
            if (filters[key] !== '' && filters[key] !== undefined && filters[key] !== null) {
                newParams.set(key, filters[key]);
            } else {
                 newParams.delete(key);
            }
        });
        newParams.delete('page'); // Reset to page 1 on new filter
        return newParams;
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', newPage);
      return newParams;
    });
     // Optional: Scroll to top on page change
     window.scrollTo(0, 0);
  };

  // Get current filter values from URL for the sidebar
  const currentFilters = {
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} initialValue={searchParams.get('search') || ''} />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <FilterSidebar onFilterChange={handleFilterChange} currentFilters={currentFilters} />
        </aside>

        {/* Main Content */}
        <main className="w-full md:w-3/4 lg:w-4/5">
          {isLoading ? (
            <div className="text-center py-10">Loading products...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">Error: {error}</div>
          ) : (
            <>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-600">
                  No products found matching your criteria.
                </div>
              )}

              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListPage;
