// src/components/Loading.js

import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-[#5a0006]">
      <div className="text-center">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-[#ffc107] border-t-gray-300 rounded-full animate-spin mx-auto"></div>

        {/* Loading Text */}
        <h1 className="text-[#ffc107] text-2xl md:text-4xl font-semibold mt-4">
          Loading, please wait...
        </h1>

        {/* Subtext */}
        <p className="text-gray-300 text-sm md:text-lg mt-2">
          We're getting things ready for you.
        </p>
      </div>
    </div>
  );
};

export default Loading;