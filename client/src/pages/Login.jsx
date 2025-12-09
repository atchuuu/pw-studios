import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import pwLogo from '../assets/pw-logo.png';
import { API_BASE_URL } from '../utils/apiConfig';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

// Doodle Components
const AtomDoodle = ({ className, ...props }) => (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...props}>
        <ellipse cx="50" cy="50" rx="45" ry="15" transform="rotate(0 50 50)" />
        <ellipse cx="50" cy="50" rx="45" ry="15" transform="rotate(60 50 50)" />
        <ellipse cx="50" cy="50" rx="45" ry="15" transform="rotate(120 50 50)" />
        <circle cx="50" cy="50" r="5" fill="currentColor" />
    </svg>
);

const MathDoodle = ({ className, ...props }) => (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...props}>
        <path d="M10,90 Q50,10 90,90" />
        <text x="50" y="40" fontSize="20" fill="currentColor" textAnchor="middle">y = x²</text>
        <path d="M10,10 L10,90 L90,90" />
    </svg>
);

const FormulaDoodle = ({ className, ...props }) => (
    <svg viewBox="0 0 200 100" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...props}>
        <text x="100" y="60" fontSize="40" fill="currentColor" textAnchor="middle" fontFamily="serif" fontStyle="italic">E = mc²</text>
    </svg>
);

const GeometricDoodle = ({ className, ...props }) => (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...props}>
        <rect x="20" y="20" width="60" height="60" transform="rotate(15 50 50)" />
        <circle cx="50" cy="50" r="40" />
        <path d="M50,10 L90,90 L10,90 Z" transform="rotate(-15 50 50)" />
    </svg>
);

const FlaskDoodle = ({ className, ...props }) => (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...props}>
        <path d="M35,20 L35,40 L15,90 L85,90 L65,40 L65,20 Z" />
        <path d="M35,20 L65,20" />
        <circle cx="40" cy="70" r="3" fill="currentColor" />
        <circle cx="60" cy="80" r="2" fill="currentColor" />
        <circle cx="50" cy="60" r="2" fill="currentColor" />
    </svg>
);

const BeakerDoodle = ({ className, ...props }) => (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...props}>
        <path d="M25,20 L25,85 Q25,95 35,95 L65,95 Q75,95 75,85 L75,20" />
        <path d="M20,20 L80,20" />
        <line x1="25" y1="35" x2="40" y2="35" />
        <line x1="25" y1="50" x2="40" y2="50" />
        <line x1="25" y1="65" x2="40" y2="65" />
    </svg>
);

const MoleculeDoodle = ({ className, ...props }) => (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...props}>
        <circle cx="50" cy="50" r="10" />
        <circle cx="20" cy="30" r="8" />
        <circle cx="80" cy="30" r="8" />
        <circle cx="50" cy="85" r="8" />
        <line x1="43" y1="45" x2="26" y2="34" />
        <line x1="57" y1="45" x2="74" y2="34" />
        <line x1="50" y1="60" x2="50" y2="77" />
    </svg>
);

const DOODLE_TYPES = [AtomDoodle, MathDoodle, FormulaDoodle, GeometricDoodle, FlaskDoodle, BeakerDoodle, MoleculeDoodle];
const DOODLE_COLORS = ['text-brand-900', 'text-blue-900', 'text-purple-900', 'text-orange-900', 'text-pink-900', 'text-indigo-900', 'text-emerald-900', 'text-rose-900'];

const InteractiveDoodles = () => {
    // Generate initial random doodles
    const initialDoodles = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            Component: DOODLE_TYPES[Math.floor(Math.random() * DOODLE_TYPES.length)],
            x: Math.random() * 100, // percentage
            y: Math.random() * 100, // percentage
            size: 60 + Math.random() * 100,
            rotation: Math.random() * 360,
            color: DOODLE_COLORS[Math.floor(Math.random() * DOODLE_COLORS.length)],
            vx: (Math.random() - 0.5) * 0.2, // velocity
            vy: (Math.random() - 0.5) * 0.2,
        }));
    }, []);

    const [doodles, setDoodles] = useState(initialDoodles);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isPressed, setIsPressed] = useState(false);
    const requestRef = useRef();

    // Track mouse position
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        const handleMouseDown = () => setIsPressed(true);
        const handleMouseUp = () => setIsPressed(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Animation Loop
    const animate = () => {
        setDoodles(prevDoodles => {
            return prevDoodles.map(doodle => {
                let { x, y, vx, vy, size, rotation, id } = doodle;

                // Convert percentage to pixels for physics calc
                const px = (x / 100) * window.innerWidth;
                const py = (y / 100) * window.innerHeight;

                // Repulsion from mouse
                const dx = px - mousePos.x;
                const dy = py - mousePos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const repulsionRadius = 250;

                if (dist < repulsionRadius) {
                    const force = (repulsionRadius - dist) / repulsionRadius;
                    const angle = Math.atan2(dy, dx);
                    vx += Math.cos(angle) * force * 0.5;
                    vy += Math.sin(angle) * force * 0.5;
                }

                // Long Press Expansion logic
                let currSize = size;
                if (isPressed) {
                    currSize += 2; // Growth rate
                } else {
                    // Slowly return to original size if not pressed? 
                    // Or keep growing until explode. The requirement says "expand... after a certain level... explode"
                    // Let's make them shrink back if released before explosion to feel organic
                    if (currSize > (60 + Math.random() * 100)) { // rough heuristic for original size
                        currSize -= 1;
                    }
                }

                // Explode logic (scale > 3x original roughly, let's say 300px max)
                if (currSize > 350) {
                    // Reset
                    return {
                        ...doodle,
                        x: Math.random() * 100,
                        y: Math.random() * 100,
                        size: 60 + Math.random() * 40, // Reset to small
                        vx: (Math.random() - 0.5) * 0.5,
                        vy: (Math.random() - 0.5) * 0.5
                    };
                }

                // Apply velocity
                x += vx * 0.2; // scale down velocity for percentage
                y += vy * 0.2;
                rotation += 0.2;

                // Friction
                vx *= 0.98;
                vy *= 0.98;

                // Bounce off walls (wrap around feels better for floating)
                if (x < -10) x = 110;
                if (x > 110) x = -10;
                if (y < -10) y = 110;
                if (y > 110) y = -10;

                return { ...doodle, x, y, vx, vy, rotation, size: currSize };
            });
        });

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [mousePos, isPressed]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            {doodles.map((doodle) => (
                <div
                    key={doodle.id}
                    className={`absolute ${doodle.color}`}
                    style={{
                        left: `${doodle.x}%`,
                        top: `${doodle.y}%`,
                        width: `${doodle.size}px`,
                        height: `${doodle.size}px`,
                        transform: `translate(-50%, -50%) rotate(${doodle.rotation}deg)`,
                        transition: 'width 0.1s linear, height 0.1s linear' // Smooth growth
                    }}
                >
                    <doodle.Component className="w-full h-full" />
                </div>
            ))}
        </div>
    );
};

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
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden font-sans select-none">

            {/* Interactive Doodles Background */}
            <InteractiveDoodles />

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-md w-full mx-4 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 relative z-10"
            >
                <div>
                    <div className="flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-md border border-gray-100 p-2"
                        >
                            <img src={pwLogo} alt="PW Logo" className="h-full w-auto object-contain" />
                        </motion.div>
                        <h2 className="mt-2 text-center text-3xl font-bold text-gray-900 tracking-tight">
                            Welcome Back!
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-500">
                            Access the PW Studios dashboard
                        </p>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md"
                    >
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="mt-8 space-y-6">
                    <div className="text-center">
                        <button
                            onClick={handleGoogleLogin}
                            className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-gray-300 text-base font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                        >
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FaGoogle className="h-5 w-5 text-gray-500 group-hover:text-brand-600 transition-colors" />
                            </div>
                            Sign in with Google
                        </button>
                    </div>

                    <div className="mt-6 relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Authorized Access Only</span>
                        </div>
                    </div>

                    <div className="text-center text-xs text-gray-400 mt-6">
                        Allowed domains: <span className="font-mono text-gray-600">@pw.live</span> & <span className="font-mono text-gray-600">@physicswallah.org</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
