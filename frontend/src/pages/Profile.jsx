import React, { useEffect, useState } from "react";
import API from "../services/api";

function Profile() {
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
      await API.put("/update-profile", {
        name,
        email,
        risk_profile: risk
      });

      alert("Profile updated successfully");
    } catch (error) {
      alert("Error updating profile");
    }
  };

  const handlePasswordChange = async () => {
    try {
      await API.put("/change-password", {
        current_password: currentPassword,
        new_password: newPassword
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
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Profile</h2>

      <div className="space-y-4">

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
        />

        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>

        <button
          onClick={handleProfileUpdate}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Save Profile
        </button>

        <hr className="my-4" />

        <h3 className="font-semibold">Change Password</h3>

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border p-2 w-full"
        />

        <button
          onClick={handlePasswordChange}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Change Password
        </button>

      </div>
    </div>
  );
}

export default Profile;