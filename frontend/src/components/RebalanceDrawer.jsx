import React, { useEffect } from "react";
import AllocationComparisonTable from "./AllocationComparisonTable";
import SuggestionCard from "./SuggestionCard";

// 1. Import your brand new hook!
import useRebalanceSuggestions from "../hooks/useRebalanceSuggestions";

const RebalanceDrawer = ({ isOpen, onClose }) => {
  // 2. Call the hook to get the REAL data
  const { currentWeights, targetWeights, suggestions, isLoading, error } =
    useRebalanceSuggestions(isOpen);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Check if we actually have data to show in the table
  const hasWeights = currentWeights && Object.keys(currentWeights).length > 0;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#1B3C53]">
            Rebalance Portfolio
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 font-bold text-xl px-2"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
          {/* F2-2 Requirement: Show an inline error message if it fails */}
          {error && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          {/* Show a loading spinner while waiting for Aabel's API */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#234C6A] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[#1B3C53] font-bold">
                Analyzing portfolio drift...
              </p>
            </div>
          ) : (
            <>
              {/* Pass the REAL data to the table */}
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Allocation Overview
              </h3>
              {hasWeights ? (
                <AllocationComparisonTable
                  currentWeights={currentWeights}
                  targetWeights={targetWeights}
                />
              ) : (
                <p className="text-gray-500 text-sm text-center py-4 italic border border-dashed border-gray-200 rounded-lg">
                  No allocation data available yet.
                </p>
              )}

              {/* Pass the REAL data to the Action Cards */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Recommended Actions
                </h3>

                {suggestions && suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <SuggestionCard
                      key={index}
                      // Use optional chaining and map backend fields to component props
                      action={suggestion.action}
                      symbol={suggestion.symbol || suggestion.asset_type}
                      quantity={suggestion.qty_change || suggestion.quantity}
                      estimatedValue={
                        suggestion.estimated_value || suggestion.estimatedValue
                      }
                      driftImpact={
                        suggestion.drift_impact || suggestion.driftImpact
                      }
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-4xl mb-2">✅</span>
                    <p className="text-green-800 font-bold text-lg">
                      Portfolio is balanced
                    </p>
                    <p className="text-green-600 text-sm">
                      No actions required at this time.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default RebalanceDrawer;
