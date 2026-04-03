import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [riskProfile, setRiskProfile] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await API.post("/register", {
        name,
        email,
        password,
        risk_profile: riskProfile,
      });

      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      alert("Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="flex w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl">

        {/* ── Left Panel ── */}
        <div
          className="relative hidden md:flex flex-col justify-center px-10 py-12 w-5/12 overflow-hidden"
          style={{ background: "#0d1145" }}
        >
          {/* Decorative circles */}
          <span
            className="absolute top-6 left-6 w-20 h-20 rounded-full opacity-30"
            style={{ background: "#1a2272" }}
          />
          <span className="absolute top-6 left-6 w-20 h-20 rounded-full border-4 border-indigo-400 opacity-20" />
          <span
            className="absolute top-2 right-[-20px] w-24 h-24 rounded-full opacity-20"
            style={{ background: "#1a2272" }}
          />
          <span
            className="absolute bottom-10 left-[-24px] w-32 h-32 rounded-full opacity-20"
            style={{ background: "#1a2272" }}
          />
          <span className="absolute bottom-10 left-[-24px] w-32 h-32 rounded-full border-4 border-indigo-400 opacity-15" />

          {/* Small dots */}
          <span className="absolute top-1/3 right-8 w-2 h-2 rounded-full bg-white opacity-40" />
          <span className="absolute top-1/2 left-8 w-2 h-2 rounded-full bg-white opacity-30" />
          <span className="absolute bottom-24 right-10 w-1.5 h-1.5 rounded-full bg-white opacity-30" />

          {/* Dash marks */}
          <div className="absolute top-1/4 right-10 flex flex-col gap-1 opacity-30">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="block w-5 h-0.5 bg-indigo-300 rotate-45" />
            ))}
          </div>
          <div className="absolute bottom-16 left-12 flex flex-col gap-1 opacity-20">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="block w-5 h-0.5 bg-indigo-300 rotate-45" />
            ))}
          </div>

          {/* Greeting text */}
          <div className="relative z-10 text-white">
  <h1 className="text-4xl md:text-5xl font-bold mb-2">
    Get Started
  </h1>
  <p className="text-lg text-gray-200 mb-6">
    Create your account in seconds
  </p>
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
      <p className="text-gray-200">Track stocks, ETFs & mutual funds</p>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
      <p className="text-gray-200">Set retirement, education & home goals</p>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
      <p className="text-gray-200">Get personalized investment advice</p>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
      <p className="text-gray-200">Generate professional wealth reports</p>
    </div>
  </div>
  <p className="text-xs text-gray-300 mt-6">
    Free forever • No hidden charges • Secure & encrypted
  </p>
</div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex flex-col justify-center px-10 py-10 flex-1 bg-white">
          {/* Decorative top-right accent */}
          <div className="flex justify-end mb-2">
            <span
              className="w-10 h-10 rounded-full border-4 opacity-30"
              style={{ borderColor: "#0d1145" }}
            />
          </div>

          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
            Register
          </h2>

          <form className="space-y-4" onSubmit={handleRegister}>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 transition"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Risk Profile */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Risk Profile
              </label>
              <select
                className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                  riskProfile === "" ? "text-gray-400" : "text-gray-700"
                }`}
                value={riskProfile}
                onChange={(e) => setRiskProfile(e.target.value)}
                required
              >
                <option value="" disabled hidden>
                  Choose Risk Profile
                </option>
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-white transition-colors duration-300"
              style={{ background: "#0d1145" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1a2272")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#0d1145")}
            >
              Register
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-5">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-indigo-600 cursor-pointer hover:underline font-medium"
            >
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;