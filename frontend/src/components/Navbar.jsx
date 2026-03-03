import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import profile from "../assets/profile.png";
import { ThemeContext } from "../context/Themecontext";
import { SunIcon, MoonIcon, BellIcon, Bars3Icon } from "@heroicons/react/24/outline";

const Navbar = ({ setSidebarOpen }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  // Route → Title Mapping
  const titles = {
    "/dashboard": "Dashboard",
    "/portfolio": "Portfolio",
    "/transactions": "Transactions",
    "/goals": "Goals",
    "/reports": "Reports",
    "/profile": "Profile",
  };

  const pageTitle = titles[location.pathname] || "Dashboard";

  // Update Browser Tab Title
  useEffect(() => {
    document.title = `${pageTitle} | WealthApp`;
  }, [pageTitle]);

  return (
    <nav
      className="flex items-center justify-between 
                 bg-white dark:bg-gray-900 
                 px-4 md:px-6 py-4 
                 shadow-md dark:shadow-lg
                 border-b border-gray-200 dark:border-gray-700
                 transition-colors duration-300"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Sidebar toggle for mobile */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
        </button>

        {/* Page Title */}
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {pageTitle}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <BellIcon className="h-6 w-6 text-gray-500 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {darkMode ? (
            <SunIcon className="h-6 w-6 text-yellow-400" />
          ) : (
            <MoonIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Profile Avatar */}
        <img
          src={profile}
          alt="User"
          className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 cursor-pointer shadow-sm dark:shadow-md transition"
        />
      </div>
    </nav>
  );
};

export default Navbar;