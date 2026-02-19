import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      {isAuthenticated ? (
  <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} setIsAuthenticated={setIsAuthenticated}/>
    <div className="flex-1 flex flex-col overflow-hidden">
      <Navbar setSidebarOpen={setSidebarOpen} />
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