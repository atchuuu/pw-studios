import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaUsers, FaCheckCircle, FaCalendarAlt, FaClock, FaArrowDown, FaImages, FaTimes, FaBuilding, FaDoorOpen } from 'react-icons/fa';
import { API_BASE_URL } from '../utils/apiConfig';
import toast from 'react-hot-toast';

const StudioDetails = () => {
    const { id } = useParams();
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

    const bookingSectionRef = useRef(null);

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
            className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20"
        >
            {/* 1. Hero Section */}
            <div className="relative h-[70vh] min-h-[500px]">
                <img
                    src={getImageUrl(studio.images[0] || studio.exteriorPhotos[0])}
                    alt={studio.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-16 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4 shadow-sm">
                            {studio.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-gray-200 text-lg mb-8">
                            <p className="flex items-center gap-2">
                                <FaMapMarkerAlt className="text-red-500" /> {studio.city}, {studio.area}
                            </p>
                            <span className="hidden sm:inline text-gray-400">|</span>
                            <p className="flex items-center gap-2">
                                <FaUsers className="text-primary" /> {studio.numStudios} Studios Available
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={scrollToBooking}
                                className="bg-primary hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/50 flex items-center gap-2"
                            >
                                Continue to Booking <FaArrowDown />
                            </button>
                            {user && (user.role === 'studio_admin' || user.role === 'super_admin') && (
                                <button
                                    onClick={() => navigate(`/studios/${id}/edit`)}
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-xl font-semibold transition-all border border-white/20 hover:border-white/40"
                                >
                                    Edit Studio Details
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 space-y-16">

                {/* 2. Overview & Info Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About this Studio</h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-8">
                            Located at <span className="font-medium text-gray-900 dark:text-white">{studio.address}</span>.
                            Experience premium recording facilities designed for educators.
                        </p>

                        <div className="mb-8">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FaCheckCircle className="text-green-500" /> Facilities & Amenities
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {studio.facilities.map((fac, idx) => (
                                    <span key={idx} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-800">
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
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-xl">Point of Contact</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                        {studio.pocName ? studio.pocName.charAt(0) : 'U'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{studio.pocName || 'N/A'}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Studio Manager</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                                    <p className="text-gray-600 dark:text-gray-300 flex items-center gap-3">
                                        <span className="text-primary"><FaClock /></span> {studio.pocContact || 'N/A'}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300 flex items-center gap-3">
                                        <span className="text-primary">@</span> {studio.pocEmail || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <a
                            href={studio.googleMapLink || `https://www.google.com/maps/dir/?api=1&destination=${studio.lat || 28.6139},${studio.lng || 77.2090}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        >
                            <FaMapMarkerAlt className="inline mr-2" /> Navigate to Studio
                        </a>
                    </motion.div>
                </div>

                {/* 3. Album View Gallery Section */}
                {(studio.exteriorPhotos?.length > 0 || studio.interiorPhotos?.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FaImages className="text-primary" /> Studio Album
                            </h2>
                            <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                                <button
                                    onClick={() => setActiveTab('interior')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'interior' ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                                >
                                    Interior
                                </button>
                                <button
                                    onClick={() => setActiveTab('exterior')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'exterior' ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
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
                                        transition={{ duration: 0.2 }}
                                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                                    >
                                        {studio.interiorPhotos?.length > 0 ? (
                                            studio.interiorPhotos.map((img, idx) => (
                                                <div key={idx} className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer">
                                                    <img src={getImageUrl(img)} alt={`Interior ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-12 text-gray-500">No interior photos available.</div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'exterior' && (
                                    <motion.div
                                        key="exterior"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                                    >
                                        {studio.exteriorPhotos?.length > 0 ? (
                                            studio.exteriorPhotos.map((img, idx) => (
                                                <div key={idx} className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer">
                                                    <img src={getImageUrl(img)} alt={`Exterior ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-12 text-gray-500">No exterior photos available.</div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* 4. Booking Section */}
                <div ref={bookingSectionRef} className="scroll-mt-24">
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 sm:p-12">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Record?</h2>
                                <p className="text-gray-400 text-lg">Select a unit, date, and time slot to reserve your session.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Unit & Date Selection */}
                                <div className="lg:col-span-1 space-y-8">
                                    <div>
                                        <label className="block text-lg font-medium text-gray-300 mb-4">
                                            <FaBuilding className="inline mr-2 text-primary" /> Studio Unit
                                        </label>
                                        <button
                                            onClick={() => setShowUnitModal(true)}
                                            className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-4 px-6 rounded-2xl flex justify-between items-center transition-all group"
                                        >
                                            <span className="font-bold text-lg">{selectedUnit || 'Select a Unit'}</span>
                                            <span className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm group-hover:bg-primary group-hover:text-white transition-colors">Change</span>
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-lg font-medium text-gray-300 mb-4">
                                            <FaCalendarAlt className="inline mr-2 text-primary" /> Select Date
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full border border-gray-700 rounded-2xl px-6 py-4 bg-gray-800 text-white text-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow shadow-inner"
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
                                <div className="lg:col-span-2 space-y-4">
                                    <label className="block text-lg font-medium text-gray-300 mb-2">
                                        <FaClock className="inline mr-2 text-primary" /> Available Slots {selectedUnit && `for ${selectedUnit}`}
                                    </label>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
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
                                                        py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200
                                                        ${!selectedUnit
                                                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                                                            : isBooked
                                                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                                                                : isSelected
                                                                    ? 'bg-primary text-white shadow-lg transform scale-105 ring-2 ring-primary ring-offset-2 ring-offset-gray-900'
                                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600'
                                                        }
                                                    `}
                                                >
                                                    {timeLabel}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {!selectedUnit && (
                                        <p className="text-yellow-500 text-sm mt-2">* Please select a studio unit first.</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={handleBook}
                                    disabled={loading || !selectedSlot || !selectedUnit}
                                    className="w-full sm:w-auto min-w-[300px] bg-gradient-to-r from-primary to-indigo-500 text-white py-4 px-12 rounded-2xl font-bold text-xl hover:from-indigo-500 hover:to-primary transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
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
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowUnitModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FaDoorOpen className="text-primary" /> Select Studio Unit
                                </h3>
                                <button
                                    onClick={() => setShowUnitModal(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
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
                                                p-4 rounded-2xl border-2 transition-all text-center
                                                ${selectedUnit === unit
                                                    ? 'border-primary bg-primary/5 text-primary shadow-md'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 text-gray-700 dark:text-gray-300'
                                                }
                                            `}
                                        >
                                            <span className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Unit</span>
                                            <span className="text-lg font-bold">{unit}</span>
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
