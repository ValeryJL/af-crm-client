import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiClient from '../api/client';

interface AuthContextType {
    token: string | null;
    user: any | null; // Placeholder for user object
    theme: 'light' | 'dark';
    login: (token: string, user: any) => void;
    logout: () => void;
    toggleTheme: () => void;
    updateUser: (newData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<any | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme');
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const userObj = JSON.parse(savedUser);
            if (userObj.theme) return userObj.theme;
        }
        return (savedTheme as 'light' | 'dark') || 'light';
    });

    // Fetch latest config from backend on mount/reload
    useEffect(() => {
        const fetchLatestConfig = async () => {
            if (!token) return;
            try {
                const response = await apiClient.get('/users/me/config');
                const config = response.data;

                // Sync theme
                if (config.theme) {
                    setTheme(config.theme);
                    localStorage.setItem('theme', config.theme);
                }

                // Sync full user object
                setUser((prev: any) => {
                    const updated = { ...prev, ...config };
                    localStorage.setItem('user', JSON.stringify(updated));
                    return updated;
                });
            } catch (error) {
                console.error('Failed to sync user config with backend:', error);
            }
        };

        fetchLatestConfig();
    }, [token]);

    // Apply theme to document root
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        if (token) {
            try {
                await apiClient.put('/users/me/config', { theme: newTheme });
                // Use functional update to avoid stale user state
                setUser((prevUser: any) => {
                    const updated = { ...prevUser, theme: newTheme };
                    localStorage.setItem('user', JSON.stringify(updated));
                    return updated;
                });
            } catch (error) {
                console.error('Failed to persist theme to backend:', error);
            }
        }
    };

    const updateUser = (newData: any) => {
        setUser((prevUser: any) => {
            const updated = { ...prevUser, ...newData };
            localStorage.setItem('user', JSON.stringify(updated));
            // If theme is updated, also update the theme state
            if (newData.theme) {
                setTheme(newData.theme);
                localStorage.setItem('theme', newData.theme);
            }
            return updated;
        });
    };

    const login = (newToken: string, userData: any) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.theme) {
            setTheme(userData.theme);
            localStorage.setItem('theme', userData.theme);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTheme('light');
        localStorage.removeItem('theme');
    };

    return (
        <AuthContext.Provider value={{ token, user, theme, login, logout, toggleTheme, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
