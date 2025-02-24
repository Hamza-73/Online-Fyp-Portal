// src/components/Loading.js

import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-gray-400 border-t-gray-600 rounded-full animate-spin mx-auto"></div>

        {/* Loading Text */}
        <h1 className="text-gray-700 text-xl md:text-3xl font-medium mt-4">
          Loading, please wait...
        </h1>

        {/* Subtext */}
        <p className="text-gray-500 text-sm md:text-lg mt-2">
          Preparing your content...
        </p>
      </div>
    </div>
  );
};

export default Loading;
