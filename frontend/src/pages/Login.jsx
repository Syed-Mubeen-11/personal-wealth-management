import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    login_id: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-10 py-5 bg-white shadow-sm">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          WealthTrack
        </Link>

        <div className="space-x-8 font-medium text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>

          <Link
            to="/login"
            className="text-blue-600 font-semibold"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* LOGIN SECTION */}
      <div className="flex-grow flex items-center justify-center px-4 py-16 bg-gradient-to-r from-blue-50 to-indigo-50">

        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Welcome Back
            </h2>

            <p className="text-gray-500 mt-2">
              Access your WealthTrack dashboard
            </p>
          </div>

          {/* ERROR BOX */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 text-sm">
              <p className="font-medium">Login Failed:</p>
              <p>{error}</p>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Username / Email / Phone
              </label>

              <input
                type="text"
                placeholder="Enter username, email, or phone"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                onChange={(e) =>
                  setFormData({ ...formData, login_id: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>

              <a
                href="#"
                className="text-blue-600 hover:underline font-medium"
              >
                Forgot Password?
              </a>
            </div>

            <button
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition duration-300 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
              }`}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

          </form>

          <div className="mt-8 text-center text-gray-600">
            <p>
              New to WealthTrack?{' '}
              <Link
                to="/register"
                className="text-blue-600 font-bold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;