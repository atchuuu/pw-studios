import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import pwLogo from '../assets/pw-logo.png';
import { API_BASE_URL } from '../utils/apiConfig';

const Login = () => {
    const { loginWithToken, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const errorParam = params.get('error');

        if (errorParam) {
            setError(errorParam);
        }

        if (token && !user) {
            setLoading(true);
            loginWithToken(token).then((res) => {
                if (!res.success) {
                    setError(res.error);
                    setLoading(false);
                }
            });
        }
    }, [location, loginWithToken, user]);

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
        <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden transition-colors duration-300">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[128px] mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            <div className="max-w-md w-full mx-4 space-y-8 glass-card p-10 rounded-3xl shadow-2xl relative z-10 border border-white/10 backdrop-blur-xl">
                <div>
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/20 shadow-lg backdrop-blur-sm">
                            <img src={pwLogo} alt="PW Logo" className="h-16 w-auto drop-shadow-lg" />
                        </div>
                        <h2 className="mt-2 text-center text-4xl font-display font-extrabold text-white tracking-tight">
                            PW Studios
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-400 font-light">
                            Premium recording spaces for educators
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl backdrop-blur-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-200 font-medium">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 space-y-6">
                    <div className="text-center">
                        <p className="text-gray-300 mb-6">Sign in with your work email to continue</p>
                        <button
                            onClick={handleGoogleLogin}
                            className="group relative w-full flex justify-center items-center py-4 px-4 border border-white/10 text-base font-bold rounded-xl text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                        >
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FaGoogle className="h-5 w-5 text-white group-hover:text-brand-300 transition-colors" />
                            </div>
                            Sign in with Google
                        </button>
                    </div>

                    <div className="text-center text-xs text-gray-500 mt-6 border-t border-white/5 pt-6">
                        Allowed domains: <span className="text-gray-400 font-mono">@pw.live</span> & <span className="text-gray-400 font-mono">@physicswallah.org</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
