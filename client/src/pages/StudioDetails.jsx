import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaUsers, FaCheckCircle, FaCalendarAlt, FaClock, FaArrowDown, FaImages, FaTimes, FaBuilding, FaDoorOpen } from 'react-icons/fa';
import { API_BASE_URL } from '../utils/apiConfig';
import toast from 'react-hot-toast';

const StudioDetails = ({ studioId, isModal = false }) => {
    const { id: paramId } = useParams();
    const id = studioId || paramId;
    const { user } = useAuth();
    const navigate = useNavigate();
    const [studio, setStudio] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [activeTab, setActiveTab] = useState('interior'); // For album view
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const bookingSectionRef = useRef(null);

    // Combine images for slideshow: Interior first, then Exterior
    const interiorImages = studio?.interiorPhotos || [];
    const exteriorImages = studio?.exteriorPhotos || [];
    const allImages = [...interiorImages, ...exteriorImages];

    // Auto-advance slideshow
    useEffect(() => {
        if (allImages.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [allImages.length]);

    const getImageLabel = (index) => {
        if (index < interiorImages.length) return "Interior View";
        return "Exterior View";
    };

    useEffect(() => {
        const fetchStudio = async () => {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/studios/${id}`, config);
            setStudio(data);
            // Default to first unit if available
            if (data.studioNumbers && data.studioNumbers.length > 0) {
                setSelectedUnit(data.studioNumbers[0]);
            }
        };
        fetchStudio();
    }, [id, user]);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!date || !selectedUnit) return;
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${API_BASE_URL}/bookings/studio/${id}?date=${date}&studioUnit=${selectedUnit}`, config);
                setBookedSlots(data.map(b => new Date(b.startTime).getHours()));
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            }
        };
        fetchBookings();
    }, [id, date, selectedUnit, user]);

    const handleBook = async () => {
        if (!selectedSlot || !selectedUnit) return;
        setLoading(true);
        try {
            const startTime = new Date(date);
            startTime.setHours(selectedSlot, 0, 0, 0);

            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_BASE_URL}/bookings`, {
                studioId: id,
                studioUnit: selectedUnit,
                startTime: startTime.toISOString()
            }, config);

            toast.success('Booking Confirmed!');
            navigate('/bookings');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBooking = () => {
        bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getImageUrl = (url) => {
        if (!url) return "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1000";
        if (url.startsWith('http')) return url;
        return `${import.meta.env.VITE_SERVER_URL}${url}`;
    };

    // Generate slots from 6 AM to 8 PM (Last slot starts at 20:00)
    const slots = [];
    for (let i = 6; i <= 20; i++) {
        slots.push(i);
    }

    if (!studio) return <div className="flex justify-center items-center h-screen text-gray-500">Loading...</div>;

    return (

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`bg-gray-50 dark:bg-dark-bg transition-colors duration-300 ${isModal ? 'h-full overflow-y-auto' : 'min-h-screen pb-20'}`}
        >
            {/* 1. Hero Section */}
            <div className={`relative overflow-hidden ${isModal ? 'h-[40vh] min-h-[300px]' : 'h-[70vh] min-h-[500px]'}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        <img
                            src={getImageUrl(allImages[currentImageIndex])}
                            alt={studio.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />
                        <div className="absolute inset-0 bg-brand-900/20 mix-blend-overlay" />
                    </motion.div>
                </AnimatePresence>

                {/* Image Label (Interior/Exterior) */}
                {allImages.length > 0 && (
                    <div className="absolute top-24 right-4 sm:right-8 z-20">
                        <span className="glass px-4 py-2 rounded-full text-white text-sm font-bold border border-white/20 shadow-lg backdrop-blur-md">
                            {getImageLabel(currentImageIndex)}
                        </span>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto z-20">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold text-white mb-6 shadow-sm tracking-tight">
                            {studio.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-gray-200 text-lg mb-8 font-medium">
                            <p className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                                <FaMapMarkerAlt className="text-red-500" /> {studio.city}, {studio.area}
                            </p>
                            <p className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                                <FaUsers className="text-brand-400" /> {studio.numStudios} Studios Available
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={scrollToBooking}
                                className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 flex items-center gap-2 hover:-translate-y-1"
                            >
                                Continue to Booking <FaArrowDown />
                            </button>
                            {user && (user.role === 'studio_admin' || user.role === 'super_admin') && (
                                <button
                                    onClick={() => navigate(`/studios/${id}/edit`)}
                                    className="glass hover:bg-white/20 text-white px-8 py-3.5 rounded-xl font-semibold transition-all border border-white/20 hover:border-white/40"
                                >
                                    Edit Studio Details
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 space-y-12">

                {/* 2. Overview & Info Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2 glass-card rounded-3xl p-8 sm:p-10"
                    >
                        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">About this Studio</h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-8">
                            Located at <span className="font-medium text-gray-900 dark:text-white">{studio.address}</span>.
                            Experience premium recording facilities designed for educators, featuring state-of-the-art equipment and a comfortable environment.
                        </p>

                        <div className="mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FaCheckCircle className="text-brand-500" /> Facilities & Amenities
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {studio.facilities.map((fac, idx) => (
                                    <span key={idx} className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 px-4 py-2 rounded-xl text-sm font-medium border border-brand-100 dark:border-brand-800/50">
                                        {fac}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Sidebar: POC & Location */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        <div className="glass-card rounded-3xl p-8">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-xl font-display">Point of Contact</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xl ring-2 ring-white dark:ring-gray-700 shadow-md">
                                        {studio.pocName ? studio.pocName.charAt(0) : 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-gray-900 dark:text-white">{studio.pocName || 'N/A'}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Studio Manager</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-gray-100 dark:border-gray-700/50 space-y-3">
                                    <p className="text-gray-600 dark:text-gray-300 flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                        <span className="text-brand-500"><FaClock /></span> <span className="font-medium">{studio.pocContact || 'N/A'}</span>
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300 flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                        <span className="text-brand-500">@</span> <span className="font-medium">{studio.pocEmail || 'N/A'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <a
                            href={studio.googleMapLink || `https://www.google.com/maps/dir/?api=1&destination=${studio.lat || 28.6139},${studio.lng || 77.2090}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all transform hover:-translate-y-1"
                        >
                            <FaMapMarkerAlt className="inline mr-2" /> Navigate to Studio
                        </a>
                    </motion.div>
                </div>

                {/* 3. Album View Gallery Section */}
                {(studio.exteriorPhotos?.length > 0 || studio.interiorPhotos?.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-card rounded-3xl p-8 sm:p-10"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <FaImages className="text-brand-500" /> Studio Album
                            </h2>
                            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700/50">
                                <button
                                    onClick={() => setActiveTab('interior')}
                                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'interior' ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    Interior
                                </button>
                                <button
                                    onClick={() => setActiveTab('exterior')}
                                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'exterior' ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    Exterior
                                </button>
                            </div>
                        </div>

                        <div className="min-h-[300px]">
                            <AnimatePresence mode="wait">
                                {activeTab === 'interior' && (
                                    <motion.div
                                        key="interior"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                                    >
                                        {studio.interiorPhotos?.length > 0 ? (
                                            studio.interiorPhotos.map((img, idx) => (
                                                <div key={idx} className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all">
                                                    <img src={getImageUrl(img)} alt={`Interior ${idx}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-16 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">No interior photos available.</div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'exterior' && (
                                    <motion.div
                                        key="exterior"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                                    >
                                        {studio.exteriorPhotos?.length > 0 ? (
                                            studio.exteriorPhotos.map((img, idx) => (
                                                <div key={idx} className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all">
                                                    <img src={getImageUrl(img)} alt={`Exterior ${idx}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-16 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">No exterior photos available.</div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* 4. Booking Section */}
                <div ref={bookingSectionRef} className="scroll-mt-28">
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-3xl shadow-2xl bg-dark-card border border-dark-border"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 to-dark-bg z-0"></div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10 p-8 sm:p-12 lg:p-16">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-4">Ready to Record?</h2>
                                <p className="text-gray-300 text-lg max-w-2xl mx-auto">Select your preferred studio unit, date, and time slot to instantly reserve your session.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Unit & Date Selection */}
                                <div className="lg:col-span-1 space-y-8">
                                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                        <label className="block text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <FaBuilding className="text-brand-400" /> Studio Unit
                                        </label>
                                        <button
                                            onClick={() => setShowUnitModal(true)}
                                            className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white py-4 px-6 rounded-xl flex justify-between items-center transition-all group"
                                        >
                                            <span className="font-bold text-xl">{selectedUnit || 'Select a Unit'}</span>
                                            <span className="bg-brand-500/20 text-brand-300 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider group-hover:bg-brand-500 group-hover:text-white transition-colors">Change</span>
                                        </button>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                        <label className="block text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <FaCalendarAlt className="text-brand-400" /> Select Date
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full border border-white/10 rounded-xl px-6 py-4 bg-white/10 text-white text-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all placeholder-gray-400"
                                            value={date}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => {
                                                setDate(e.target.value);
                                                setSelectedSlot(null);
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Slot Selection */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 h-full">
                                        <label className="block text-lg font-bold text-white mb-6 flex items-center gap-2">
                                            <FaClock className="text-brand-400" /> Available Slots {selectedUnit && <span className="text-gray-400 font-normal ml-1">for {selectedUnit}</span>}
                                        </label>

                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                            {slots.map((hour) => {
                                                const isBooked = bookedSlots.includes(hour);
                                                const isSelected = selectedSlot === hour;
                                                const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

                                                return (
                                                    <button
                                                        key={hour}
                                                        disabled={isBooked || !selectedUnit}
                                                        onClick={() => setSelectedSlot(hour)}
                                                        className={`
                                                            py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200 relative overflow-hidden
                                                            ${!selectedUnit
                                                                ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                                                                : isBooked
                                                                    ? 'bg-red-900/20 text-red-400 cursor-not-allowed border border-red-900/30'
                                                                    : isSelected
                                                                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/40 transform scale-105 border border-brand-500'
                                                                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/10'
                                                            }
                                                        `}
                                                    >
                                                        {timeLabel}
                                                        {isBooked && <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]"><FaTimes className="text-red-500" /></div>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {!selectedUnit && (
                                            <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-xl text-yellow-200 text-center text-sm font-medium">
                                                Please select a studio unit from the left panel to view availability.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={handleBook}
                                    disabled={loading || !selectedSlot || !selectedUnit}
                                    className="w-full sm:w-auto min-w-[320px] bg-gradient-to-r from-brand-600 to-accent text-white py-4 px-12 rounded-2xl font-bold text-xl hover:from-brand-500 hover:to-brand-400 transition-all shadow-xl shadow-brand-900/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-[1.02]"
                                >
                                    {loading ? 'Processing...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

            </div>

            {/* Unit Selection Modal */}
            <AnimatePresence>
                {showUnitModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-md"
                            onClick={() => setShowUnitModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative glass-card rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FaDoorOpen className="text-brand-500" /> Select Studio Unit
                                </h3>
                                <button
                                    onClick={() => setShowUnitModal(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="p-6 max-h-[60vh] overflow-y-auto bg-white/30 dark:bg-gray-900/30">
                                <div className="grid grid-cols-2 gap-4">
                                    {studio.studioNumbers && studio.studioNumbers.map((unit) => (
                                        <button
                                            key={unit}
                                            onClick={() => {
                                                setSelectedUnit(unit);
                                                setSelectedSlot(null);
                                                setShowUnitModal(false);
                                            }}
                                            className={`
                                                p-5 rounded-2xl border-2 transition-all text-center group relative overflow-hidden
                                                ${selectedUnit === unit
                                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 shadow-lg'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800'
                                                }
                                            `}
                                        >
                                            <span className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Unit</span>
                                            <span className="text-2xl font-display font-bold">{unit}</span>
                                            {selectedUnit === unit && <div className="absolute inset-0 bg-brand-500/5 dark:bg-brand-400/5" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );

};

export default StudioDetails;
