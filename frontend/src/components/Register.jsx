import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) return alert("Fill all fields");
    if (password !== confirm) return alert("Passwords do not match");

    const user = { name, email, password };
    // Saving to localStorage just like your old code
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("username", name);
    
    // Redirecting to dashboard after successful registration
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-300 via-purple-200 to-purple-400">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96">
        <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">Register</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <input 
            type="text" 
            placeholder="Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
          />
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
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirm} 
            onChange={e => setConfirm(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
          />
          <button 
            type="submit" 
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition duration-300"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account? <Link to="/" className="text-purple-600 font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;