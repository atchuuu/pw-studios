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
                            <div className="flex-1 max-w-2xl mx-4 flex items-center gap-2 relative z-50">
                                <div className="relative hidden md:block w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        placeholder="Search studios..."
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors duration-200"
                                    />
                                    <AnimatePresence>
                                        {showSuggestions && suggestions.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                                            >
                                                {suggestions.map((studio) => (
                                                    <Link
                                                        key={studio._id}
                                                        to={`/studios/${studio._id}`}
                                                        className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                                                    >
                                                        <div className="font-medium text-gray-900 dark:text-white">{studio.name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{studio.city}</div>
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <button
                                    onClick={() => setShowFilterModal(true)}
                                    className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                                    title="Advanced Filters"
                                >
                                    <FaFilter />
                                </button>
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
                                    className="mt-4 flex items-center gap-2 text-primary font-semibold hover:underline"
                                >
                                    <FaLocationArrow /> {locationLoading ? 'Detecting...' : 'Detect my location'}
                                </button>
                            </div>

                            {/* Popular Cities */}
                            <div className="p-8 bg-gray-50 dark:bg-gray-900/50 overflow-y-auto custom-scrollbar flex-1">
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6 text-center">Our Current Cities</h3>
                                {loadingCities ? (
                                    <div className="text-center py-12 text-gray-500">Loading cities...</div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                        {cities.map(city => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    setSelectedCity(city === 'All Locations' ? '' : city);
                                                    setShowCityModal(false);
                                                }}
                                                className={`
                                                    group flex flex-col items-center justify-center p-6 rounded-2xl border transition-all aspect-square
                                                    ${(selectedCity === city || (city === 'All Locations' && selectedCity === ''))
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

            {/* Filter Modal */}
            <AnimatePresence>
                {showFilterModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h3>
                                <button onClick={() => setShowFilterModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Distance Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance Range</label>
                                    <div className="flex gap-2">
                                        {[
                                            { label: '< 5km', min: 0, max: 5 },
                                            { label: '5-10km', min: 5, max: 10 },
                                            { label: '> 10km', min: 10, max: 5000 }
                                        ].map((range) => (
                                            <button
                                                key={range.label}
                                                onClick={() => setFilters({ ...filters, minDistance: range.min, maxDistance: range.max })}
                                                className={`px-3 py-1.5 rounded-lg text-sm border ${filters.minDistance === range.min && filters.maxDistance === range.max
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                                                    }`}
                                            >
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Availability Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="date"
                                            value={filters.date}
                                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <input
                                            type="time"
                                            value={filters.time}
                                            onChange={(e) => setFilters({ ...filters, time: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Num Studios */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Studios</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={filters.numStudios}
                                        onChange={(e) => setFilters({ ...filters, numStudios: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* Facilities */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Facilities</label>
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
                                                className={`px-3 py-1.5 rounded-lg text-sm border ${filters.facilities.includes(facility)
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                                                    }`}
                                            >
                                                {facility}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                                <button
                                    onClick={() => setFilters({
                                        minDistance: 0,
                                        maxDistance: 5000,
                                        date: '',
                                        time: '',
                                        numStudios: 0,
                                        facilities: []
                                    })}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700"
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
