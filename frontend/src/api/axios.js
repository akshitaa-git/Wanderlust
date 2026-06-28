import axios from 'axios';

const api = axios.create({
    baseURL: (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
        ? 'http://localhost:5001/api'
        : (import.meta.env.VITE_API_URL
            ? (import.meta.env.VITE_API_URL.endsWith('/api')
                ? import.meta.env.VITE_API_URL
                : `${import.meta.env.VITE_API_URL}/api`)
            : 'http://localhost:5001/api'),
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
