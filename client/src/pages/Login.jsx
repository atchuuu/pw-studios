import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import pwLogo from '../assets/pw-logo.png';
import { API_BASE_URL } from '../utils/apiConfig';

const Login = () => {
    const { loginWithToken } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const errorParam = params.get('error');

        if (errorParam) {
            setError(errorParam);
        }

        if (token) {
            setLoading(true);
            loginWithToken(token).then((res) => {
                if (res.success) {
                    navigate('/');
                } else {
                    setError(res.error);
                    setLoading(false);
                }
            });
        }
    }, [location, loginWithToken, navigate]);

    const handleGoogleLogin = () => {
        const callbackUrl = encodeURIComponent(window.location.origin);
        window.location.href = `${API_BASE_URL}/auth/google?callback=${callbackUrl}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl relative transition-colors duration-200">
                <div>
                    <div className="flex flex-col items-center">
                        <img src={pwLogo} alt="PW Logo" className="h-24 w-auto mb-4" />
                        <h2 className="mt-2 text-center text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            PW Studios
                        </h2>
                    </div>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Welcome back! Please sign in with your work email.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleGoogleLogin}
                        className="group relative w-full flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                        <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
                        Sign in with Google
                    </button>

                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
                        Only @pw.live and @physicswallah.org domains are allowed.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
