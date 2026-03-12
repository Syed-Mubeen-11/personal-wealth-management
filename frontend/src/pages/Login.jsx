import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

      const response = await axios.post(
        "http://127.0.0.1:8000/users/login",
        formData
      );

      localStorage.setItem("token", response.data.access_token);

      navigate("/dashboard");
    } catch (error) {
      alert("Invalid credentials");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center p-4">

      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.15)] w-full max-w-md border border-slate-700/50 text-white">

        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400 mb-6 text-center">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-slate-300">
              Email Address
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

          <div>
            <label className="block text-sm font-semibold text-slate-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="Enter your password"
              className="mt-1 w-full bg-transparent border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95"
          >
            {loading ? "Signing In..." : "Login"}
          </button>

          <p className="text-center text-slate-400 mt-4 text-sm">
            Don’t have an account?
            <Link
              to="/register"
              className="text-purple-400 hover:underline ml-1 font-medium"
            >
              Create one
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}

export default Login;