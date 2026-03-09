import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter email & password");
      return;
    }

    try {

      const response = await API.post("/login_action", {
        email: email,
        password: password
      });

      if (response.data.status === "success") {

        localStorage.setItem("username", response.data.name);
        navigate("/dashboard");

      } else {
        setError("Invalid email or password");
      }

    } catch (err) {
      console.error(err);
      setError("Server error. Try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-300 via-purple-200 to-purple-400">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96">

        <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">Login</h2>

        {error && (
          <p className="bg-red-100 text-red-600 p-2 rounded mb-3 text-sm text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition duration-300"
          >
            Login
          </button>

        </form>

        <p className="text-center mt-4 text-gray-600">
          Don’t have an account?
          <Link to="/register" className="text-purple-600 font-bold hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;