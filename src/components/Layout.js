import React from 'react';
import Navbar from './Navbar'; // Make sure this import matches your file name

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Navbar */}
      <Navbar />
      
      {/* Main content area with white card background */}
      <div className="ml-[5.5rem] md:ml-80 pt-6 pr-6 pb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 min-h-[calc(100vh-3rem)] p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;