import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const { data } = await axios.get(`${API_BASE_URL}/auth/me`, config);
                    setUser({ ...data, token });
                } catch (error) {
                    console.error("Auth check failed", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
        localStorage.setItem('token', data.token);
        setUser({ ...data, token: data.token });
    };

    const googleLogin = () => {
        window.location.href = `${API_BASE_URL}/auth/google?callback=${window.location.origin}`;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = (updatedUserData) => {
        setUser(prev => ({ ...prev, ...updatedUserData }));
    };

    return (
        <AuthContext.Provider value={{ user, login, googleLogin, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
