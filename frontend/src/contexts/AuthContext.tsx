import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';
import { api } from '../lib/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (credentials: RegisterRequest) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for stored token on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);

        setToken(response.token);
        setUser(response.user);

        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
    };

    const register = async (credentials: RegisterRequest) => {
        const response = await api.post<AuthResponse>('/auth/register', credentials);

        setToken(response.token);
        setUser(response.user);

        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
