import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen p-6 text-white">

      <h2 className="text-2xl font-bold mb-10 bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        WealthApp
      </h2>

      <div className="space-y-6 text-slate-300">

        <Link to="/dashboard" className="block hover:text-purple-400 transition">
          Dashboard
        </Link>
        
        <Link to="/profile" className="block hover:text-purple-400 transition">
          Profile & Risk Management
        </Link>

        <Link to="/goals" className="block hover:text-purple-400 transition">
          Goals
        </Link>

        <Link to="/portfolio" className="block hover:text-purple-400 transition">
          Portfolio & Transection
        </Link>



        <button
          onClick={handleLogout}
          className="text-left w-full hover:text-red-400 transition"
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Sidebar;