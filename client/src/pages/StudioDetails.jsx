import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import BrandLoader from '../components/common/BrandLoader';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaUsers, FaCheckCircle, FaCalendarAlt, FaClock, FaArrowDown, FaImages, FaTimes, FaBuilding, FaDoorOpen, FaUser, FaStar, FaEnvelope, FaPhone } from 'react-icons/fa';
import { API_BASE_URL } from '../utils/apiConfig';
import toast from 'react-hot-toast';
import BookingModal from '../components/BookingModal';

const StudioDetails = ({ studioId, isModal = false }) => {
    const { id: paramId } = useParams();
    const id = studioId || paramId;
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [studio, setStudio] = useState(null);
    const [activeTab, setActiveTab] = useState('interior'); // For album view
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // Initialize directly from location state to avoid render delay
    const [showBookingModal, setShowBookingModal] = useState(!!location.state?.openBooking);
    const [selectedImage, setSelectedImage] = useState(null); // For lightbox

    // Check for openBooking state from navigation (e.g. from Dashboard "Book Now")
    // Clear the navigation state ensuring it doesn't persist inappropriately
    useEffect(() => {
        if (location.state?.openBooking) {
            // Clear state to prevent reopening on reload/back, but we already set initial state above
            window.history.replaceState({}, document.title);
        }
    }, [location]);

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
        };
        fetchStudio();
        // Scroll to top when studio ID changes
        window.scrollTo(0, 0);
    }, [id, user]);

    const getImageUrl = (url) => {
        if (!url) return "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1000";
        if (url.startsWith('http')) return url;
        return `${import.meta.env.VITE_SERVER_URL}${url}`;
    };

    if (!studio) return <BrandLoader fullScreen={false} text="Loading Studio Details..." />;

    return (

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`bg-white dark:bg-dark-bg min-h-screen pb-20 transition-colors duration-300 ${isModal ? 'h-full overflow-y-auto' : ''}`}
        >
            {/* 1. Hero Section - Immersive & Clean */}
            <div className={`relative w-full ${isModal ? 'h-[45vh]' : 'h-[65vh]'} bg-gray-900 overflow-hidden`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <img
                            src={getImageUrl(allImages[currentImageIndex])}
                            alt={studio.name}
                            className="w-full h-full object-cover opacity-90"
                        />
                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    </motion.div>
                </AnimatePresence>

                {/* Navbar Placeholder / Back Button could go here */}

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16 max-w-7xl mx-auto z-20">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Tags / Badges - Clean & Minimal */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                                {getImageLabel(currentImageIndex)}
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold text-white mb-4 leading-tight shadow-sm">
                            {studio.name}
                        </h1>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-white/90 text-sm sm:text-base font-medium mb-8">
                            <p className="flex items-center gap-2">
                                <FaMapMarkerAlt className="text-brand-400" />
                                {studio.city}, {studio.area}
                            </p>
                            <p className="flex items-center gap-2">
                                <FaUsers className="text-brand-400" />
                                {studio.numStudios} Recording Suites
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* 2. Main Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Details & Amenities */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Overview Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About the Experience</h2>

                            {/* Location & Dynamic Description */}
                            <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-6">
                                <div className="flex items-start gap-3 mb-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                    <FaMapMarkerAlt className="text-brand-500 mt-1 flex-shrink-0 text-xl" />
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white mb-1">Located at</p>
                                        <p className="text-base">{studio.address}</p>
                                    </div>
                                </div>

                                <div className="whitespace-pre-wrap">
                                    {studio.description || (
                                        <span>
                                            Designed for seamless content creation, this facility offers professional-grade acoustics and lighting directly suited for educators and creators.
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FaStar className="text-brand-500" /> Premium Facilities
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {studio.facilities.map((fac, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors hover:border-brand-200 dark:hover:border-brand-500/50">
                                            <FaCheckCircle className="text-brand-500 text-xs" />
                                            {fac}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Gallery / Album */}
                        {(studio.exteriorPhotos?.length > 0 || studio.interiorPhotos?.length > 0) && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700"
                            >
                                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <FaImages className="text-brand-500" /> Virtual Tour
                                    </h2>

                                    {/* Custom Tab Switcher */}
                                    <div className="bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl flex">
                                        {['interior', 'exterior'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-200 ${activeTab === tab
                                                    ? 'bg-white dark:bg-gray-600 text-brand-600 dark:text-white shadow-sm scale-100'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                                    }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="min-h-[250px]">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                        >
                                            {(activeTab === 'interior' ? studio.interiorPhotos : studio.exteriorPhotos)?.length > 0 ? (
                                                (activeTab === 'interior' ? studio.interiorPhotos : studio.exteriorPhotos).map((img, idx) => (
                                                    <div key={idx} onClick={() => setSelectedImage(img)} className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all">
                                                        <img src={getImageUrl(img)} alt={`${activeTab} ${idx} `} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <FaImages className="text-white text-3xl drop-shadow-md" />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
                                                    No {activeTab} photos uploaded yet.
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column: Sticky Action Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* "Book Now" Action Card */}
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl shadow-brand-900/10 dark:shadow-none border border-brand-100 dark:border-gray-700 overflow-hidden relative"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600" />

                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Ready to Record?</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Book your slot seamlessly.</p>
                                </div>

                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="w-full bg-brand-600 hover:bg-brand-700 text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-brand-500/30 transition-all transform hover:-translate-y-1 hover:shadow-brand-500/50 flex items-center justify-center gap-2"
                                >
                                    <FaCalendarAlt /> Book Now
                                </button>
                            </motion.div>

                            {/* Contact Card */}
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-200/50 dark:shadow-none"
                            >
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Studio Manager</h3>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg ring-2 ring-white dark:ring-gray-700">
                                        {studio.pocName ? studio.pocName.charAt(0) : <FaUser />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{studio.pocName || 'Support Team'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Studio POC</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <a
                                        href={`tel:${studio.pocContact}`}
                                        className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-700 dark:hover:text-brand-400 transition-colors group"
                                    >
                                        <FaPhone className="text-brand-400 group-hover:text-brand-600" />
                                        <span className="font-medium">{studio.pocContact || 'Not Available'}</span>
                                    </a>
                                    <a
                                        href={`mailto:${studio.pocEmail}`}
                                        className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-700 dark:hover:text-brand-400 transition-colors group"
                                    >
                                        <FaEnvelope className="text-brand-400 group-hover:text-brand-600" />
                                        <span className="truncate font-medium">{studio.pocEmail || 'support@pw.live'}</span>
                                    </a>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <a
                                        href={studio.googleMapLink || `https://www.google.com/maps/dir/?api=1&destination=${studio.lat || 28.6139},${studio.lng || 77.2090}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <FaMapMarkerAlt className="text-red-500" /> Get Directions
                                    </a >
                                </div >
                            </motion.div >
                        </div >
                    </div >
                </div >
            </div >

            {/* Booking Modal */}
            <BookingModal
                studio={studio}
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
            />

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                        >
                            <FaTimes size={32} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={getImageUrl(selectedImage)}
                            alt="Full Screen View"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div >
    );

};

export default StudioDetails;
