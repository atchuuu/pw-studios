import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/apiConfig';
import BookingDetailsModal from '../components/common/BookingDetailsModal';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaChevronDown, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUser, FaBookOpen, FaTimesCircle, FaCalendarPlus } from 'react-icons/fa';
import { format, addDays, startOfToday, isSameDay, parseISO } from 'date-fns';
import { handleCalendarExport } from '../utils/calendar';

const TIME_SLOTS = [
    { id: 'all', label: 'All Time' },
    { id: 'morning', label: 'Morning (6AM - 12PM)', start: 6, end: 12 },
    { id: 'afternoon', label: 'Afternoon (12PM - 6PM)', start: 12, end: 18 },
    { id: 'evening', label: 'Evening (6PM - 11PM)', start: 18, end: 23 }
];

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('all');
    const [expandedStudios, setExpandedStudios] = useState({});
    const [expandedUnits, setExpandedUnits] = useState({});
    const [expandedHistoryDates, setExpandedHistoryDates] = useState({});

    // Cancellation Modal State
    const [cancelModal, setCancelModal] = useState({
        isOpen: false,
        bookingId: null,
        reason: '',
        customReason: ''
    });

    const CANCELLATION_REASONS = [
        "Schedule Change",
        "Class Cancelled",
        "Personal Emergency",
        "Studio Equipment Issue",
        "Booked by Mistake",
        "Other"
    ];

    const toggleHistoryDate = (dateKey) => {
        setExpandedHistoryDates(prev => ({
            ...prev,
            [dateKey]: !prev[dateKey]
        }));
    };

    // Generate dates for the horizontal strip (next 30 days)
    const dates = Array.from({ length: 30 }, (_, i) => addDays(startOfToday(), i));
    const dateStripRef = useRef(null);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // Fetch user specific bookings - assuming /bookings/my or similar endpoint for user bookings
                // If the user is admin, this might return all, but we are in MyBookings page.
                // Adjusted to use a query param or separate endpoint if needed, but trying standard first.
                // Since I cannot check server routes, I will assume /bookings/my exists or /bookings filters by user context if role is user.
                // Let's try /bookings/my first as it is cleaner.
                const { data } = await axios.get(`${API_BASE_URL}/bookings/my`, config);
                setBookings(data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
                // Fallback if /bookings/my 404s, try /bookings with filter? 
                // For now, logging error.
            }
        };

        fetchBookings();
    }, [user]);

    const toggleStudio = (studioId) => {
        setExpandedStudios(prev => ({
            ...prev,
            [studioId]: !prev[studioId]
        }));
    };

    const toggleUnit = (studioId, unitName) => {
        const key = `${studioId}-${unitName}`;
        setExpandedUnits(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const openCancelModal = (bookingId) => {
        setCancelModal({
            isOpen: true,
            bookingId,
            reason: CANCELLATION_REASONS[0],
            customReason: ''
        });
    };

    const handleConfirmCancel = async () => {
        const { bookingId, reason, customReason } = cancelModal;
        const finalReason = reason === 'Other' ? customReason : reason;

        if (reason === 'Other' && !customReason.trim()) {
            toast.error('Please specify a reason');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_BASE_URL}/bookings/${bookingId}/cancel`, { reason: finalReason }, config);

            // Update UI
            setBookings(bookings.map(b =>
                b._id === bookingId ? { ...b, status: 'cancelled', cancellationReason: finalReason } : b
            ));
            toast.success('Booking cancelled successfully');

            // If modal is open for this booking, update it too
            if (selectedBooking && selectedBooking._id === bookingId) {
                setSelectedBooking(prev => ({ ...prev, status: 'cancelled', cancellationReason: finalReason }));
            }

            // Close Cancel Modal
            setCancelModal({ isOpen: false, bookingId: null, reason: '', customReason: '' });

        } catch (error) {
            console.error('Error cancelling booking:', error);
            toast.error('Failed to cancel booking');
        }
    };

    // Split bookings
    const now = new Date();
    const upcomingBookings = bookings.filter(b => new Date(b.startTime) >= startOfToday());
    const historyBookings = bookings.filter(b => new Date(b.startTime) < startOfToday());

    // --- Filtering Logic (Upcoming) ---

    // 1. Filter by Date (Only for upcoming)
    const bookingsForDate = upcomingBookings.filter(b =>
        isSameDay(parseISO(b.startTime), selectedDate)
    );

    // 2. Filter by Search Query
    const searchSource = activeTab === 'upcoming' ? bookingsForDate : historyBookings;
    const searchedBookings = searchSource.filter(b =>
        (b.studio?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 3. Filter by Time Slot (Only for upcoming)
    const filteredBookings = searchedBookings.filter(b => {
        if (activeTab === 'history') return true; // No time slot filter for history yet, or optional
        if (selectedTimeSlot === 'all') return true;
        const hour = parseISO(b.startTime).getHours();
        const slot = TIME_SLOTS.find(s => s.id === selectedTimeSlot);
        return slot ? (hour >= slot.start && hour < slot.end) : true;
    });

    // 4. Group strings (Only for upcoming view)
    const groupedBookings = filteredBookings.reduce((acc, booking) => {
        const studioId = booking.studio?._id || 'unknown';
        const studioName = booking.studio?.name || 'Unknown Studio';
        const studioCity = booking.studio?.city || booking.studio?.location || '';
        const studioUnit = booking.studioUnit || 'General';

        if (!acc[studioId]) {
            acc[studioId] = {
                id: studioId,
                name: studioName,
                city: studioCity,
                totalBookings: 0,
                units: {}
            };
        }

        if (!acc[studioId].units[studioUnit]) {
            acc[studioId].units[studioUnit] = [];
        }

        acc[studioId].units[studioUnit].push(booking);
        acc[studioId].totalBookings += 1;
        return acc;
    }, {});

    const sortedGroups = Object.values(groupedBookings).sort((a, b) => a.name.localeCompare(b.name));

    // Helper for rendering history list (Day-wise grouping)
    const renderHistoryList = () => {
        if (filteredBookings.length === 0) {
            return (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="bg-gray-100 dark:bg-gray-700 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 /* text-4xl text-gray-400 */">
                        <FaBookOpen />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No past bookings found</h3>
                    <p className="text-gray-500 dark:text-gray-400">You don't have any history records matching your search.</p>
                </div>
            );
        }

        // Group history bookings by Date
        const historyGroupedByDate = filteredBookings.reduce((acc, booking) => {
            const dateKey = format(parseISO(booking.startTime), 'yyyy-MM-dd');
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(booking);
            return acc;
        }, {});

        const sortedDates = Object.keys(historyGroupedByDate).sort((a, b) => new Date(b) - new Date(a));

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FaCalendarAlt className="text-brand-500" />
                        Past Bookings History
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        {filteredBookings.length} total
                    </span>
                </div>

                {sortedDates.map(dateKey => {
                    const daysBookings = historyGroupedByDate[dateKey];
                    const isExpanded = expandedHistoryDates[dateKey];

                    return (
                        <motion.div
                            key={dateKey}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <button
                                onClick={() => toggleHistoryDate(dateKey)}
                                className="w-full p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-600/50 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                                        {format(new Date(dateKey), 'd')}
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{format(new Date(dateKey), 'MMMM yyyy')} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({format(new Date(dateKey), 'EEEE')})</span></h4>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{daysBookings.length} Booking{daysBookings.length !== 1 ? 's' : ''}</span>
                                    <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {daysBookings.map((booking) => (
                                                <div
                                                    key={booking._id}
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="bg-white dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-2 relative overflow-hidden group/card cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors"
                                                >
                                                    {/* Status Strip */}
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${booking.status === 'confirmed' ? 'bg-green-500' :
                                                        booking.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'
                                                        }`} />

                                                    <div className="pl-2 space-y-2">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h5 className="font-bold text-gray-900 dark:text-white text-sm">{booking.studio?.name}</h5>
                                                                <span className="text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded">{booking.studioUnit || 'General'}</span>
                                                            </div>
                                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                booking.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                }`}>
                                                                {booking.status}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 font-mono">
                                                            <FaClock className="text-brand-500" />
                                                            {format(parseISO(booking.startTime), 'h:mm a')} - {format(parseISO(booking.endTime), 'h:mm a')}
                                                        </div>


                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">My Bookings</h1>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Bookings: <span className="font-bold text-brand-600 dark:text-brand-400">{bookings.length}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'upcoming'
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history'
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        History
                    </button>
                </div>

                {/* Controls (Shared Search) */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                        </div>
                        <input
                            id="my-bookings-search"
                            name="search"
                            type="text"
                            placeholder="Search studio..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl leading-5 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                        />
                    </div>

                    {activeTab === 'upcoming' && (
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                            {TIME_SLOTS.map(slot => (
                                <button
                                    key={slot.id}
                                    onClick={() => setSelectedTimeSlot(slot.id)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedTimeSlot === slot.id
                                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {slot.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {activeTab === 'upcoming' && (
                    <>
                        {/* --- Horizontal Date Strip --- */}
                        <div className="bg-white dark:bg-gray-800 py-4 px-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div
                                ref={dateStripRef}
                                className="flex gap-3 overflow-x-auto pb-2 px-2 scroll-smooth"
                            >
                                {dates.map((date, index) => {
                                    const isSelected = isSameDay(date, selectedDate);
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedDate(date)}
                                            className={`
                                                flex flex-col items-center justify-center min-w-[70px] h-[80px] rounded-2xl border transition-all duration-200 flex-shrink-0
                                                ${isSelected
                                                    ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-600/30 scale-105'
                                                    : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-brand-300 dark:hover:border-brand-500/50 hover:bg-white dark:hover:bg-gray-700'
                                                }
                                            `}
                                        >
                                            <span className={`text-xs font-semibold uppercase ${isSelected ? 'text-brand-100' : 'text-gray-400 dark:text-gray-500'}`}>
                                                {format(date, 'MMM')}
                                            </span>
                                            <span className="text-2xl font-bold font-display my-1">
                                                {format(date, 'd')}
                                            </span>
                                            <span className={`text-xs ${isSelected ? 'text-brand-100' : 'text-gray-400 dark:text-gray-500'}`}>
                                                {format(date, 'EEE')}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* --- Bookings List (Accordions) --- */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FaCalendarAlt className="text-brand-500" />
                                    Bookings for <span className="text-brand-600 dark:text-brand-400">{format(selectedDate, 'MMMM do, yyyy')}</span>
                                </h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                    {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
                                </span>
                            </div>

                            {sortedGroups.length > 0 ? (
                                sortedGroups.map((group) => (
                                    <motion.div
                                        key={group.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {/* Header */}
                                        <button
                                            onClick={() => toggleStudio(group.id)}
                                            className="w-full p-5 flex items-center justify-between bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xl">
                                                    <FaMapMarkerAlt />
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">{group.name}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                        {group.city && <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-600 dark:text-gray-300">{group.city}</span>}
                                                        {group.totalBookings} Slot{group.totalBookings !== 1 ? 's' : ''} Booked
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`text-gray-400 transition-transform duration-300 ${expandedStudios[group.id] ? 'rotate-180' : ''}`}>
                                                <FaChevronDown size={20} />
                                            </div>
                                        </button>

                                        {/* Expanded Content */}
                                        <AnimatePresence>
                                            {expandedStudios[group.id] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30"
                                                >
                                                    <div className="p-4 space-y-4">
                                                        {Object.entries(group.units).sort(([unitA], [unitB]) => unitA.localeCompare(unitB)).map(([unitName, unitBookings]) => {
                                                            const unitKey = `${group.id}-${unitName}`;
                                                            const isUnitExpanded = expandedUnits[unitKey];

                                                            return (
                                                                <div key={unitName} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                                    {/* Unit Header (Clickable) */}
                                                                    <button
                                                                        onClick={() => toggleUnit(group.id, unitName)}
                                                                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-800 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                                                                                {unitName}
                                                                            </span>
                                                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                                {unitBookings.length} Booking{unitBookings.length !== 1 ? 's' : ''}
                                                                            </span>
                                                                        </div>
                                                                        <div className={`text-gray-400 transition-transform duration-200 ${isUnitExpanded ? 'rotate-180' : ''}`}>
                                                                            <FaChevronDown size={14} />
                                                                        </div>
                                                                    </button>

                                                                    {/* Bookings Grid for this Unit */}
                                                                    <AnimatePresence>
                                                                        {isUnitExpanded && (
                                                                            <motion.div
                                                                                initial={{ height: 0, opacity: 0 }}
                                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                                exit={{ height: 0, opacity: 0 }}
                                                                                className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                                                                            >
                                                                                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                                    {unitBookings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).map((booking) => (
                                                                                        <div
                                                                                            key={booking._id}
                                                                                            onClick={() => setSelectedBooking(booking)}
                                                                                            className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-2 relative overflow-hidden group/card cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors"
                                                                                        >
                                                                                            {/* Status Strip */}
                                                                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${booking.status === 'confirmed' ? 'bg-green-500' :
                                                                                                booking.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'
                                                                                                }`} />

                                                                                            <div className="pl-2">
                                                                                                {/* Date (Important for History view) */}
                                                                                                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-1.5">
                                                                                                    <FaCalendarAlt size={10} className="text-brand-400" />
                                                                                                    {format(parseISO(booking.startTime), 'MMM do, yyyy')}
                                                                                                </div>

                                                                                                {/* Time & Status Row */}
                                                                                                <div className="flex justify-between items-start mb-2">
                                                                                                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-200 font-bold font-mono text-xs">
                                                                                                        <FaClock size={10} className="text-brand-500" />
                                                                                                        {format(parseISO(booking.startTime), 'h:mm a')} - {format(parseISO(booking.endTime), 'h:mm a')}
                                                                                                    </div>
                                                                                                    <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                                                        }`}>
                                                                                                        {booking.status}
                                                                                                    </span>
                                                                                                </div>

                                                                                                {/* Actions */}
                                                                                                <div className="flex gap-2">
                                                                                                    {booking.status === 'confirmed' && parseISO(booking.startTime) > new Date() && (
                                                                                                        <button
                                                                                                            onClick={(e) => { e.stopPropagation(); openCancelModal(booking._id); }}
                                                                                                            className="flex-1 py-1.5 rounded border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-[10px] font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1.5"
                                                                                                        >
                                                                                                            <FaTimesCircle size={10} /> Cancel
                                                                                                        </button>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                    <div className="bg-brand-50 dark:bg-brand-900/20 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl text-brand-500 dark:text-brand-400">
                                        <FaBookOpen />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No bookings found</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                        You don't have any bookings for <span className="font-semibold text-gray-700 dark:text-gray-300">{format(selectedDate, 'MMM do')}</span> matching your filters.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* History View */}
                {activeTab === 'history' && renderHistoryList()}
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <BookingDetailsModal
                    booking={{
                        ...selectedBooking,
                        user: (selectedBooking.user && selectedBooking.user.name) ? selectedBooking.user : user
                    }}
                    onClose={() => setSelectedBooking(null)}
                    onCancel={openCancelModal}
                />
            )}

            {/* Cancellation Reason Modal */}
            <AnimatePresence>
                {cancelModal.isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setCancelModal(prev => ({ ...prev, isOpen: false }))}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cancel Booking</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please select a reason for cancellation.</p>
                            </div>

                            <div className="p-6 space-y-4">
                                {CANCELLATION_REASONS.map((reason) => (
                                    <label key={reason} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <input
                                            type="radio"
                                            name="cancellationReason"
                                            value={reason}
                                            checked={cancelModal.reason === reason}
                                            onChange={(e) => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
                                            className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{reason}</span>
                                    </label>
                                ))}

                                {cancelModal.reason === 'Other' && (
                                    <textarea
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm"
                                        placeholder="Please specify the reason (max 250 chars)..."
                                        maxLength={250}
                                        rows={3}
                                        value={cancelModal.customReason}
                                        onChange={(e) => setCancelModal(prev => ({ ...prev, customReason: e.target.value }))}
                                    />
                                )}
                            </div>

                            <div className="p-6 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                                <button
                                    onClick={() => setCancelModal(prev => ({ ...prev, isOpen: false }))}
                                    className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Keep Booking
                                </button>
                                <button
                                    onClick={handleConfirmCancel}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm transition-colors"
                                >
                                    Confirm Cancellation
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyBookings;
