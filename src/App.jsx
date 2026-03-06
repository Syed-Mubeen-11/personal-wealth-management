import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Goals from "./pages/Goals";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/goals" element={<Goals />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;