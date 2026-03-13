const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8001';

export const marketService = {
  refreshPrices: async () => {
    const response = await fetch(`${API_BASE}/api/market-refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
};
