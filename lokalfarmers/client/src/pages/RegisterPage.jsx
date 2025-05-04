import React from 'react';
import RegisterForm from '../components/Auth/RegisterForm'; // Will be created next

const RegisterPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Register for LokalFarmers</h2>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
