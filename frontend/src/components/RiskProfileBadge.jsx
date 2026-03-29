import React from "react";

const RiskProfileBadge = ({ riskProfile, size = "md" }) => {
  // 1. Set up the colors based on the risk profile
  const colors = {
    conservative: "bg-blue-100 text-blue-800 border-blue-200",
    moderate: "bg-amber-100 text-amber-800 border-amber-200",
    aggressive: "bg-red-100 text-red-800 border-red-200",
  };

  // 2. Set up the sizes (small, medium, large)
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  // 3. Fallback in case someone passes wrong data
  const currentRisk = riskProfile ? riskProfile.toLowerCase() : "moderate";
  const colorClass = colors[currentRisk] || colors.moderate;
  const sizeClass = sizes[size] || sizes.md;

  // 4. Return the HTML structure for the sticker
  return (
    <span
      className={`inline-flex items-center justify-center border font-medium rounded-full ${colorClass} ${sizeClass}`}
    >
      {/* This capitalizes the first letter so 'moderate' becomes 'Moderate' */}
      {currentRisk.charAt(0).toUpperCase() + currentRisk.slice(1)}
    </span>
  );
};

export default RiskProfileBadge;
