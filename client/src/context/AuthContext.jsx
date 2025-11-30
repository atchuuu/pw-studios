import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (userInfo) {
                setUser(userInfo); // Optimistic update

                try {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${userInfo.token}`,
                        },
                    };
                    const { data } = await axios.get(`${API_BASE_URL}/auth/me`, config);
                    // Combine fresh user data with existing token
                    const updatedUser = { ...data, token: userInfo.token };
                    setUser(updatedUser);
                    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                } catch (error) {
                    console.error("Failed to refresh user data", error);
                    if (error.response && error.response.status === 401) {
                        localStorage.removeItem('userInfo');
                        setUser(null);
                    }
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const loginWithToken = async (token) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.get(`${API_BASE_URL}/auth/me`, config);
            // Combine user data with token
            const userData = { ...data, token };
            setUser(userData);
            localStorage.setItem('userInfo', JSON.stringify(userData));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithToken, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
