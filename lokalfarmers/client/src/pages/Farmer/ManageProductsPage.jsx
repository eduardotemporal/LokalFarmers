import React from 'react';
import ProductList from '../../components/Farmer/ProductList'; // Import the ProductList component

const ManageProductsPage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* The ProductList component already contains the title and add button */}
      <ProductList />
    </div>
  );
};

export default ManageProductsPage;
