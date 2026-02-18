import { Link } from 'react-router-dom';
import React, { useState } from "react";

function Login() {
  // We only need Email and Password for logging in
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Data Captured:", formData);
    alert("Login data captured! Check the console.");
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center p-4">
      
      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_0_40px_rgba(79,70,229,0.2)] w-full max-w-md border border-slate-700/50 text-white">
        
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6 text-center">
          Welcome Back
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              // No bg-slate-800 here, it's transparent for the Galaxy look
              className="mt-1 block w-full bg-transparent border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="Enter your password"
              className="mt-1 block w-full bg-transparent border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95 mt-2"
          >
            Sign In
          </button>

          {/* This Link takes you back to the Register page */}
          <p className="text-center text-slate-400 mt-4 text-sm">
            Already have an account? 
            <Link to="/" className="text-purple-400 hover:underline ml-1 font-medium">Register here</Link>
          </p>

        </form>
      </div>
    </div>
  );
}

export default Login;