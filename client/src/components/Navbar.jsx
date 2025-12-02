import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import pwLogo from '../assets/pw-logo.png';
import ThemeToggle from './ThemeToggle';
import {
    FaMapMarkerAlt, FaChevronDown, FaSearch, FaLocationArrow,
    FaLandmark, FaBuilding, FaLaptopCode, FaCity, FaBars, FaTimes,
    FaCalendarAlt, FaUserShield, FaSignOutAlt, FaUser, FaGlobe, FaFilter
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../utils/apiConfig';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { selectedCity, setSelectedCity, detectLocation, locationLoading, searchKeyword, setSearchKeyword, filters, setFilters } = useLocationContext();
    const navigate = useNavigate();
    const [showCityModal, setShowCityModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [cities, setCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (showCityModal) {
            const fetchCities = async () => {
                setLoadingCities(true);
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const res = await axios.get(`${API_BASE_URL}/studios/cities`, config);
                    setCities(['All Locations', ...res.data.sort()]);
                } catch (error) {
                    console.error("Failed to fetch cities", error);
                } finally {
                    setLoadingCities(false);
                }
            };
            if (user) fetchCities();
        }
    }, [showCityModal, user]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchKeyword.length > 0) {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const res = await axios.get(`${API_BASE_URL}/studios?keyword=${searchKeyword}`, config);
                    setSuggestions(res.data.slice(0, 5)); // Limit to 5 suggestions
                    setShowSuggestions(true);
                } catch (error) {
                    console.error("Failed to fetch suggestions", error);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (user) fetchSuggestions();
        }, 300); // Debounce

        return () => clearTimeout(timeoutId);
    }, [searchKeyword, user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowSidebar(false);
    };

    // ... (cityImages logic remains same)
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
        if (city === 'All Locations') return <img src={pwLogo} alt="All Locations" width="48" height="48" className="w-12 h-12 object-contain mb-2 group-hover:scale-110 transition-transform opacity-80 group-hover:opacity-100" />;
        const imageSrc = cityImages[city.toLowerCase()];
        if (imageSrc) {
            return <img src={imageSrc} alt={city} width="48" height="48" className="w-12 h-12 object-contain mb-2 group-hover:scale-110 transition-transform grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 dark:invert dark:mix-blend-screen" />;
        }
        if (cityIconMap[city]) {
            return cityIconMap[city];
        }
        return <img src={pwLogo} alt={city} width="40" height="40" className="w-10 h-10 object-contain mb-2 opacity-50 group-hover:opacity-100 transition-opacity grayscale" />;
    };

    return (
        <>
            <nav className="glass sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20 gap-6">

                        {/* Left: Logo & Location */}
                        <div className="flex items-center gap-6 flex-shrink-0">
                            {/* Logo */}
                            <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => navigate('/')}>
                                <img className="h-10 w-auto group-hover:scale-105 transition-transform duration-300" src={pwLogo} alt="PW Studios" />
                                <span className="ml-3 font-display font-bold text-2xl text-gray-900 dark:text-white hidden md:block tracking-tight">PW Studios</span>
                            </div>

                            {/* Location Button */}
                            {user && (
                                <button
                                    onClick={() => setShowCityModal(true)}
                                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-all text-sm font-medium bg-gray-100/50 dark:bg-gray-800/50 hover:bg-brand-50 dark:hover:bg-brand-900/20 px-4 py-2.5 rounded-full border border-transparent hover:border-brand-200 dark:hover:border-brand-800"
                                >
                                    <FaMapMarkerAlt className="text-brand-500" />
                                    <span className="font-semibold flex items-center gap-1 max-w-[120px] sm:max-w-none truncate">
                                        {selectedCity || 'Select City'} <FaChevronDown size={10} className="opacity-50" />
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Center: Search Bar */}
                        {user && (
                            <div className="flex-1 max-w-2xl mx-4 flex items-center gap-3 relative z-50">
                                <div className="relative hidden md:block w-full group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        placeholder="Search studios..."
                                        className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 shadow-sm"
                                    />
                                    <AnimatePresence>
                                        {showSuggestions && suggestions.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                                className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl overflow-hidden z-50"
                                            >
                                                {suggestions.map((studio) => (
                                                    <Link
                                                        key={studio._id}
                                                        to={`/studios/${studio._id}`}
                                                        className="block px-5 py-3.5 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0 group"
                                                    >
                                                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{studio.name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                                            <FaMapMarkerAlt size={10} /> {studio.city}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <button
                                    onClick={() => setShowFilterModal(true)}
                                    className={`p-2.5 rounded-xl transition-all flex-shrink-0 border ${Object.keys(filters).some(k => filters[k] && (Array.isArray(filters[k]) ? filters[k].length > 0 : filters[k] !== 0))
                                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent'
                                        }`}
                                    title="Advanced Filters"
                                >
                                    <FaFilter />
                                </button>
                            </div>
                        )}

                        {/* Right: Theme Toggle & Hamburger */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                            >
                                <FaBars size={22} />
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
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                            onClick={() => setShowSidebar(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-[70] flex flex-col border-l border-gray-200 dark:border-gray-800"
                        >
                            {/* Sidebar Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Menu</h2>
                                <button
                                    onClick={() => setShowSidebar(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
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
                                        className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xl overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-sm">
                                            {user.profilePicture ? (
                                                <img
                                                    src={user.profilePicture.startsWith('http') || user.profilePicture.startsWith('/assets') ? user.profilePicture : `${API_BASE_URL}${user.profilePicture}`}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                user.name ? user.name.charAt(0) : 'U'
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
                                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-brand-900/10 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium"
                                    >
                                        <FaSearch className="text-gray-400" /> Browse Studios
                                    </Link>
                                    <Link
                                        to="/bookings"
                                        onClick={() => setShowSidebar(false)}
                                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-brand-900/10 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium"
                                    >
                                        <FaCalendarAlt className="text-gray-400" /> My Bookings
                                    </Link>
                                    {user && (user.role === 'super_admin' || user.role === 'studio_admin') && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setShowSidebar(false)}
                                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-brand-900/10 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium"
                                        >
                                            <FaUserShield className="text-gray-400" /> Admin Dashboard
                                        </Link>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-gray-700 dark:text-gray-200 font-medium">Appearance</span>
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Footer */}
                            <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 py-3.5 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <FaSignOutAlt /> Logout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* City Selection Modal */}
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
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative glass-card rounded-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col shadow-2xl"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
                                <div className="relative">
                                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search for your city"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
                                    />
                                    <button
                                        onClick={() => setShowCityModal(false)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                                <button
                                    onClick={async () => {
                                        try {
                                            await detectLocation();
                                            setShowCityModal(false);
                                        } catch (error) {
                                            console.error("Location detection failed:", error);
                                            if (error.code === 1) {
                                                toast.error("Location access denied. Please enable permissions in your browser settings.");
                                            } else if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
                                                toast.error("Location requires HTTPS. Please use the Ngrok URL.");
                                            } else {
                                                toast.error("Failed to detect location. Please try again.");
                                            }
                                        }
                                    }}
                                    className="mt-4 flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold hover:underline text-sm"
                                >
                                    <FaLocationArrow /> {locationLoading ? 'Detecting...' : 'Detect my location'}
                                </button>
                            </div>

                            {/* Popular Cities */}
                            <div className="p-8 bg-gray-50/50 dark:bg-gray-900/30 overflow-y-auto custom-scrollbar flex-1">
                                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6 text-center">Select Location</h3>
                                {loadingCities ? (
                                    <div className="text-center py-12 text-gray-500">Loading cities...</div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {cities.map(city => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    setSelectedCity(city === 'All Locations' ? '' : city);
                                                    setShowCityModal(false);
                                                }}
                                                className={`
                                                    group flex flex-col items-center justify-center p-4 rounded-2xl border transition-all aspect-square relative overflow-hidden
                                                    ${(selectedCity === city || (city === 'All Locations' && selectedCity === ''))
                                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 shadow-md ring-1 ring-brand-500/20'
                                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg hover:-translate-y-1'
                                                    }
                                                `}
                                            >
                                                <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                                                    {getCityVisual(city)}
                                                </div>
                                                <span className="font-bold text-sm text-center relative z-10">{city}</span>
                                                {(selectedCity === city || (city === 'All Locations' && selectedCity === '')) && (
                                                    <div className="absolute inset-0 bg-brand-500/5 dark:bg-brand-400/5 z-0" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Filter Modal */}
            <AnimatePresence>
                {showFilterModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
                                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Filters</h3>
                                <button onClick={() => setShowFilterModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="p-6 space-y-8 bg-white/30 dark:bg-gray-900/30">
                                {/* Distance Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Distance Range</label>
                                    <div className="flex gap-2">
                                        {[
                                            { label: '< 5km', min: 0, max: 5 },
                                            { label: '5-10km', min: 5, max: 10 },
                                            { label: '> 10km', min: 10, max: 5000 }
                                        ].map((range) => (
                                            <button
                                                key={range.label}
                                                onClick={() => setFilters({ ...filters, minDistance: range.min, maxDistance: range.max })}
                                                className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${filters.minDistance === range.min && filters.maxDistance === range.max
                                                    ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-500/30'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:border-brand-300 dark:hover:border-brand-700'
                                                    }`}
                                            >
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Availability Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Availability</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={filters.date}
                                                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                                            />
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={filters.time}
                                                onChange={(e) => setFilters({ ...filters, time: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Num Studios */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Min Studios</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={filters.numStudios}
                                        onChange={(e) => setFilters({ ...filters, numStudios: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                                    />
                                </div>

                                {/* Facilities */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Facilities</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Wi-Fi', 'Parking', 'AC', 'Green Screen', 'Soundproof'].map((facility) => (
                                            <button
                                                key={facility}
                                                onClick={() => {
                                                    const newFacilities = filters.facilities.includes(facility)
                                                        ? filters.facilities.filter(f => f !== facility)
                                                        : [...filters.facilities, facility];
                                                    setFilters({ ...filters, facilities: newFacilities });
                                                }}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filters.facilities.includes(facility)
                                                    ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:border-brand-300 dark:hover:border-brand-700'
                                                    }`}
                                            >
                                                {facility}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 dark:border-gray-700/50 flex justify-end gap-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
                                <button
                                    onClick={() => setFilters({
                                        minDistance: 0,
                                        maxDistance: 5000,
                                        date: '',
                                        time: '',
                                        numStudios: 0,
                                        facilities: []
                                    })}
                                    className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    className="px-8 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-semibold shadow-lg shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
