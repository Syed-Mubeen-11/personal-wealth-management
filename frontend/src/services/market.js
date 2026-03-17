const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const marketService = {
  refreshPrices: async () => {
    const response = await fetch(`${API_BASE}/api/market-refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
};
