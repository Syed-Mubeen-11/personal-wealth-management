import { Link, useNavigate } from "react-router-dom";

function Topbar() {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center text-white">

      <h1 className="text-lg font-semibold">
        Dashboard Overview
      </h1>




      <Link to="/profile" className="block hover:text-purple-400 transition">
        Profile
      </Link>

    </div>
  );
}

export default Topbar;