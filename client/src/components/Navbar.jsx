import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import pwLogo from '../assets/pw-logo.png';
import ThemeToggle from './ThemeToggle';
import {
    FaMapMarkerAlt, FaChevronDown, FaSearch, FaLocationArrow,
    FaLandmark, FaBuilding, FaLaptopCode, FaCity, FaBars, FaTimes,
    FaCalendarAlt, FaUserShield, FaSignOutAlt, FaUser
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../utils/apiConfig';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { selectedCity, setSelectedCity, detectLocation, locationLoading, searchKeyword, setSearchKeyword } = useLocationContext();
    const navigate = useNavigate();
    const [showCityModal, setShowCityModal] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [cities, setCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);

    useEffect(() => {
        if (showCityModal) {
            const fetchCities = async () => {
                setLoadingCities(true);
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const res = await axios.get(`${API_BASE_URL}/studios/cities`, config);
                    setCities(res.data.sort());
                } catch (error) {
                    console.error("Failed to fetch cities", error);
                } finally {
                    setLoadingCities(false);
                }
            };
            if (user) fetchCities();
        }
    }, [showCityModal, user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowSidebar(false);
    };

    // Load all city images from assets/cities
    const cityImagesGlob = import.meta.glob('../assets/cities/*.{png,jpg,jpeg,svg}', { eager: true });

    // Create a map of city name -> image path
    const cityImages = Object.keys(cityImagesGlob).reduce((acc, path) => {
        const fileName = path.split('/').pop().split('.')[0];
        acc[fileName.toLowerCase()] = cityImagesGlob[path].default;
        return acc;
    }, {});

    // City Icons Mapping
    const cityIconMap = {
        'Delhi': <FaLandmark className="text-3xl mb-2 text-gray-800 dark:text-gray-200 group-hover:scale-110 transition-transform" />,
        'Noida': <FaBuilding className="text-3xl mb-2 text-gray-800 dark:text-gray-200 group-hover:scale-110 transition-transform" />,
        'Bengaluru': <FaLaptopCode className="text-3xl mb-2 text-gray-800 dark:text-gray-200 group-hover:scale-110 transition-transform" />,
    };

    const getCityVisual = (city) => {
        const imageSrc = cityImages[city.toLowerCase()];
        if (imageSrc) {
            return <img src={imageSrc} alt={city} className="w-12 h-12 object-contain mb-2 group-hover:scale-110 transition-transform grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100" />;
        }
        if (cityIconMap[city]) {
            return cityIconMap[city];
        }
        return <img src={pwLogo} alt={city} className="w-10 h-10 object-contain mb-2 opacity-50 group-hover:opacity-100 transition-opacity grayscale" />;
    };

    return (
        <>
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 gap-4">

                        {/* Left: Logo & Location */}
                        <div className="flex items-center gap-4 sm:gap-8 flex-shrink-0">
                            {/* Logo */}
                            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
                                <img className="h-8 sm:h-10 w-auto" src={pwLogo} alt="PW Studios" />
                                <span className="ml-3 font-bold text-lg sm:text-xl text-gray-900 dark:text-white hidden md:block">PW Studios</span>
                            </div>

                            {/* Location Button */}
                            {user && (
                                <button
                                    onClick={() => setShowCityModal(true)}
                                    className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-full"
                                >
                                    <FaMapMarkerAlt className="text-primary" />
                                    <span className="font-bold flex items-center gap-1 max-w-[100px] sm:max-w-none truncate">
                                        {selectedCity || 'Select City'} <FaChevronDown size={10} />
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Center: Search Bar */}
                        {user && (
                            <div className="flex-1 max-w-2xl mx-4">
                                <div className="relative group">
                                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search studios..."
                                        className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Right: Theme Toggle & Hamburger */}
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

                            <button
                                onClick={() => setShowSidebar(true)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                            >
                                <FaBars size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar / Drawer */}
            <AnimatePresence>
                {showSidebar && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                            onClick={() => setShowSidebar(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-[70] flex flex-col"
                        >
                            {/* Sidebar Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
                                <button
                                    onClick={() => setShowSidebar(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            {/* Sidebar Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {user && (
                                    <Link
                                        to="/profile"
                                        onClick={() => setShowSidebar(false)}
                                        className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl overflow-hidden">
                                            {user.profilePicture ? (
                                                <img
                                                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_SERVER_URL}${user.profilePicture}`}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                user.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                        </div>
                                    </Link>
                                )}

                                <div className="space-y-2">
                                    <Link
                                        to="/"
                                        onClick={() => setShowSidebar(false)}
                                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                                    >
                                        <FaSearch className="text-gray-400" /> Browse Studios
                                    </Link>
                                    <Link
                                        to="/bookings"
                                        onClick={() => setShowSidebar(false)}
                                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                                    >
                                        <FaCalendarAlt className="text-gray-400" /> My Bookings
                                    </Link>
                                    {user && (user.role === 'super_admin' || user.role === 'studio_admin') && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setShowSidebar(false)}
                                            className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                                        >
                                            <FaUserShield className="text-gray-400" /> Admin Dashboard
                                        </Link>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-gray-700 dark:text-gray-200 font-medium">Appearance</span>
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Footer */}
                            <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    <FaSignOutAlt /> Logout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* City Selection Modal (Unchanged logic, just ensuring it's here) */}
            <AnimatePresence>
                {showCityModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowCityModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                                <div className="relative">
                                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search for your city"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        detectLocation();
                                        setShowCityModal(false);
                                    }}
                                    className="mt-4 flex items-center gap-2 text-primary font-semibold hover:underline"
                                >
                                    <FaLocationArrow /> {locationLoading ? 'Detecting...' : 'Detect my location'}
                                </button>
                            </div>

                            {/* Popular Cities */}
                            <div className="p-8 bg-gray-50 dark:bg-gray-900/50 overflow-y-auto custom-scrollbar flex-1">
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6 text-center">Popular Cities</h3>
                                {loadingCities ? (
                                    <div className="text-center py-12 text-gray-500">Loading cities...</div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                        {cities.map(city => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    setSelectedCity(city);
                                                    setShowCityModal(false);
                                                }}
                                                className={`
                                                    group flex flex-col items-center justify-center p-6 rounded-2xl border transition-all aspect-square
                                                    ${selectedCity === city
                                                        ? 'border-primary bg-primary/5 text-primary shadow-md ring-2 ring-primary/20'
                                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1'
                                                    }
                                                `}
                                            >
                                                <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                                                    {getCityVisual(city)}
                                                </div>
                                                <span className="font-bold text-sm sm:text-base text-center">{city}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
