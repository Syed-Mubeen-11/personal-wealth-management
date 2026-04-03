import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { ThemeContext } from "../context/Themecontext";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await API.post("/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const token = response.data.access_token;
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
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
          <span
            className="absolute top-6 left-6 w-20 h-20 rounded-full border-4 border-indigo-400 opacity-20"
          />
          <span
            className="absolute top-2 right-[-20px] w-24 h-24 rounded-full opacity-20"
            style={{ background: "#1a2272" }}
          />
          <span
            className="absolute bottom-10 left-[-24px] w-32 h-32 rounded-full opacity-20"
            style={{ background: "#1a2272" }}
          />
          <span
            className="absolute bottom-10 left-[-24px] w-32 h-32 rounded-full border-4 border-indigo-400 opacity-15"
          />
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
  <h1 className="text-4xl md:text-5xl font-bold mb-3">
    Welcome Back!
  </h1>
  <p className="text-xl md:text-2xl font-light mb-6">
    Sign in to continue your wealth journey
  </p>
  <div className="space-y-2 text-gray-200">
    <p className="text-base md:text-lg">
      Track your investments, set financial goals, and get personalized wealth recommendations all in one place.
    </p>
  </div>
</div>
        </div>

        {/* ── Right Panel ── */}
        <div
          className={`flex flex-col justify-center px-10 py-12 flex-1 transition-colors duration-300 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Decorative top-right accent */}
          <div className="flex justify-end mb-4">
            <span
              className="w-10 h-10 rounded-full border-4 opacity-30"
              style={{ borderColor: "#0d1145" }}
            />
          </div>

          <h2
            className={`text-3xl font-semibold text-center mb-8 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Login
          </h2>

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email / Username */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Username
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-indigo-500"
                    : "bg-white border-gray-300 text-gray-700 focus:ring-indigo-400"
                }`}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-indigo-500"
                    : "bg-white border-gray-300 text-gray-700 focus:ring-indigo-400"
                }`}
              />
              
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white transition-colors duration-300 disabled:opacity-50"
              style={{ background: "#0d1145" }}
              onMouseEnter={(e) =>
                !loading && (e.currentTarget.style.background = "#1a2272")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#0d1145")
              }
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Footer */}
          <p
            className={`text-center text-xs mt-6 ${
              darkMode ? "text-gray-400" : "text-gray-400"
            }`}
          >
            Don't have any account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-indigo-600 cursor-pointer hover:underline font-medium"
            >
              Create an account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;