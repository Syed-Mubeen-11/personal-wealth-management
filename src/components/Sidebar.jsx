import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 text-white p-4 min-h-screen">
      <h2 className="text-xl mb-6">Menu</h2>

      <ul>
        <li className="mb-3">
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;