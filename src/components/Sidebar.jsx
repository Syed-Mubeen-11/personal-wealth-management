import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Profile", path: "/profile" },
    { name: "Goals", path: "/goals" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Transactions", path: "/transactions" },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-indigo-950 text-white p-6 min-h-screen shadow-xl">
      <h2 className="text-2xl font-semibold mb-8">Menu</h2>

      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`block px-4 py-2 rounded-xl transition duration-300 ${
                location.pathname === item.path
                  ? "bg-blue-700 shadow-md"
                  : "hover:bg-blue-800/60"
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;