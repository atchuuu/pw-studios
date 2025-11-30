import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/apiConfig';
import { FaMapMarkerAlt, FaStar, FaClock, FaWifi, FaParking, FaCoffee, FaBolt, FaChevronLeft, FaChevronRight, FaImages } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StudioDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [studio, setStudio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState('');
    const [showUnitDialog, setShowUnitDialog] = useState(false);

    // Slideshow state
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [slideshowImages, setSlideshowImages] = useState([]);

    const bookingSectionRef = useRef(null);

    useEffect(() => {
        const fetchStudio = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${API_BASE_URL}/studios/${id}`, config);
                setStudio(data);

                // Prepare slideshow images
                const images = [];
                if (data.interiorPhotos && data.interiorPhotos.length > 0) {
                    data.interiorPhotos.forEach(img => images.push({ url: img, type: 'Interior' }));
                }
                if (data.exteriorPhotos && data.exteriorPhotos.length > 0) {
                    data.exteriorPhotos.forEach(img => images.push({ url: img, type: 'Exterior' }));
                }
                // Fallback if no specific photos but old images exist
                if (images.length === 0 && data.images && data.images.length > 0) {
                    data.images.forEach(img => images.push({ url: img, type: 'Studio' }));
                }
                setSlideshowImages(images);

                if (data.studioNumbers && data.studioNumbers.length > 0) {
                    setSelectedUnit(data.studioNumbers[0]);
                }
            } catch (error) {
                console.error("Failed to fetch studio", error);
                toast.error("Failed to load studio details");
            } finally {
                setLoading(false);
            }
        };
        fetchStudio();
    }, [id, user]);

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${import.meta.env.VITE_SERVER_URL}${url}`;
    };

    const handleBookSlot = async () => {
        if (!selectedSlot || !selectedUnit) {
            toast.error('Please select a slot and studio unit');
            return;
        }

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const startTime = new Date(selectedDate);
            startTime.setHours(selectedSlot, 0, 0, 0);

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

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % slideshowImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
    };

    // Generate slots from 6 AM to 8 PM
    const slots = [];
    for (let i = 6; i <= 20; i++) {
        slots.push(i);
    }

    if (loading || !studio) return (
        <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Hero Section - Cover Photo */}
            <div className="relative h-[60vh] min-h-[400px]">
                <img
                    src={studio.coverPhoto ? getImageUrl(studio.coverPhoto) : (slideshowImages.length > 0 ? getImageUrl(slideshowImages[0].url) : "https://via.placeholder.com/1200x600?text=No+Image")}
                    alt={studio.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 text-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">{studio.name}</h1>
                                <div className="flex items-center gap-4 text-lg text-gray-200">
                                    <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-primary" /> {studio.city}, {studio.area}</span>
                                    <span className="flex items-center gap-2"><FaStar className="text-yellow-400" /> 4.8 (120 reviews)</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={scrollToBooking}
                                    className="bg-primary hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-primary/30"
                                >
                                    Book Now
                                </button>
                                {user.role === 'super_admin' && (
                                    <button
                                        onClick={() => navigate(`/studios/${id}/edit`)}
                                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold transition-all border border-white/30"
                                    >
                                        Edit Studio
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Slideshow Section */}
                        {slideshowImages.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <FaImages className="text-primary" /> Gallery
                                </h2>
                                <div className="relative aspect-video rounded-2xl overflow-hidden group bg-black">
                                    <img
                                        src={getImageUrl(slideshowImages[currentImageIndex].url)}
                                        alt={`Slide ${currentImageIndex}`}
                                        className="w-full h-full object-contain"
                                    />

                                    {/* Label */}
                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-1 rounded-full text-sm font-semibold border border-white/20">
                                        {slideshowImages[currentImageIndex].type}
                                    </div>

                                    {/* Controls */}
                                    {slideshowImages.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <FaChevronLeft />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <FaChevronRight />
                                            </button>

                                            {/* Indicators */}
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                {slideshowImages.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setCurrentImageIndex(idx)}
                                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'}`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* About Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this Studio</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                Experience premium recording facilities at {studio.name}. Located in the heart of {studio.city},
                                this studio offers state-of-the-art equipment and a comfortable environment for all your content creation needs.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {studio.facilities.map((facility, idx) => (
                                    <div key={idx} className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-center">
                                        <div className="text-primary mb-2 text-xl">
                                            {idx % 4 === 0 ? <FaWifi /> : idx % 4 === 1 ? <FaParking /> : idx % 4 === 2 ? <FaCoffee /> : <FaBolt />}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{facility}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Location</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">{studio.address}</p>
                            {studio.googleMapLink && (
                                <a
                                    href={studio.googleMapLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-primary hover:text-indigo-700 font-semibold"
                                >
                                    View on Google Maps <FaChevronRight className="ml-1 text-xs" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="lg:col-span-1">
                        <div ref={bookingSectionRef} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Book a Session</h3>

                            {/* Unit Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Studio Unit</label>
                                <div
                                    onClick={() => setShowUnitDialog(true)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer flex justify-between items-center"
                                >
                                    <span className="text-gray-900 dark:text-white font-medium">{selectedUnit || 'Select Unit'}</span>
                                    <FaChevronRight className="text-gray-400" />
                                </div>
                            </div>

                            {/* Date Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Date</label>
                                <input
                                    type="date"
                                    value={selectedDate.toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>

                            {/* Slots Grid */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Available Slots</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {slots.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`py-2 rounded-lg text-sm font-medium transition-all ${selectedSlot === slot
                                                    ? 'bg-primary text-white shadow-lg scale-105'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {slot}:00
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleBookSlot}
                                disabled={loading}
                                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Unit Selection Dialog */}
            {showUnitDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select Studio Unit</h3>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {studio.studioNumbers.map((unit) => (
                                <button
                                    key={unit}
                                    onClick={() => {
                                        setSelectedUnit(unit);
                                        setShowUnitDialog(false);
                                    }}
                                    className={`w-full p-4 rounded-xl text-left transition-colors ${selectedUnit === unit
                                            ? 'bg-primary/10 text-primary border border-primary'
                                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <div className="font-bold">{unit}</div>
                                    <div className="text-xs opacity-70">Standard Recording Suite</div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowUnitDialog(false)}
                            className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudioDetails;
