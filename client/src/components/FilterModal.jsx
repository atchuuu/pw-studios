import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaSortAmountDown, FaSortAmountUp, FaMapMarkerAlt,
    FaStar, FaTimes, FaFilter, FaCalendarAlt, FaCheck
} from 'react-icons/fa';
import { useLocationContext } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/apiConfig';

const FilterModal = ({ isOpen, onClose }) => {
    const { filters, setFilters, sortBy, setSortBy } = useLocationContext();
    const { user } = useAuth();

    const [localFilters, setLocalFilters] = useState(filters);
    const [localSortBy, setLocalSortBy] = useState(sortBy);
    const [availableFacilities, setAvailableFacilities] = useState([]);
    const [loadingFacilities, setLoadingFacilities] = useState(false);

    // Sync from context when opening
    useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters);
            setLocalSortBy(sortBy);
        }
    }, [isOpen, filters, sortBy]);

    // Fetch dynamic facilities
    useEffect(() => {
        const fetchFacilities = async () => {
            if (!user) return;
            setLoadingFacilities(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const res = await axios.get(`${API_BASE_URL}/studios/facilities`, config);
                setAvailableFacilities(res.data);
            } catch (error) {
                console.error("Failed to fetch facilities", error);
                // Fallback
                setAvailableFacilities(['Wi-Fi', 'Parking', 'AC', 'Green Screen', 'Soundproof']);
            } finally {
                setLoadingFacilities(false);
            }
        };

        if (isOpen && availableFacilities.length === 0) {
            fetchFacilities();
        }
    }, [isOpen, user, availableFacilities.length]);

    const handleApply = () => {
        setFilters(localFilters);
        setSortBy(localSortBy);
        onClose();
    };

    const handleReset = () => {
        setLocalFilters({
            minDistance: 0,
            maxDistance: 5000,
            date: '',
            time: '',
            numStudios: 0,
            facilities: []
        });
        setLocalSortBy('nearest');
    };

    const categories = [
        { id: 'sort', label: 'Sort By', icon: <FaSortAmountDown /> },
        { id: 'distance', label: 'Distance', icon: <FaMapMarkerAlt /> },
        { id: 'features', label: 'Features', icon: <FaFilter /> },
        { id: 'availability', label: 'Availability', icon: <FaCalendarAlt /> },
    ];

    const [activeCategory, setActiveCategory] = useState('sort');

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: '100%', opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: '100%', opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-[#121212] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden border border-gray-100 dark:border-white/10"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-white/5 backdrop-blur-xl">
                            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="p-2 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
                                    <FaFilter size={14} />
                                </span>
                                Refine Results
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar Categories (Desktop/Tablet) */}
                            <div className="w-1/3 border-r border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 p-4 space-y-2 hidden sm:block overflow-y-auto">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeCategory === cat.id
                                            ? 'bg-white dark:bg-white/10 text-brand-600 dark:text-brand-400 shadow-lg shadow-brand-500/10 scale-[1.02]'
                                            : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <span className={activeCategory === cat.id ? 'text-brand-500' : 'text-gray-400'}>{cat.icon}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#121212] scroll-smooth custom-scrollbar">
                                {/* Mobile Categories Horizontal Scroll */}
                                <div className="flex sm:hidden gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar snap-x">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold snap-start border transition-all ${activeCategory === cat.id
                                                ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-transparent'
                                                }`}
                                        >
                                            {cat.icon} {cat.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-8">
                                    {/* Sort Section */}
                                    {activeCategory === 'sort' && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="block"
                                        >
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 sticky top-0 bg-white dark:bg-[#121212] z-10 py-2">
                                                Sort Preference
                                            </h3>
                                            <div className="grid grid-cols-1 gap-3">
                                                {[
                                                    { id: 'nearest', label: 'Nearest to Me', desc: 'Sort by distance from your location' },
                                                    { id: 'capacity_high', label: 'Capacity: High to Low', desc: 'Largest studios first' },
                                                    { id: 'capacity_low', label: 'Capacity: Low to High', desc: 'Smallest studios first' },
                                                    { id: 'alphabetical', label: 'Alphabetical', desc: 'A-Z by Studio Name' },
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => setLocalSortBy(opt.id)}
                                                        className={`relative p-4 rounded-2xl border text-left transition-all duration-200 group ${localSortBy === opt.id
                                                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10 ring-1 ring-brand-500'
                                                            : 'border-gray-200 dark:border-white/10 hover:border-brand-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className={`font-bold ${localSortBy === opt.id ? 'text-brand-700 dark:text-brand-400' : 'text-gray-900 dark:text-gray-200'}`}>
                                                                    {opt.label}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{opt.desc}</div>
                                                            </div>
                                                            {localSortBy === opt.id && (
                                                                <div className="bg-brand-500 text-white p-1 rounded-full shadow-sm">
                                                                    <FaCheck size={10} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Distance Section */}
                                    {activeCategory === 'distance' && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="block"
                                        >
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Distance Range</h3>
                                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                                                    <span>0 km</span>
                                                    <span className="text-brand-600 dark:text-brand-400">{localFilters.maxDistance > 100 ? 'Any' : `${localFilters.maxDistance} km`}</span>
                                                </div>
                                                <input
                                                    id="distance-range"
                                                    name="maxDistance"
                                                    type="range"
                                                    min="1"
                                                    max="50"
                                                    step="1"
                                                    value={localFilters.maxDistance > 50 ? 50 : localFilters.maxDistance}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        setLocalFilters({
                                                            ...localFilters,
                                                            maxDistance: val === 50 ? 5000 : val // 50+ = unlimited
                                                        })
                                                    }}
                                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                                                />
                                                <div className="mt-4 flex gap-2">
                                                    {[5, 10, 20, 5000].map(dist => (
                                                        <button
                                                            type="button" // Explicitly type button to avoid form submission if ever inside form
                                                            key={dist}
                                                            onClick={() => setLocalFilters({ ...localFilters, maxDistance: dist })}
                                                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${localFilters.maxDistance === dist
                                                                ? 'bg-brand-600 text-white border-brand-600'
                                                                : 'bg-white dark:bg-transparent border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-brand-300'
                                                                }`}
                                                        >
                                                            {dist >= 5000 ? 'Any' : `< ${dist}km`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Features Section */}
                                    {activeCategory === 'features' && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="block"
                                        >
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Facilities & Capacity</h3>

                                            <div className="mb-4">
                                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block uppercase">Min. Studios</label>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => setLocalFilters({ ...localFilters, numStudios: Math.max(0, localFilters.numStudios - 1) })}
                                                        className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-lg font-bold hover:bg-gray-200"
                                                    >-</button>
                                                    <span className="text-xl font-bold w-8 text-center text-gray-900 dark:text-white">{localFilters.numStudios || 1}</span>
                                                    <button
                                                        onClick={() => setLocalFilters({ ...localFilters, numStudios: (localFilters.numStudios || 0) + 1 })}
                                                        className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-lg font-bold hover:bg-gray-200"
                                                    >+</button>
                                                </div>
                                            </div>

                                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block uppercase">Amenities</label>
                                            <div className="flex flex-wrap gap-2">
                                                {loadingFacilities ? (
                                                    <div className="text-sm text-gray-500">Loading amenities...</div>
                                                ) : (
                                                    availableFacilities.map((facility) => (
                                                        <button
                                                            key={facility}
                                                            onClick={() => {
                                                                const newFacilities = localFilters.facilities.includes(facility)
                                                                    ? localFilters.facilities.filter(f => f !== facility)
                                                                    : [...localFilters.facilities, facility];
                                                                setLocalFilters({ ...localFilters, facilities: newFacilities });
                                                            }}
                                                            className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 ${localFilters.facilities.includes(facility)
                                                                ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-500/20 transform scale-[1.02]'
                                                                : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                                                }`}
                                                        >
                                                            {facility}
                                                        </button>
                                                    ))
                                                )}
                                                {!loadingFacilities && availableFacilities.length === 0 && (
                                                    <p className="text-sm text-gray-500">No amenities found.</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Availability Section */}
                                    {activeCategory === 'availability' && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="block"
                                        >
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Check Availability</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="filter-date" className="text-xs font-semibold text-gray-500 mb-1 block">Date</label>
                                                    <input
                                                        id="filter-date"
                                                        name="date"
                                                        type="date"
                                                        value={localFilters.date}
                                                        onChange={(e) => setLocalFilters({ ...localFilters, date: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-brand-500 text-sm font-medium dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="filter-time" className="text-xs font-semibold text-gray-500 mb-1 block">Time</label>
                                                    <input
                                                        id="filter-time"
                                                        name="time"
                                                        type="time"
                                                        value={localFilters.time}
                                                        onChange={(e) => setLocalFilters({ ...localFilters, time: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-brand-500 text-sm font-medium dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#121212] flex gap-4">
                            <button
                                onClick={handleReset}
                                className="px-6 py-3.5 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-3.5 rounded-xl font-bold shadow-xl shadow-brand-500/30 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <FaCheck /> Apply Filters
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FilterModal;
