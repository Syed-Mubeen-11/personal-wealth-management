import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Shield,
  Scale,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    risk: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ---------------- VALIDATIONS ----------------

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const isPasswordValid =
    form.password.length >= 6 &&
    /[A-Z]/.test(form.password) &&
    /[a-z]/.test(form.password) &&
    /[0-9]/.test(form.password) &&
    /[^A-Za-z0-9]/.test(form.password);

  const isConfirmValid = form.password === form.confirm;

  const isFormValid =
    form.name && isEmailValid && isPasswordValid && isConfirmValid && form.risk;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setShowModal(true);
    setTimeout(() => setShowModal(false), 2000);
  };

  const riskOptions = [
    {
      id: "conservative",
      title: "Conservative",
      desc: "Stable returns, minimal risk exposure",
      icon: Shield,
    },
    {
      id: "balanced",
      title: "Balanced",
      desc: "Moderate risk with steady growth",
      icon: Scale,
    },
    {
      id: "aggressive",
      title: "Aggressive",
      desc: "High growth potential, higher volatility",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT PANEL (UNCHANGED) */}
      <div className="relative w-full md:w-1/2 flex items-center justify-center text-white p-10 overflow-hidden bg-gradient-to-br from-[#1B3C53] via-[#234C6A] to-[#456882]">
        <TrendingUp
          className="absolute top-16 left-20 opacity-10 animate-float-slow"
          size={80}
        />
        <DollarSign
          className="absolute bottom-20 right-24 opacity-10 animate-float-slow"
          size={70}
        />
        <BarChart3
          className="absolute top-32 right-40 opacity-10 animate-float-slow"
          size={75}
        />

        <TrendingUp
          className="absolute bottom-32 left-36 opacity-20 animate-float-medium"
          size={50}
        />
        <DollarSign
          className="absolute top-52 right-16 opacity-20 animate-float-medium"
          size={45}
        />
        <BarChart3
          className="absolute bottom-10 left-10 opacity-20 animate-float-medium"
          size={55}
        />

        <TrendingUp
          className="absolute top-10 right-10 opacity-30 animate-float-fast"
          size={30}
        />
        <DollarSign
          className="absolute bottom-12 right-44 opacity-30 animate-float-fast"
          size={28}
        />
        <BarChart3
          className="absolute top-60 left-44 opacity-30 animate-float-fast"
          size={32}
        />

        <div className="relative z-10 text-center max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Personalized Wealth Management
            <br />& Goal Tracker
          </h1>
          <p className="text-lg font-medium mb-4">
            Plan Smart. Track Progress. Grow Wealth.
          </p>
          <p className="text-sm opacity-80">
            Modern financial planning with clarity and confidence.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center bg-[#E3E3E3] p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6 text-[#1B3C53]">Register</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NAME */}
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#234C6A] outline-none"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            {/* EMAIL */}
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#234C6A] outline-none"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {form.email && !isEmailValid && (
                <p className="text-red-500 text-xs mt-1">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#234C6A] outline-none pr-10"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {form.password && !isPasswordValid && (
                <p className="text-red-500 text-xs mt-1">
                  Password must be at least 6 characters, include uppercase,
                  lowercase, number and special character.
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#234C6A] outline-none pr-10"
                  onChange={(e) =>
                    setForm({ ...form, confirm: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {form.confirm && !isConfirmValid && (
                <p className="text-red-500 text-xs mt-1">
                  Passwords do not match.
                </p>
              )}
            </div>

            {/* RISK PROFILE */}
            <div>
              <p className="mb-3 font-medium text-[#1B3C53]">
                Investment Risk Profile
              </p>

              <div className="grid grid-cols-3 gap-4">
                {riskOptions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setForm({ ...form, risk: item.id })}
                      className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all duration-200 ${
                        form.risk === item.id
                          ? "border-[#1B3C53] bg-[#E3E3E3]"
                          : "border-gray-200 hover:border-[#234C6A]"
                      }`}
                    >
                      <Icon className="mx-auto mb-2 text-[#234C6A]" size={24} />
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                isFormValid
                  ? "bg-[#1B3C53] text-white hover:bg-[#234C6A]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Register
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account? {" "}
            <Link to="/login" className="text-[#1B3C53] font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-green-600" size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2">Registration Successful</h3>
            <p className="text-gray-500">Welcome to Wealth Tracker</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes floatSlow {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes floatMedium {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes floatFast {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow { animation: floatSlow 6s infinite ease-in-out; }
        .animate-float-medium { animation: floatMedium 5s infinite ease-in-out; }
        .animate-float-fast { animation: floatFast 4s infinite ease-in-out; }
      `}</style>
    </div>
  );
}
