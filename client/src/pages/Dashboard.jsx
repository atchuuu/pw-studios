import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { API_BASE_URL } from '../utils/apiConfig';
import defaultCover from '../assets/profile-banner.png';

const Dashboard = () => {
    const { user } = useAuth();
    const { selectedCity, setSelectedCity, userLocation, isNearMe, searchKeyword, setSearchKeyword } = useLocationContext();
    const [studios, setStudios] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };

                if (isNearMe && userLocation) {
                    // Fetch nearest studios
                    const recRes = await axios.get(`${API_BASE_URL}/studios/recommendations?lat=${userLocation.lat}&lng=${userLocation.lng}`, config);
                    setStudios(Array.isArray(recRes.data) ? recRes.data : []);
                } else {
                    // Fetch normal filtered list
                    let query = `?keyword=${searchKeyword}`;
                    if (userLocation && userLocation.lat && userLocation.lng) {
                        query += `&lat=${userLocation.lat}&lng=${userLocation.lng}`;
                    } else {
                        query += `&sort=city`;
                    }

                    if (selectedCity && selectedCity !== 'Near Me') {
                        query += `&city=${selectedCity}`;
                    }

                    const studioRes = await axios.get(`${API_BASE_URL}/studios${query}`, config);
                    setStudios(Array.isArray(studioRes.data) ? studioRes.data : []);
                }
            } catch (error) {
                console.error(error);
            }
        };
        if (user) fetchData();
    }, [user, searchKeyword, selectedCity, userLocation, isNearMe]);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            {/* Hero Section */}
            <div className="bg-[#1B2124] text-white py-16 px-4 sm:px-6 lg:px-8 mb-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="w-96 h-96 bg-[#5A4BDA] rounded-full blur-3xl absolute -top-20 -left-20"></div>
                    <div className="w-96 h-96 bg-[#D9D9D9] rounded-full blur-3xl absolute bottom-0 right-0 opacity-20"></div>
                </div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-4xl sm:text-6xl font-extrabold mb-4 tracking-tight"
                    >
                        <span className="text-white">Physics</span> <span className="text-[#5A4BDA]">Wallah</span> <span className="text-white">Studios</span>
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-300 max-w-2xl mx-auto"
                    >
                        Premium recording spaces for our educators.
                    </motion.p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">




                {/* Results Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {isNearMe ? (
                            <>
                                <FaMapMarkerAlt className="text-red-500" /> Studios Near You
                            </>
                        ) : (
                            <>
                                All Studios <span className="text-sm font-normal text-gray-500 ml-2">({studios.length})</span>
                            </>
                        )}
                    </h2>
                </div>

                {/* Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence>
                        {Array.isArray(studios) && studios.map((studio) => {
                            // Calculate distance if user location is available
                            const distance = userLocation && studio.lat && studio.lng
                                ? calculateDistance(userLocation.lat, userLocation.lng, studio.lat, studio.lng)
                                : studio.distance ? studio.distance / 1000 : null; // Fallback to backend distance if available

                            return (
                                <motion.div
                                    key={studio._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden group flex flex-col h-full"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={studio.coverPhoto ? (studio.coverPhoto.startsWith('http') || studio.coverPhoto.startsWith('/assets') ? studio.coverPhoto : `${API_BASE_URL}${studio.coverPhoto}`) : defaultCover}
                                            alt={studio.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                        {distance !== null && (
                                            <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 dark:text-white shadow-sm flex items-center gap-1">
                                                <FaMapMarkerAlt className="text-red-500" />
                                                {distance.toFixed(1)} km
                                            </div>
                                        )}

                                        <div className="absolute bottom-3 left-3 right-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                            <Link
                                                to={`/studios/${studio._id}`}
                                                className="block w-full text-center bg-primary text-white py-2 rounded-lg font-semibold shadow-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                Book Now
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-grow flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                            {studio.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 h-10">
                                            {studio.address}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                                                {studio.city}
                                            </span>
                                            <span className="text-primary font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                                Studios: {studio.numStudios}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>

                {studios.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 dark:text-gray-400 text-xl">No studios found.</p>
                        <button
                            onClick={() => {
                                setSearchKeyword('');
                                setSelectedCity('');
                            }}
                            className="mt-4 text-primary hover:underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
