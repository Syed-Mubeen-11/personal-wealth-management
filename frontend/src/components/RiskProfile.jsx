import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaChartLine, FaInfoCircle } from "react-icons/fa";

const RiskProfile = () => {
  const [riskData, setRiskData] = useState({
    level: "Not Set",
    description: "Please complete your profile to see your investment strategy.",
    color: "text-gray-400"
  });

  useEffect(() => {
    // Pull the data saved from the Profile & Risk Management page
    const savedData = localStorage.getItem("profileData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      const level = parsed.riskLevel || "Moderate";
      
      // Map colors and descriptions based on the level
      const config = {
        Conservative: { 
          desc: "Prioritizes capital preservation. Best for short-term goals.", 
          color: "text-blue-600",
          bg: "bg-blue-50"
        },
        Moderate: { 
          desc: "A balanced approach seeking moderate growth with controlled risk.", 
          color: "text-purple-600",
          bg: "bg-purple-50"
        },
        Aggressive: { 
          desc: "Focuses on high capital growth. High tolerance for market swings.", 
          color: "text-red-600",
          bg: "bg-red-50"
        }
      };

      if (config[level]) {
        setRiskData({
          level: level,
          description: config[level].desc,
          color: config[level].color,
          bg: config[level].bg
        });
      }
    }
  }, []);

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
          <FaShieldAlt className="text-purple-600" /> Your Risk Profile
        </h2>
        <p className="text-gray-500">Analysis of your investment temperament.</p>
      </div>

      <div className={`p-8 rounded-3xl border-2 border-dashed border-purple-200 ${riskData.bg || 'bg-gray-50'}`}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white rounded-2xl shadow-sm">
            <FaChartLine className={`text-5xl ${riskData.color}`} />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className={`text-3xl font-black uppercase tracking-tight ${riskData.color}`}>
              {riskData.level}
            </h3>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-700 font-medium">
              <FaInfoCircle className="text-purple-400" />
              <span>Investment Strategy: <span className="font-bold">Balanced</span></span>
            </div>
            <p className="mt-4 text-gray-600 leading-relaxed">
              {riskData.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase mb-1">Volatility Tolerance</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${riskData.level === 'Aggressive' ? 'w-full bg-red-500' : riskData.level === 'Moderate' ? 'w-1/2 bg-purple-500' : 'w-1/4 bg-blue-500'}`}
            ></div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase mb-1">Time Horizon</p>
          <p className="text-purple-700 font-bold">5 - 10 Years</p>
        </div>
      </div>
    </div>
  );
};

export default RiskProfile;