import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { ThemeContext } from "../context/Themecontext";
import profileImg from "../assets/profile.png";

function Profile() {

  const { darkMode } = useContext(ThemeContext);

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [risk, setRisk] = useState("moderate");

  const [kycStatus, setKycStatus] = useState("unverified");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");



  useEffect(() => {

    const fetchUser = async () => {

      const response = await API.get("/me");

      setUser(response.data);

      setName(response.data.name);

      setEmail(response.data.email);

      setRisk(response.data.risk_profile);

      setKycStatus(response.data.kyc_status);

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

    } catch {

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

      await API.put("/verify-kyc");

      setKycStatus("verified");

      alert("KYC verified successfully");

    } catch {

      alert("Error verifying KYC");

    }

  };



  if (!user) return <div>Loading...</div>;



  return (

    <div className={`p-6 md:p-8 min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50"}`}>

      <h1 className="text-3xl font-bold mb-8">
        Profile & Risk Management
      </h1>


      {/* Profile Header */}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8 flex items-center justify-between">

        <div className="flex items-center gap-5">

          <img
            src={profileImg}
            alt="Profile"
            className="w-20 h-20 rounded-full border"
          />

          <div>

            <h2 className="text-xl font-semibold">
              {name}
            </h2>

            <p className="text-gray-500 text-sm">
              {email}
            </p>

          </div>

        </div>

      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


        {/* LEFT SIDE */}

        <div className="space-y-8">


          {/* Profile Details */}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">

            <h3 className="text-xl font-semibold mb-6">
              User Profile Details
            </h3>

            <div className="space-y-5">


              <div>

                <label className="text-sm text-gray-500">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 mt-1 dark:bg-gray-700"
                />

              </div>



              <div>

                <label className="text-sm text-gray-500">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 mt-1 dark:bg-gray-700"
                />

              </div>


            </div>

          </div>



          {/* Change Password */}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">

            <h3 className="text-lg font-semibold mb-4">
              Change Password
            </h3>


            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e)=>setCurrentPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 mb-3 dark:bg-gray-700"
            />


            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e)=>setNewPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 dark:bg-gray-700"
            />


            <button
              onClick={handlePasswordChange}
              className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg"
            >
              Change Password
            </button>

          </div>


          {/* KYC Card */}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center justify-between">

            <div>

              <h3 className="font-semibold">
                KYC Status
              </h3>

              <p className="text-sm text-gray-500 mt-1">

                {kycStatus === "verified"
                  ? "Your KYC verification is completed."
                  : "Please complete KYC verification."}

              </p>

            </div>


            <div className="text-right">

              <span
                className={`font-medium ${
                  kycStatus === "verified"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {kycStatus === "verified"
                  ? "✓ Completed"
                  : "Pending"}
              </span>


              {kycStatus !== "verified" && (

                <button
                  onClick={handleVerifyKYC}
                  className="block mt-2 bg-indigo-600 text-white px-4 py-1 rounded-lg"
                >
                  Verify
                </button>

              )}

            </div>

          </div>

        </div>



        {/* RIGHT SIDE */}

        <div className="space-y-8">


          {/* Risk Profile */}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">

            <h3 className="text-lg font-semibold mb-6">
              Risk Profile Selection
            </h3>


            <div className="space-y-4">

              {["conservative","moderate","aggressive"].map(level => (

                <div
                  key={level}
                  onClick={()=>setRisk(level)}
                  className={`cursor-pointer border rounded-xl p-4 transition
                  ${
                    risk === level
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900"
                      : "border-gray-200 hover:border-indigo-400"
                  }`}
                >

                  <p className="font-medium capitalize">
                    {level}
                  </p>

                  <p className="text-sm text-gray-500">

                    {level === "conservative" &&
                      "Prioritizes capital preservation, low risk."}

                    {level === "moderate" &&
                      "Balanced growth with diversified investments."}

                    {level === "aggressive" &&
                      "Higher growth with higher volatility."}

                  </p>

                </div>

              ))}

            </div>

          </div>



        </div>

      </div>



      {/* Save Button */}

      <div className="flex justify-end mt-10">

        <button
          onClick={handleProfileUpdate}
          className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Save Changes
        </button>

      </div>


    </div>

  );

}

export default Profile;