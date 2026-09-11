import axios from 'axios';

// Priority: VITE_API_URL env var → hardcoded Render URL → dev proxy
const getBaseURL = () => {
    if (import.meta.env.DEV) {
        return '/api'; // Use Vite proxy in dev
    }
    let envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        // Fix common trailing slash or duplicate /api issues
        envUrl = envUrl.replace(/\/+$/, ''); // Remove trailing slashes
        if (envUrl.endsWith('/api')) return envUrl;
        return `${envUrl}/api`;
    }
    return 'https://estatexai.onrender.com/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 (token expired) → logout
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
