import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { ThemeContext } from "../context/Themecontext";

function Profile() {
  const { darkMode } = useContext(ThemeContext);

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [risk, setRisk] = useState("moderate");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const response = await API.get("/me");
      setUser(response.data);
      setName(response.data.name);
      setEmail(response.data.email);
      setRisk(response.data.risk_profile);
    };
    fetchUser();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      await API.put("/update-profile", { name, email, risk_profile: risk });
      alert("Profile updated successfully");
    } catch (error) {
      alert("Error updating profile");
    }
  };

  const handlePasswordChange = async () => {
    try {
      await API.put("/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      alert("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      alert("Incorrect current password");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <h2 className="text-2xl font-bold mb-6">Profile</h2>

      <div className="space-y-5 max-w-md">
        {/* Name */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-white focus:ring-indigo-500"
              : "bg-white border-gray-300 text-gray-900 focus:ring-indigo-500"
          }`}
          placeholder="Name"
        />

        {/* Email */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-white focus:ring-indigo-500"
              : "bg-white border-gray-300 text-gray-900 focus:ring-indigo-500"
          }`}
          placeholder="Email"
        />

        {/* Risk Profile */}
        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-white focus:ring-indigo-500"
              : "bg-white border-gray-300 text-gray-900 focus:ring-indigo-500"
          }`}
        >
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>

        <button
          onClick={handleProfileUpdate}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Save Profile
        </button>

        <hr className={`my-6 ${darkMode ? "border-gray-700" : "border-gray-300"}`} />

        <h3 className="font-semibold mb-2">Change Password</h3>

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-white focus:ring-red-500"
              : "bg-white border-gray-300 text-gray-900 focus:ring-red-500"
          }`}
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-white focus:ring-red-500"
              : "bg-white border-gray-300 text-gray-900 focus:ring-red-500"
          }`}
        />

        <button
          onClick={handlePasswordChange}
          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}

export default Profile;