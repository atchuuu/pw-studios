import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { API_BASE_URL } from '../utils/apiConfig';
import { Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaStar, FaFilter } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useAuth();
    const { location, loadingLocation } = useLocationContext();
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [cities, setCities] = useState([]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/studios/cities`);
                setCities(data);
            } catch (error) {
                console.error("Failed to fetch cities", error);
            }
        };
        fetchCities();
    }, []);

    useEffect(() => {
        const fetchStudios = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                let url = `${API_BASE_URL}/studios?keyword=${searchTerm}`;
                if (selectedCity) {
                    url += `&city=${selectedCity}`;
                }

                // If no search/filter and location is available, fetch recommendations
                if (!searchTerm && !selectedCity && location.lat && location.lng) {
                    try {
                        const { data } = await axios.get(`${API_BASE_URL}/studios/recommendations?lat=${location.lat}&lng=${location.lng}`, config);
                        setStudios(data);
                    } catch (recError) {
                        console.error("Recommendation fetch failed, falling back to all studios", recError);
                        // Fallback
                        const { data } = await axios.get(url, config);
                        setStudios(data);
                    }
                } else {
                    const { data } = await axios.get(url, config);
                    setStudios(data);
                }
            } catch (error) {
                console.error("Failed to fetch studios", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchStudios();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedCity, location, user.token]);

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/400x300?text=No+Image';
        if (url.startsWith('http')) return url;
        return `${import.meta.env.VITE_SERVER_URL}${url}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Find Your Perfect <span className="text-primary">Studio</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Book professional recording spaces equipped with top-tier gear for your next big project.
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="mb-10 flex flex-col md:flex-row gap-4 justify-center items-center">
                    <div className="relative w-full max-w-md">
                        <FaSearch className="absolute top-3.5 left-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search studios..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative w-full md:w-64">
                        <FaFilter className="absolute top-3.5 left-4 text-gray-400" />
                        <select
                            className="w-full pl-12 pr-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary focus:outline-none appearance-none transition-all cursor-pointer"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                        >
                            <option value="">All Cities</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : studios.length === 0 ? (
                    <div className="text-center py-20">
                        <h3 className="text-xl text-gray-600 dark:text-gray-400">No studios found matching your criteria.</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {studios.map((studio) => (
                            <motion.div
                                key={studio._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={studio.coverPhoto ? getImageUrl(studio.coverPhoto) : (studio.images && studio.images.length > 0 ? getImageUrl(studio.images[0]) : getImageUrl(null))}
                                        alt={studio.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                        <FaStar className="text-yellow-400" /> 4.8
                                    </div>
                                    {studio.distance !== undefined && (
                                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                                            {(studio.distance / 1000).toFixed(1)} km away
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{studio.name}</h3>
                                    <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4 text-sm">
                                        <FaMapMarkerAlt className="mr-1.5 text-primary" />
                                        {studio.city}, {studio.area}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {studio.facilities.slice(0, 3).map((facility, idx) => (
                                            <span key={idx} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-md">
                                                {facility}
                                            </span>
                                        ))}
                                        {studio.facilities.length > 3 && (
                                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-md">
                                                +{studio.facilities.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    <Link
                                        to={`/studios/${studio._id}`}
                                        className="block w-full text-center bg-primary text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-primary/20"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
