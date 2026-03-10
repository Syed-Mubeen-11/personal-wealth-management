import API from './api';

/**
 * Helper to extract error messages from FastAPI responses
 */
const handleError = (error) => {
  const detail = error.response?.data?.detail;
  if (detail) {
    if (Array.isArray(detail)) {
      return detail.map(err => `${err.loc[1]}: ${err.msg}`).join(', ');
    }
    if (typeof detail === 'object') {
      return JSON.stringify(detail);
    }
    return detail;
  }
  return error.message || "A connection error occurred. Please try again.";
};

export const register = async (userData) => {
  try {
    const response = await API.post('/register', userData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const login = async (credentials) => {
  try {
    const response = await API.post('/login', credentials);
    
    // IMPORTANT: Match this key with what ProtectedRoute and api.js use
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      // Optional: Store expiry or user info if your backend sends it
    }
    
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Checks if the user is authenticated based on token presence
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

export const logout = () => {
  // Clear everything related to auth
  localStorage.removeItem('access_token');
  // Use replace to prevent back-button navigation to protected pages
  window.location.replace('/login');
};