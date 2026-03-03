import React, { useState, useEffect } from "react";

const ProfileRisk = () => {
  // Profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");

  // KYC status
  const [kycStatus, setKycStatus] = useState("Not Submitted");

  // Investment risk level
  const [riskLevel, setRiskLevel] = useState("");
  const riskDescriptions = {
    Conservative: "Prioritizes capital preservation, low risk.",
    Moderate: "Balances growth with risk.",
    Aggressive: "Seeks high growth, accepts higher risk.",
  };

  // Load existing data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("profileData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFullName(parsed.fullName || "");
      setEmail(parsed.email || "");
      setMobile(parsed.mobile || "");
      setAddress(parsed.address || "");
      setDob(parsed.dob || "");
      setRiskLevel(parsed.riskLevel || "");
      setKycStatus(parsed.kycStatus || "Not Submitted");
    }
  }, []);

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
    if (window.confirm("Are you sure you want to clear all fields?")) {
      setFullName("");
      setEmail("");
      setMobile("");
      setAddress("");
      setDob("");
      setRiskLevel("");
      setKycStatus("Not Submitted");
    }
  };

  // Save changes button
  const handleSave = () => {
    if (!fullName || !email || !mobile || !address || !dob) {
      alert("Please fill all profile details before saving!");
      return;
    }
    const profileData = { fullName, email, mobile, address, dob, riskLevel, kycStatus };
    localStorage.setItem("profileData", JSON.stringify(profileData));
    alert("Profile & Risk details saved successfully!");
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-purple-800">Profile & Risk Management</h2>
        <p className="text-gray-500">Update your personal information and investment preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Fields */}
        <div className="space-y-4">
          {[
            { label: "Full Name", value: fullName, setter: setFullName, type: "text" },
            { label: "Email Address", value: email, setter: setEmail, type: "email" },
            { label: "Mobile Number", value: mobile, setter: setMobile, type: "text" },
            { label: "Address", value: address, setter: setAddress, type: "text" },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                className="w-full border border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                placeholder={`Enter your ${field.label.toLowerCase()}`}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Risk & KYC Section */}
        <div className="space-y-8">
          {/* Risk Level */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Investment Risk Level</h3>
            <div className="flex flex-wrap gap-3">
              {["Conservative", "Moderate", "Aggressive"].map((level) => (
                <button
                  key={level}
                  onClick={() => setRiskLevel(level)}
                  className={`px-5 py-2 rounded-xl font-bold transition-all border-2 ${
                    riskLevel === level
                      ? "bg-purple-700 text-white border-purple-700 shadow-md scale-105"
                      : "bg-white text-gray-600 border-gray-100 hover:border-purple-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            {riskLevel && (
              <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-purple-700 text-sm font-medium">
                  <span className="font-bold">Strategy:</span> {riskDescriptions[riskLevel]}
                </p>
              </div>
            )}
          </div>

          {/* KYC Status */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">KYC Verification</h3>
            <div className="grid grid-cols-2 gap-2">
              {["Not Submitted", "Pending", "Update", "Completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleKycClick(status)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                    status === kycStatus
                      ? "bg-green-600 text-white border-green-600 shadow-sm"
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Current Status: <span className={`font-bold ${kycStatus === 'Completed' ? 'text-green-600' : 'text-orange-500'}`}>{kycStatus}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4">
        <button
          onClick={handleCancel}
          className="px-8 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition font-bold"
        >
          Reset Form
        </button>
        <button
          onClick={handleSave}
          className="px-8 py-2.5 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition font-bold shadow-lg shadow-purple-200"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileRisk;