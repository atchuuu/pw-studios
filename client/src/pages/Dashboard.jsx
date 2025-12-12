import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { API_BASE_URL } from '../utils/apiConfig';
import defaultCover from '../assets/profile-banner.png';
import StudioMap from '../components/StudioMap';
import StudioDetails from './StudioDetails';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { selectedCity, setSelectedCity, userLocation, isNearMe, searchKeyword, setSearchKeyword, filters, sortBy } = useLocationContext();

    const [studios, setStudios] = useState([]);
    const [showMap, setShowMap] = useState(false);
    const [showList, setShowList] = useState(true);
    const [selectedStudioId, setSelectedStudioId] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const listRef = useRef(null);
    const cardRefs = useRef({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };

                let query = `?keyword=${searchKeyword}`;

                // Add filters
                if (filters.minDistance !== undefined) query += `&minDistance=${filters.minDistance}`;
                if (filters.maxDistance !== undefined) query += `&maxDistance=${filters.maxDistance}`;
                if (filters.numStudios > 0) query += `&numStudios=${filters.numStudios}`;
                if (filters.facilities && filters.facilities.length > 0) query += `&facilities=${filters.facilities.join(',')}`;
                if (filters.date) query += `&date=${filters.date}`;
                if (filters.time) query += `&time=${filters.time}`;

                // Default Sort / Location Logic
                if (sortBy === 'nearest') {
                    if (userLocation && userLocation.lat && userLocation.lng) {
                        query += `&lat=${userLocation.lat}&lng=${userLocation.lng}`;
                    }
                } else {
                    // Handle explicit sorts
                    if (sortBy === 'capacity_high') query += `&sort=capacity`; // Descending
                    else if (sortBy === 'capacity_low') query += `&sort=capacity_asc`; // Ascending
                    else if (sortBy === 'alphabetical') query += `&sort=name`; // A-Z by Name
                }

                // Fallback for location if no sort specified and we have location
                if (!query.includes('sort') && !query.includes('lat') && userLocation && userLocation.lat) {
                    query += `&lat=${userLocation.lat}&lng=${userLocation.lng}`;
                }

                if (selectedCity && selectedCity !== 'Near Me') {
                    query += `&city=${selectedCity}`;
                }

                const studioRes = await axios.get(`${API_BASE_URL}/studios${query}`, config);
                let fetchedStudios = Array.isArray(studioRes.data) ? studioRes.data : [];

                setStudios(fetchedStudios);
            } catch (error) {
                console.error(error);
            }
        };
        if (user) fetchData();
    }, [user, searchKeyword, selectedCity, userLocation, isNearMe, filters, sortBy]);

    // Scroll to selected card when selectedStudioId changes
    useEffect(() => {
        if (selectedStudioId && cardRefs.current[selectedStudioId] && listRef.current) {
            cardRefs.current[selectedStudioId].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [selectedStudioId]);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371; // Radius of the earth in km
        const deg2rad = (deg) => deg * (Math.PI / 180);
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

    // List Logic: Show top 12 for "Near Me", otherwise show all
    const displayedStudios = (isNearMe || selectedCity === 'Near Me')
        ? studios.slice(0, 12)
        : studios;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-20 transition-colors duration-300">
            {/* Hero Section */}
            <div className="relative bg-dark-bg text-white overflow-hidden mb-12">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/30 rounded-full blur-[128px] mix-blend-screen animate-pulse-slow"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center z-10">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-5xl sm:text-7xl font-display font-extrabold mb-6 tracking-tight leading-tight"
                    >
                        <span className="text-white">Physics</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent">Wallah</span> <span className="text-white">Studios</span>
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="text-xl sm:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        Premium recording spaces designed for world-class education.
                    </motion.p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer" onClick={() => setShowMap(true)}>
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-900">
                        <img src="/pw-banner.png" alt="PW Banner" className="w-full h-full object-cover opacity-60" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 to-brand-800/60 backdrop-blur-[2px]"></div>
                    <div className="relative p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-center sm:text-left">
                            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">Find Your Nearest PW Studio</h2>
                            <p className="text-brand-100 text-lg max-w-xl">Explore all our premium recording spaces across the country. Locate the one closest to you.</p>
                        </div>
                        <button className="px-8 py-4 bg-white text-brand-600 rounded-xl font-bold text-lg shadow-lg hover:bg-brand-50 transition-colors flex items-center gap-3 group-hover:translate-x-1 duration-300">
                            <FaMapMarkerAlt /> Open Map View
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Modal */}
            <AnimatePresence>
                {showMap && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                            {/* Close Button */}
                            <button
                                onClick={() => setShowMap(false)}
                                className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-black/50 p-2 rounded-full text-gray-900 dark:text-white hover:bg-white dark:hover:bg-black transition-colors shadow-lg backdrop-blur-md"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>

                            {/* Map Area */}
                            <div className="w-full h-full">
                                <StudioMap
                                    studios={studios}
                                    userLocation={userLocation}
                                    selectedStudioId={selectedStudioId}
                                    onStudioClick={(studio) => setSelectedStudioId(studio ? studio._id : null)}
                                />
                            </div>

                            {/* Toggle List Button */}
                            <button
                                onClick={() => setShowList(!showList)}
                                className="absolute bottom-4 right-4 z-40 bg-white dark:bg-dark-card text-gray-900 dark:text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm transition-transform hover:scale-105"
                            >
                                {showList ? 'Hide List' : 'Show List'}
                            </button>

                            {/* Horizontal Studio List */}
                            <AnimatePresence>
                                {showList && (
                                    <motion.div
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 50, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        className="absolute bottom-0 left-0 right-0 z-30 p-4 pointer-events-none"
                                    >
                                        <div
                                            ref={listRef}
                                            className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x snap-mandatory custom-scrollbar pointer-events-auto items-end scroll-smooth"
                                            onScroll={(e) => {
                                                const container = e.target;
                                                if (window.scrollTimeout) clearTimeout(window.scrollTimeout);

                                                window.scrollTimeout = setTimeout(() => {
                                                    const center = container.scrollLeft + container.clientWidth / 2;
                                                    let closestStudio = null;
                                                    let minDistance = Infinity;

                                                    displayedStudios.forEach(studio => {
                                                        const card = cardRefs.current[studio._id];
                                                        if (card) {
                                                            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                                                            const distance = Math.abs(center - cardCenter);
                                                            if (distance < minDistance) {
                                                                minDistance = distance;
                                                                closestStudio = studio;
                                                            }
                                                        }
                                                    });

                                                    if (closestStudio && closestStudio._id !== selectedStudioId) {
                                                        if (!window.isProgrammaticScroll) {
                                                            setSelectedStudioId(closestStudio._id);
                                                        }
                                                    }
                                                }, 100);
                                            }}
                                        >
                                            {displayedStudios.map((studio, index) => (
                                                <motion.div
                                                    key={studio._id}
                                                    layoutId={`studio-card-${studio._id}`}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                                    ref={el => cardRefs.current[studio._id] = el}
                                                    onClick={() => setSelectedStudioId(studio._id)}
                                                    className={`
                                            flex-shrink-0 w-80 md:w-96 bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden snap-center transition-all duration-300 cursor-pointer border group
                                            ${selectedStudioId === studio._id
                                                            ? 'border-brand-500 ring-4 ring-brand-500/20 shadow-brand-500/20 scale-[1.02]'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-[1.01]'
                                                        }
                                        `}
                                                >
                                                    <div className="flex h-36 md:h-40">
                                                        <div className="w-36 md:w-40 h-full relative flex-shrink-0">
                                                            <img
                                                                src={studio.coverPhoto ? (studio.coverPhoto.startsWith('http') || studio.coverPhoto.startsWith('/assets') ? studio.coverPhoto : `${API_BASE_URL}${studio.coverPhoto}`) : defaultCover}
                                                                alt={studio.name}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            />
                                                        </div>
                                                        <div className="p-4 flex flex-col justify-between flex-grow min-w-0">
                                                            <div>
                                                                <h3 className="text-gray-900 dark:text-white font-bold text-base line-clamp-1 mb-1 group-hover:text-brand-600 transition-colors">{studio.name}</h3>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex items-start gap-1" title={studio.address}>
                                                                    <FaMapMarkerAlt className="text-brand-500 flex-shrink-0 text-xs mt-0.5" />
                                                                    <span className="truncate">{studio.address}</span>
                                                                </p>
                                                            </div>

                                                            <div className="flex gap-2 mt-2">
                                                                <a
                                                                    href={studio.googleMapLink || `https://www.google.com/maps/dir/?api=1&destination=${studio.lat},${studio.lng}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-semibold text-xs text-center transition-colors flex items-center justify-center gap-1"
                                                                >
                                                                    <FaMapMarkerAlt /> Map
                                                                </a>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedStudioId(studio._id);
                                                                        setShowDetailsModal(true);
                                                                    }}
                                                                    className="flex-[1.5] bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg font-semibold text-xs shadow-sm transition-colors"
                                                                >
                                                                    Book
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Studio Details Modal - THIS WAS MISSING BUT IT'S OK, JUST KEEPING BASIC STRUCTURE */}
            <AnimatePresence>
                {showDetailsModal && selectedStudioId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowDetailsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-dark-card w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="absolute top-6 right-6 z-50 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition-colors backdrop-blur-md"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            <StudioDetails studioId={selectedStudioId} isModal={true} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {isNearMe ? (
                                <>
                                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500">
                                        <FaMapMarkerAlt size={20} />
                                    </span>
                                    Studios Near You
                                </>
                            ) : (
                                <>
                                    All Studios <span className="text-lg font-medium text-gray-500 dark:text-gray-400 self-end mb-1">({studios.length})</span>
                                </>
                            )}
                        </h2>
                    </div>
                </div>

                {/* Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence>
                        {Array.isArray(displayedStudios) && displayedStudios.map((studio, index) => {
                            // Calculate distance if user location is available
                            const distance = userLocation && studio.lat && studio.lng
                                ? calculateDistance(userLocation.lat, userLocation.lng, studio.lat, studio.lng)
                                : studio.distance ? studio.distance / 1000 : null; // Fallback to backend distance if available

                            return (
                                <motion.div
                                    key={studio._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    onClick={() => navigate(`/studios/${studio._id}`)}
                                    className="glass-card rounded-2xl overflow-hidden group flex flex-col h-full cursor-pointer"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img
                                            src={studio.coverPhoto ? (studio.coverPhoto.startsWith('http') || studio.coverPhoto.startsWith('/assets') ? studio.coverPhoto : `${API_BASE_URL}${studio.coverPhoto}`) : defaultCover}
                                            alt={studio.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                                        {distance !== null && (
                                            <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-900 dark:text-white shadow-lg flex items-center gap-1.5 border border-white/20">
                                                <FaMapMarkerAlt className="text-red-500" />
                                                {distance.toFixed(1)} km
                                            </div>
                                        )}

                                        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/studios/${studio._id}`, { state: { openBooking: true } });
                                                }}
                                                className="block w-full text-center bg-white text-gray-900 dark:bg-brand-600 dark:text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-grow flex flex-col relative">
                                        <div className="mb-1">
                                            <span className="text-xs font-bold tracking-wider text-brand-600 dark:text-brand-400 uppercase">{studio.city}</span>
                                        </div>
                                        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                            {studio.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                                            {studio.address}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <span className="font-medium">Available</span>
                                            </div>
                                            <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-600">
                                                {studio.numStudios} Rooms
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
