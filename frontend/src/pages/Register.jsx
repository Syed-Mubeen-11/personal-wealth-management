import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      alert("Registration Successful! Redirecting to login...");
      navigate('/login');
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

          <Link to="/login" className="hover:text-blue-600 transition">
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

      {/* REGISTER SECTION */}
      <div className="flex-grow flex items-center justify-center px-4 py-16 bg-gradient-to-r from-blue-50 to-indigo-50">

        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">

          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
            Create Your Account
          </h2>

          <p className="text-gray-500 text-center mb-8">
            Start tracking your wealth and financial goals today
          </p>

          {/* ERROR ALERT */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 text-sm flex flex-col shadow-sm">
              <span className="font-bold underline mb-1">Registration Error:</span>
              <span className="font-medium">
                {typeof error === 'object' ? JSON.stringify(error) : String(error)}
              </span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />

            <input
              type="text"
              placeholder="Phone Number"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
              onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
              required
            />

            <button
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition duration-300 shadow-md ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;