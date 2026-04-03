import React, { useContext, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import profile from "../assets/profile.png";
import { ThemeContext } from "../context/Themecontext";
import { SunIcon, MoonIcon, BellIcon, Bars3Icon } from "@heroicons/react/24/outline";
import API from "../services/api";

const Navbar = ({ setSidebarOpen }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Route → Title Mapping
  const titles = {
    "/dashboard": "Dashboard",
    "/portfolio": "Portfolio",
    "/transactions": "Transactions",
    "/goals": "Goals",
    "/reports": "Reports",
    "/profile": "Profile",
    "/recommendations": "Recommendations",
    "/sip-calculator": "SIP Calculator"
  };

  const pageTitle = titles[location.pathname] || "Dashboard";

  // Update Browser Tab Title
  useEffect(() => {
    document.title = `${pageTitle} | WealthApp`;
  }, [pageTitle]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get stored read notifications from localStorage
  const getReadNotifications = () => {
    const read = localStorage.getItem("readNotifications");
    return read ? JSON.parse(read) : [];
  };

  // Save read notification to localStorage
  const markNotificationAsRead = (notificationId) => {
    const read = getReadNotifications();
    if (!read.includes(notificationId)) {
      read.push(notificationId);
      localStorage.setItem("readNotifications", JSON.stringify(read));
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem("readNotifications", JSON.stringify(allIds));
    setUnreadCount(0);
    setShowDropdown(false);
  };

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const response = await API.get('/recommendations/analyze');
      if (response.data?.smart_actions) {
        const alerts = response.data.smart_actions.filter(
          action => action.priority === 'critical' || action.priority === 'high'
        );
        
        const readIds = getReadNotifications();
        
        const formattedNotifications = alerts.map((alert, index) => ({
          id: `${alert.title}-${index}`,
          title: alert.title,
          description: alert.body || alert.reason,
          priority: alert.priority,
          action: alert.action,
          link: alert.link || '/recommendations'
        }));
        
        setNotifications(formattedNotifications);
        
        // Calculate unread count (notifications not in localStorage)
        const unread = formattedNotifications.filter(
          n => !readIds.includes(n.id)
        );
        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  // Fetch on mount and every 5 minutes
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);
    setShowDropdown(false);
    
    // Update unread count
    const readIds = getReadNotifications();
    const unread = notifications.filter(n => !readIds.includes(n.id));
    setUnreadCount(unread.length);
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      default: return '🟡';
    }
  };

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
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
        </button>

        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {pageTitle}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <BellIcon className="h-6 w-6 text-gray-500 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <BellIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No new notifications</p>
                    <p className="text-xs mt-1">Check back later for alerts</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const readIds = getReadNotifications();
                    const isRead = readIds.includes(notification.id);
                    
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${getPriorityColor(notification.priority)} ${isRead ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{getPriorityIcon(notification.priority)}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              {notification.description}
                            </p>
                            {!isRead && (
                              <p className="text-xs mt-2 text-indigo-600 dark:text-indigo-400 font-medium">
                                New • Tap to view →
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/recommendations');
                    }}
                    className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                  >
                    View all recommendations
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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
          onClick={() => navigate('/profile')}
        />
      </div>
    </nav>
  );
};

export default Navbar;