import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  WalletIcon,
  CreditCardIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Sidebar = ({ sidebarOpen, setSidebarOpen, setIsAuthenticated }) => {

  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);   // 🔥 reset auth
    navigate("/login");          // 🔥 redirect to login
  };

  const menuItems = [
    { name: "Dashboard", icon: HomeIcon, path: "/dashboard" },
    { name: "Portfolio", icon: WalletIcon, path: "/portfolio" },
    { name: "Transactions", icon: CreditCardIcon, path: "/transactions" },
    { name: "Goals", icon: ChartBarIcon, path: "/goals" },
    { name: "Reports", icon: ChartBarIcon, path: "/reports" },
  ];

  const bottomItems = [
    { name: "Profile", icon: UserIcon, path: "/profile" },
  ];

  return (
    <>
      {/* Overlay (Mobile Only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-white shadow-lg border-r border-gray-100 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col justify-between`}
      >
        {/* Top Section */}
        <div>
          <div className="flex items-center justify-between p-6">
            <h2 className="text-lg font-bold text-indigo-600">
              WealthApp
            </h2>

            {/* Close Button (Mobile Only) */}
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          <nav className="px-4 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="px-4 pb-6 space-y-2">

          {/* Profile */}
          {bottomItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition text-gray-600 hover:bg-red-50 hover:text-red-600 w-full"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
