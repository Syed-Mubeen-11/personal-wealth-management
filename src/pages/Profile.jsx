import React from "react";

const Profile = () => {
  const userHistory = [
    { action: "Account Created", date: "10 Jan 2024" },
    { action: "KYC Submitted", date: "12 Jan 2024" },
    { action: "First Investment", date: "15 Feb 2024" },
    { action: "Goal Created", date: "10 Mar 2024" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-950 text-white p-8">

      <h2 className="text-3xl font-bold mb-8">Profile & Risk Management 👤</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* User Info */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">User Information</h3>

          <p className="text-gray-300">Name: Thambi Durai</p>
          <p className="text-gray-300">Email: thambi@example.com</p>
          <p className="text-gray-300">Phone: +91 9876543210</p>
          <p className="text-gray-300">Location: Chennai</p>
        </div>

        {/* Risk Profile */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Risk Profile</h3>

          <p className="text-gray-300 mb-3">Moderate Risk Investor</p>

          <div className="w-full bg-gray-700 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full w-2/3"></div>
          </div>

          <p className="text-sm text-gray-400 mt-2">Risk Level: 65%</p>
        </div>

        {/* KYC Status */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">KYC Status</h3>

          <p className="text-green-400 font-semibold text-lg">
            Verified ✅
          </p>

          <p className="text-gray-400 text-sm mt-2">
            Your identity verification is completed.
          </p>
        </div>

        {/* User History */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">User History</h3>

          <ul className="space-y-3 text-gray-300">
            {userHistory.map((item, index) => (
              <li key={index} className="flex justify-between border-b border-gray-700 pb-2">
                <span>{item.action}</span>
                <span className="text-gray-400">{item.date}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Profile;