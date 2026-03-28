import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { ThemeContext } from "../context/Themecontext";
import profileImg from "../assets/profile.png";
import RiskProfileBadge from "../components/RiskProfileBadge";  // ✅ Add this import

function Profile() {
  const { darkMode } = useContext(ThemeContext);

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");

  const [risk, setRisk] = useState("moderate");
  const [kycStatus, setKycStatus] = useState("unverified");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get("/me");
        const data = response.data;
        setUser(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone_number || "");
        setAddress(data.address || "");
        setDob(data.dob || "");
        setRisk(data.risk_profile || "moderate");
        setKycStatus(data.kyc_status || "unverified");
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchUser();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      // Save risk profile
      await API.patch("/users/risk-profile", {
        risk_profile: risk
      });

      // Update remaining profile details
      await API.put("/update-profile", {
        name,
        email,
        phone_number: phone,
        address: address,
        dob: dob,
        risk_profile: risk
      });

      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
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
    } catch {
      alert("Incorrect current password");
    }
  };

  const handleVerifyKYC = async () => {
    try {
      await API.post("/users/verify-kyc");
      setKycStatus("verified");
      alert("KYC verified successfully");
    } catch (err) {
      console.error(err);
      alert("Error verifying KYC");
    }
  };

  const getRiskSummary = () => {
    switch (risk) {
      case "conservative":
        return "Your strategy focuses on safety and stability. We recommend a portfolio heavily weighted towards Bonds (70%) and cash equivalents (20%), with minimal exposure to blue-chip stocks (10%). Expected returns are lower, but your capital is protected from major swings.";
      case "moderate":
        return "A balanced approach aiming for steady growth. A typical allocation would be 50% Equity (Mutual Funds & ETFs) and 50% Fixed Income (Bonds & FDs). This profile suits long-term goals like retirement where you can handle some temporary market dips.";
      case "aggressive":
        return "You are positioned for maximum growth. We suggest 80-90% allocation in individual Stocks and growth-focused ETFs. This profile offers the highest potential for long-term wealth creation but requires a strong stomach for significant market volatility.";
      default:
        return "Pick a risk level to see your suggested investment strategy.";
    }
  };

  if (!user) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className={`p-6 md:p-8 min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Profile & Risk Management
        </h1>

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={profileImg}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-indigo-50 dark:border-indigo-900"
              />
              <div className={`absolute bottom-1 right-1 w-6 h-6 border-4 border-white dark:border-gray-800 rounded-full ${kycStatus === "verified" ? "bg-green-500" : "bg-yellow-500"}`}></div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{name}</h2>
                <RiskProfileBadge riskProfile={risk} size="md" />
              </div>
              <p className="text-gray-500 text-sm mb-2">{email}</p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${kycStatus === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {kycStatus === "verified" ? "✓ KYC Completed" : "KYC Pending"}
              </div>
            </div>
          </div>
          <button
            onClick={handleProfileUpdate}
            className="hidden md:block px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Save All Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Personal Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2 invisible md:visible uppercase tracking-tight">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    placeholder="Enter full name"
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2 invisible md:visible uppercase tracking-tight">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    placeholder="name@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2 invisible md:visible uppercase tracking-tight">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    placeholder="+91 XXXXX XXXXX"
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2 invisible md:visible uppercase tracking-tight">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-500 mb-2 invisible md:visible uppercase tracking-tight">Residential Address</label>
                  <textarea
                    rows="3"
                    value={address}
                    placeholder="Enter your full residential address"
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Security & KYC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                <h3 className="text-xl font-bold mb-6">Security</h3>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <button
                    onClick={handlePasswordChange}
                    className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition active:scale-95"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">KYC Verification</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Identity verification is required for unlocking high-value mutual fund investments.
                  </p>
                </div>
                {kycStatus === "verified" ? (
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl border border-green-200 dark:border-green-800 flex items-center justify-center gap-2 text-green-600 font-bold">
                    <span className="text-xl">✓</span> Identity Verified
                  </div>
                ) : (
                  <button
                    onClick={handleVerifyKYC}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none transition transform active:scale-95"
                  >
                    Start KYC Process
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Risk Management */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <h3 className="text-xl font-bold mb-6">Risk Profile</h3>
              <div className="space-y-4">
                {[
                  { id: "conservative", title: "Conservative", desc: "Prioritizes capital preservation, low risk" },
                  { id: "moderate", title: "Moderate", desc: "Balances growth with risk, diversified" },
                  { id: "aggressive", title: "Aggressive", desc: "Seeks high growth, accepts higher risk" }
                ].map((level) => (
                  <div
                    key={level.id}
                    onClick={() => setRisk(level.id)}
                    className={`cursor-pointer border-2 rounded-2xl p-4 transition-all duration-200 ${
                      risk === level.id
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 translate-x-2"
                        : "border-gray-100 dark:border-gray-700 hover:border-indigo-200"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-lg">{level.title}</p>
                      {risk === level.id && <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{level.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-5 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl text-white shadow-lg">
                <h4 className="font-bold text-sm uppercase tracking-widest mb-3 opacity-90">Assessment Summary</h4>
                <p className="text-sm leading-relaxed font-medium">
                  {getRiskSummary()}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleProfileUpdate}
              className="md:hidden w-full px-8 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl"
            >
              Save All Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;