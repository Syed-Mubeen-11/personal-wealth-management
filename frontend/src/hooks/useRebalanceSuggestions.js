import { useState, useEffect } from "react";
import api from "../api";

const useRebalanceSuggestions = (isOpen) => {
  const [data, setData] = useState({
    currentWeights: {},
    targetWeights: {},
    suggestions: [],
    total_value: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchRebalanceData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Correct versioned path
        const response = await api.get("/api/v1/recommendations/rebalance");

        // If the backend returns 200 OK but with an empty/broken body,
        // handle it gracefully here
        const result = response.data || {};

        setData({
          currentWeights: result.current_weights || {},
          targetWeights: result.target_weights || {},
          suggestions: result.suggestions || [],
          total_value: result.total_value || 0,
        });
      } catch (err) {
        console.error("Failed to fetch rebalance data:", err);
        setError(
          "Could not load rebalance suggestions. Please check your Risk Profile and try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRebalanceData();
  }, [isOpen]);

  return { ...data, isLoading, error };
};

export default useRebalanceSuggestions;
