import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('soc_token');
        const stored = localStorage.getItem('soc_user');
        if (token && stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('soc_token', data.token);
        localStorage.setItem('soc_user', JSON.stringify(data.user));
        setUser(data.user);
        return data;
    };

    const register = async (formData) => {
        const { data } = await api.post('/auth/register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    };

    const logout = () => {
        localStorage.removeItem('soc_token');
        localStorage.removeItem('soc_user');
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'soc_manager';
    const isAnalyst = user?.role === 'soc_analyst';

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isManager, isAnalyst }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
