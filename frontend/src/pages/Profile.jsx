import { useEffect, useState } from "react";
import api from "../services/api";

function Profile() {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/me");
      setFormData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      await api.put("/users/update", {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        address: formData.address,
        risk_profile: formData.risk_profile,
      });

      alert("Profile Updated Successfully");
    } catch (err) {
      console.error(err.response?.data);
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="space-y-8 text-white">

      <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Profile & Risk Management
      </h1>

      <div className="grid md:grid-cols-2 gap-8">

        {/* User Info Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 shadow-lg">

          <h2 className="text-xl font-semibold mb-6">User Profile Details</h2>

          <div className="space-y-5">

            <input
              type="text"
              value={formData.full_name}
              disabled
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-400"
            />

            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-400"
            />

            <input
              type="text"
              name="phone_number"
              value={formData.phone_number || ""}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
            />

            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="Address"
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
            />

          </div>

        </div>

        {/* Risk Profile Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 shadow-lg">

          <h2 className="text-xl font-semibold mb-6">Risk Profile Selection</h2>

          <div className="space-y-4">

            {["conservative", "moderate", "aggressive"].map((risk) => (
              <label
                key={risk}
                className={`block border rounded-xl p-4 cursor-pointer transition ${
                  formData.risk_profile === risk
                    ? "border-purple-500 bg-slate-800"
                    : "border-slate-700 hover:border-purple-400"
                }`}
              >
                <input
                  type="radio"
                  name="risk_profile"
                  value={risk}
                  checked={formData.risk_profile === risk}
                  onChange={handleChange}
                  className="mr-3 accent-purple-500"
                />
                {risk.charAt(0).toUpperCase() + risk.slice(1)}
              </label>
            ))}

          </div>

        </div>

      </div>

      {/* KYC Card */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 flex justify-between items-center">

        <div>
          <h3 className="text-lg font-semibold">KYC Status</h3>
          <p className="text-slate-400">
            {formData.kyc_status ? "Completed" : "Pending"}
          </p>
        </div>

        <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition">
          Update KYC
        </button>

      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition font-semibold"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

    </div>
  );
}

export default Profile;