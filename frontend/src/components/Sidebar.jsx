import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/Themecontext";
import { 
  XMarkIcon,
  HomeIcon,
  BriefcaseIcon,
  ArrowPathIcon,
  ChartBarIcon,
  LightBulbIcon,
  CalculatorIcon,
  DocumentChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";

const Sidebar = ({ setIsAuthenticated, sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
    { name: "Portfolio", path: "/portfolio", icon: BriefcaseIcon },
    { name: "Transactions", path: "/transactions", icon: ArrowPathIcon },
    { name: "Goals", path: "/goals", icon: ChartBarIcon },
    { name: "Recommendations", path: "/recommendations", icon: LightBulbIcon },
    { name: "SIP Calculator", path: "/sip-calculator", icon: CalculatorIcon },
    { name: "Reports", path: "/reports", icon: DocumentChartBarIcon },
    { name: "Profile", path: "/profile", icon: UserCircleIcon },
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
        ${darkMode ? "bg-gray-900" : "bg-white"} shadow-lg flex flex-col justify-between`}
      >
        <div>
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between p-5 md:hidden">
            <div className={`text-xl font-bold text-indigo-600`}>WealthApp</div>
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Logo for desktop */}
          <div className="hidden md:block p-6 text-xl font-bold text-indigo-600">
            WealthApp
          </div>

          <nav className="px-3 space-y-2 mt-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                      : darkMode
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;