import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/Themecontext";
import { XMarkIcon } from "@heroicons/react/24/outline";

const Sidebar = ({ setIsAuthenticated, sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Transactions", path: "/transactions" },
    { name: "Goals", path: "/goals" },
    { name: "Reports", path: "/reports" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-30 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-50 visible bg-black" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:h-screen
        ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg flex flex-col justify-between`}
      >
        <div>
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between p-6 md:hidden">
            <div className={`text-xl font-bold text-indigo-600`}>WealthApp</div>
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon
                className="h-6 w-6 text-gray-200 dark:text-gray-200"
              />
            </button>
          </div>

          {/* Logo for desktop */}
          <div className="hidden md:block p-6 text-xl font-bold text-indigo-600">
            WealthApp
          </div>

          <nav className="px-4 space-y-2 mt-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={`block p-3 rounded hover:bg-indigo-100 dark:hover:bg-indigo-700 transition-colors duration-200 ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
                onClick={() => setSidebarOpen(false)} // close sidebar on mobile click
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white p-3 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;