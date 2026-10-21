import axios from 'axios';

// Use a relative path so the browser sends it to the same origin (Nginx or Vite proxy)
const apiBaseUrl = '/api';

const apiClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor to add the JWT token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor to handle global errors (like 401 Unauthorized or 502 Gateway)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const currentPath = window.location.pathname;

        if (status === 401) {
            // Skip redirect if we're checking setup status or already on protected-from-redirect pages
            const url = error.config?.url || '';
            const isSetupCheck = url.includes('/setup-status');
            const isLoginPage = currentPath.includes('/login');
            const isSetupPage = currentPath.includes('/setup');
            const isRegisterPage = currentPath.includes('/register');
            const isUnavailablePage = currentPath.includes('/unavailable');

            if (!isSetupCheck && !isLoginPage && !isSetupPage && !isRegisterPage && !isUnavailablePage) {
                const hasToken = !!localStorage.getItem('token');
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                if (hasToken) {
                    window.location.href = '/login?expired=true';
                } else {
                    window.location.href = '/login';
                }
            }
        } else if (!status || (status >= 502 && status <= 504)) {
            // Backend is down (502/503/504) or network error (no status)
            if (!currentPath.includes('/unavailable')) {
                window.location.href = '/unavailable';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
