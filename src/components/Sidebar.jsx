import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white p-5">

      <h1 className="text-2xl font-bold mb-8">Finance App</h1>

      <ul className="space-y-4">

        <li>
          <Link to="/" className="hover:text-indigo-400">
            Dashboard
          </Link>
        </li>

        <li>
          <Link to="/profile" className="hover:text-indigo-400">
            Profile
          </Link>
        </li>

        <li>
          <Link to="/goals" className="hover:text-indigo-400">
            Goals
          </Link>
        </li>

      </ul>

    </div>
  );
};

export default Sidebar;