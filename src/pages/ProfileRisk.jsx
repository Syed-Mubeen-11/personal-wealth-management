import React, { useState } from "react";

const ProfileRisk = () => {
  // Profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");

  // KYC status
  const [kycStatus, setKycStatus] = useState("Not Submitted");
  const kycSteps = ["Not Submitted", "Pending", "Update", "Completed"];

  // Investment risk level
  const [riskLevel, setRiskLevel] = useState("");
  const riskDescriptions = {
    Conservative: "Prioritizes capital preservation, low risk.",
    Moderate: "Balances growth with risk.",
    Aggressive: "Seeks high growth, accepts higher risk.",
  };

  // KYC click handler
  const handleKycClick = (status) => {
    if (!fullName || !email || !mobile || !address || !dob) {
      alert("Please fill all profile details first!");
      return;
    }
    setKycStatus(status);
  };

  // Cancel button: reset all fields
  const handleCancel = () => {
    setFullName("");
    setEmail("");
    setMobile("");
    setAddress("");
    setDob("");
    setRiskLevel("");
    setKycStatus("Not Submitted");
  };

  // Save changes button
  const handleSave = () => {
    if (!fullName || !email || !mobile || !address || !dob) {
      alert("Please fill all profile details before saving!");
      return;
    }
    alert("Profile & Risk details saved successfully!");
    // Optional: save to localStorage
    const profileData = { fullName, email, mobile, address, dob, riskLevel, kycStatus };
    localStorage.setItem("profileData", JSON.stringify(profileData));
  };

  return (
    <div className="space-y-6">
      {/* Profile Form */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">
          Profile & Risk Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border p-2 rounded-md mt-1"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded-md mt-1"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">Mobile Number</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full border p-2 rounded-md mt-1"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border p-2 rounded-md mt-1"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border p-2 rounded-md mt-1"
            />
          </div>
        </div>

        {/* Investment Risk Level */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Investment Risk Level</h3>
          <p className="text-gray-500 mb-4">Choose the investment risk level that suits your financial goals</p>

          <div className="flex gap-4">
            {["Conservative", "Moderate", "Aggressive"].map((level) => (
              <button
                key={level}
                onClick={() => setRiskLevel(level)}
                className={`px-4 py-2 rounded-lg border font-semibold transition ${
                  riskLevel === level
                    ? "bg-purple-700 text-white border-purple-700"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {riskLevel && (
            <p className="mt-2 text-gray-700 font-medium">{riskDescriptions[riskLevel]}</p>
          )}
        </div>

        {/* KYC Status */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">KYC Status</h3>
          <div className="flex gap-4">
            {["Not Submitted", "Pending", "Update", "Completed"].map((status) => (
              <button
                key={status}
                onClick={() => handleKycClick(status)}
                className={`px-4 py-2 rounded-full border font-semibold transition ${
                  status === kycStatus
                    ? "bg-purple-700 text-white border-purple-700"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <p className="mt-2 text-gray-700 font-medium">Current Status: {kycStatus}</p>
        </div>

        {/* Cancel & Save Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition font-semibold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileRisk;