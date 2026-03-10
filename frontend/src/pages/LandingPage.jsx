import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6 bg-white shadow-sm">
        <div className="text-2xl font-bold text-blue-600">WealthTrack</div>

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

      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">

          <div className="space-y-6">
            <h1 className="text-5xl font-extrabold leading-tight">
              Take Control of <br /> Your Financial Future
            </h1>

            <p className="text-lg text-blue-100">
              WealthTrack helps you track your wealth, manage investments,
              monitor financial goals, and build long-term financial success —
              all in one powerful dashboard.
            </p>

            <div className="flex gap-4">
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow hover:scale-105 transition">
                Start Tracking
              </button>

              <button className="px-8 py-3 border border-white rounded-xl hover:bg-white hover:text-blue-600 transition">
                View Demo
              </button>
            </div>
          </div>

          {/* Dashboard Preview Box */}
          <div className="bg-white text-gray-700 rounded-3xl p-8 shadow-xl">
            <h3 className="font-bold text-lg mb-4">Wealth Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Assets</span>
                <span className="font-bold text-green-600">$124,000</span>
              </div>

              <div className="flex justify-between">
                <span>Monthly Savings</span>
                <span className="font-bold">$2,400</span>
              </div>

              <div className="flex justify-between">
                <span>Investments</span>
                <span className="font-bold text-blue-600">$78,200</span>
              </div>

              <div className="flex justify-between">
                <span>Goal Progress</span>
                <span className="font-bold text-purple-600">65%</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 px-10">
        <div className="max-w-7xl mx-auto">

          <h2 className="text-4xl font-bold text-center mb-14">
            Smart Tools for Wealth Building
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-blue-100 p-8 rounded-2xl shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-blue-700 mb-3">
                Wealth Dashboard
              </h3>

              <p className="text-gray-700">
                Monitor all your financial accounts, assets, and investments in
                one central dashboard with real-time financial insights.
              </p>
            </div>

            <div className="bg-green-100 p-8 rounded-2xl shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-green-700 mb-3">
                Goal Tracking
              </h3>

              <p className="text-gray-700">
                Track long-term financial goals like buying a house, retirement,
                or building an emergency fund with progress analytics.
              </p>
            </div>

            <div className="bg-purple-100 p-8 rounded-2xl shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-purple-700 mb-3">
                Investment Insights
              </h3>

              <p className="text-gray-700">
                Analyze portfolio performance and understand how your
                investments contribute to your wealth growth.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* GOALS SECTION */}
      <section className="bg-gray-100 py-20 px-10">
        <div className="max-w-7xl mx-auto">

          <h2 className="text-4xl font-bold text-center mb-14">
            Track Your Financial Goals
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-white p-8 rounded-2xl shadow">
              <h3 className="font-bold text-lg mb-3">🏠 Buy a Home</h3>
              <p className="text-gray-600">
                Save systematically and track your progress toward your dream
                home purchase.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow">
              <h3 className="font-bold text-lg mb-3">💰 Emergency Fund</h3>
              <p className="text-gray-600">
                Build a safety cushion to protect yourself from unexpected
                financial events.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow">
              <h3 className="font-bold text-lg mb-3">🏖 Retirement</h3>
              <p className="text-gray-600">
                Plan your retirement early and visualize your wealth growth
                over the years.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 px-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center">

          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="text-3xl font-bold text-blue-600">120K+</h3>
            <p className="text-gray-600">Assets Tracked</p>
          </div>

          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-3xl font-bold text-green-600">$500M+</h3>
            <p className="text-gray-600">Wealth Managed</p>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl">
            <h3 className="text-3xl font-bold text-purple-600">35K+</h3>
            <p className="text-gray-600">Financial Goals</p>
          </div>

          <div className="bg-yellow-50 p-6 rounded-xl">
            <h3 className="text-3xl font-bold text-yellow-600">98%</h3>
            <p className="text-gray-600">User Satisfaction</p>
          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-blue-600 text-white py-16 text-center">

        <h2 className="text-4xl font-bold mb-6">
          Start Building Your Wealth Today
        </h2>

        <p className="text-blue-100 mb-8">
          Join thousands of users who manage their finances smarter with
          WealthTrack.
        </p>

        <Link
          to="/register"
          className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
        >
          Create Free Account
        </Link>

      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6">
        © 2026 WealthTrack • Smart Financial Planning Platform
      </footer>
    </div>
  );
};

export default LandingPage;