import React from "react";

const Navbar = () => {
  return (
    <div className="bg-gradient-to-r from-black via-gray-900 to-indigo-950 
    text-white p-4 shadow-lg border-b border-white/10 flex items-center justify-between">

      {/* Title */}
      <h1 className="text-xl font-bold tracking-wide">
        Finance Dashboard
      </h1>

      {/* Right side profile placeholder */}
      <div className="flex items-center gap-3">

        <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center font-bold">
          U
        </div>

        <span className="text-gray-300 text-sm">
          User
        </span>

      </div>

    </div>
  );
};

export default Navbar;