import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      {isAuthenticated ? (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {/* Sidebar */}
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            setIsAuthenticated={setIsAuthenticated}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navbar */}
            <Navbar setSidebarOpen={setSidebarOpen} />

            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <AppRoutes
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
              />
            </main>
          </div>
        </div>
      ) : (
        <AppRoutes
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
      )}
    </Router>
  );
}

export default App;