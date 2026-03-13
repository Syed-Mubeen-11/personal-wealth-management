import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:8001",
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');
    console.log("API Request:", config.method, config.url, "Token:", token ? "Present" : "Missing");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ADD THIS: Response interceptor to handle 401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('jwt'); // Clear the bad token
            window.location.href = '/login'; // Force re-login
        }
        return Promise.reject(error);
    }
);

export default api;