import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone_number: "",
    address: "",
    risk_profile: "moderate",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(
        "http://127.0.0.1:8000/users/register",
        formData
      );

      alert("Registration Successful!");
      navigate("/login");
    } catch (error) {
      alert("Registration Failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center p-4">

      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.15)] w-full max-w-lg border border-slate-700/50 text-white">

        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400 mb-6 text-center">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              required
              placeholder="Enter your full name"
              className="mt-1 w-full bg-transparent border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="mt-1 w-full bg-transparent border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="Create password"
              className="mt-1 w-full bg-transparent border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-slate-300">
              Phone Number
            </label>
            <input
              type="text"
              name="phone_number"
              required
              placeholder="Enter your phone number"
              className="mt-1 w-full bg-transparent border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-slate-300">
              Address
            </label>
            <input
              type="text"
              name="address"
              required
              placeholder="Enter your address"
              className="mt-1 w-full bg-transparent border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Risk Profile */}
          <div>
            <label className="block text-sm font-semibold text-slate-300">
              Risk Profile
            </label>
            <select
              name="risk_profile"
              className="mt-1 w-full bg-transparent border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            >
              <option value="conservative" className="bg-slate-900">
                Conservative
              </option>
              <option value="moderate" className="bg-slate-900">
                Moderate
              </option>
              <option value="aggressive" className="bg-slate-900">
                Aggressive
              </option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95 mt-2"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <p className="text-center text-slate-400 mt-4 text-sm">
            Already have an account?
            <Link
              to="/login"
              className="text-purple-400 hover:underline ml-1 font-medium"
            >
              Login here
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}

export default Register;