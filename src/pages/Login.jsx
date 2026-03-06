import { useState } from "react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false); // toggle between login and register

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-sky-300 via-purple-200 to-purple-400">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96">
        <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">
          {isRegister ? "Register" : "Login"}
        </h2>

        <form className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-gray-600 mb-1">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-sm text-purple-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {!isRegister && (
              <div className="text-right mt-1">
                <a
                  href="/forgot-password"
                  className="text-sm text-purple-600 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <p className="text-center text-sm text-gray-600 mt-4">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="text-purple-600 font-semibold hover:underline"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;