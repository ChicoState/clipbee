import React from "react";

const Background = ({ children }) => {
  return (
      <div className="h-auto w-[320px] bg-yellow-100 shadow-lg rounded-lg border border-gray-300 relative">
        <div className="w-full h-6 bg-gray-700 rounded-t-lg flex justify-center items-center">
          <div className="w-12 h-4 bg-gray-500 rounded-b-lg">
          </div>
        </div>
        <div className="p-2">
          {children}
        </div>
      </div>
  );
}

export default Background;