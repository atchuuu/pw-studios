import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaChevronDown, FaChevronUp, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUser, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaBookOpen } from 'react-icons/fa';
import { API_BASE_URL } from '../../utils/apiConfig';
import BrandLoader from '../common/BrandLoader';
import BookingDetailsModal from '../common/BookingDetailsModal';
import { format, addDays, subDays, startOfToday, isSameDay, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const TIME_SLOTS = [
    { id: 'all', label: 'All Time' },
    { id: 'morning', label: 'Morning (6AM - 12PM)', start: 6, end: 12 },
    { id: 'afternoon', label: 'Afternoon (12PM - 6PM)', start: 12, end: 18 },
    { id: 'evening', label: 'Evening (6PM - 11PM)', start: 18, end: 23 }
];

const AllBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('all');
    const [expandedStudios, setExpandedStudios] = useState({});
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Generate dates for the horizontal strip (next 30 days)
    const dates = Array.from({ length: 30 }, (_, i) => addDays(startOfToday(), i));
    const dateStripRef = useRef(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // Fetch all bookings - in a real app might want to filter by date range on backend
                const { data } = await axios.get(`${API_BASE_URL}/bookings`, config);
                setBookings(data);

                // Expand all by default initially? Or collapsed? Let's check user preference.
                // Collapsed is cleaner for the new list view.
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {}, config);

            // Update UI
            setBookings(bookings.map(b =>
                b._id === bookingId ? { ...b, status: 'cancelled' } : b
            ));

            // If modal is open for this booking, update it too (or close it)
            if (selectedBooking && selectedBooking._id === bookingId) {
                setSelectedBooking(prev => ({ ...prev, status: 'cancelled' }));
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
        }
    };

    const [expandedUnits, setExpandedUnits] = useState({});

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

    // --- Filtering Logic ---

    // 1. Filter by Date
    const bookingsForDate = bookings.filter(b =>
        isSameDay(parseISO(b.startTime), selectedDate)
    );

    // 2. Filter by Search Query (Studio Name or User Name)
    const searchedBookings = bookingsForDate.filter(b =>
        (b.studio?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 3. Filter by Time Slot
    const filteredBookings = searchedBookings.filter(b => {
        if (selectedTimeSlot === 'all') return true;
        const hour = parseISO(b.startTime).getHours();
        const slot = TIME_SLOTS.find(s => s.id === selectedTimeSlot);
        return slot ? (hour >= slot.start && hour < slot.end) : true;
    });

    // 4. Group by Studio -> Studio Unit
    const groupedBookings = filteredBookings.reduce((acc, booking) => {
        const studioId = booking.studio?._id || 'unknown';
        const studioName = booking.studio?.name || 'Unknown Studio';
        const studioCity = booking.studio?.city || booking.studio?.location || ''; // Fallback
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

    // Sort groups by Studio Name
    const sortedGroups = Object.values(groupedBookings).sort((a, b) => a.name.localeCompare(b.name));


    // 5. History Logic
    const [activeTab, setActiveTab] = useState('upcoming');
    const [selectedHistoryDate, setSelectedHistoryDate] = useState(subDays(startOfToday(), 1)); // Default to yesterday
    const [showDateRangePicker, setShowDateRangePicker] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // History Dates (Last 30 days)
    const historyDates = Array.from({ length: 30 }, (_, i) => subDays(startOfToday(), i + 1));

    const historyBookings = bookings.filter(b => new Date(b.startTime) < startOfToday());

    // 1. Filter functionality for History
    const historyBookingsForDate = historyBookings.filter(b => {
        const bookingDate = parseISO(b.startTime);

        if (showDateRangePicker && dateRange.start && dateRange.end) {
            const start = startOfDay(parseISO(dateRange.start));
            const end = endOfDay(parseISO(dateRange.end));
            return isWithinInterval(bookingDate, { start, end });
        }

        return isSameDay(bookingDate, selectedHistoryDate);
    });

    // 2. Filter History by Search
    const historyFiltered = historyBookingsForDate.filter(b =>
        (b.studio?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 3. Group History by Studio
    const historyGroupedByStudio = historyFiltered.reduce((acc, booking) => {
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

    const historySortedGroups = Object.values(historyGroupedByStudio).sort((a, b) => a.name.localeCompare(b.name));


    if (loading) return <BrandLoader text="Loading Bookings..." />;

    return (
        <div className="space-y-6">

            {/* Tab Navigation & Custom Range Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-xl w-fit">
                    <button
                        onClick={() => { setActiveTab('upcoming'); setShowDateRangePicker(false); }}
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

                {activeTab === 'history' && (
                    <button
                        onClick={() => setShowDateRangePicker(!showDateRangePicker)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${showDateRangePicker
                            ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-400'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                    >
                        <FaCalendarAlt />
                        {showDateRangePicker ? 'Close Custom Range' : 'Custom Range'}
                    </button>
                )}
            </div>

            {activeTab === 'upcoming' && (
                <>
                    {/* --- Top Controls: Search & Time Filter --- */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        {/* Search */}
                        <div className="relative w-full md:w-96 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                            </div>
                            <input
                                id="bookings-search"
                                name="searchQuery"
                                type="text"
                                placeholder="Search studio or user..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl leading-5 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                            />
                        </div>

                        {/* Time Slot Filter */}
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
                    </div>

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
                                                                                {unitBookings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map((booking) => (
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

                                                                                            {/* User Info Row */}
                                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                                <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold text-[10px]">
                                                                                                    {booking.user?.name?.charAt(0) || <FaUser size={10} />}
                                                                                                </div>
                                                                                                <div className="overflow-hidden min-w-0">
                                                                                                    <p className="font-semibold text-gray-900 dark:text-white truncate text-xs">{booking.user?.name || 'Unknown User'}</p>
                                                                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{booking.user?.email}</p>
                                                                                                </div>
                                                                                            </div>

                                                                                            {/* Actions */}
                                                                                            {booking.status === 'confirmed' && parseISO(booking.startTime) > new Date() && (
                                                                                                <button
                                                                                                    onClick={(e) => { e.stopPropagation(); handleCancelBooking(booking._id); }}
                                                                                                    className="w-full py-1.5 rounded border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-[10px] font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1.5"
                                                                                                >
                                                                                                    <FaTimesCircle size={10} /> Cancel
                                                                                                </button>
                                                                                            )}
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
                                <p className="text-gray-500 dark:text-gray-400">No upcoming bookings found for this date.</p>
                            </div>
                        )}
                    </div>
                </>
            )
            }

            {/* History View (Studio-wise Grouping) */}
            {
                activeTab === 'history' && (
                    <div className="space-y-4">
                        {/* --- History Date Strip --- */}
                        <div className="bg-white dark:bg-gray-800 py-4 px-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex gap-3 overflow-x-auto pb-2 px-2 scroll-smooth">
                                {historyDates.map((date, index) => {
                                    const isSelected = !showDateRangePicker && isSameDay(date, selectedHistoryDate);
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setSelectedHistoryDate(date);
                                                setShowDateRangePicker(false);
                                            }}
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

                        {/* Custom Range Button */}


                        {/* Custom Date Range Inputs */}
                        <AnimatePresence>
                            {showDateRangePicker && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, y: -10 }}
                                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                                    exit={{ height: 0, opacity: 0, y: -10 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-brand-200 dark:border-brand-900/50 shadow-lg shadow-brand-500/5 items-center">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <FaFilter className="text-brand-500" />
                                            Filter by Custom Range
                                        </h4>
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1 space-y-2">
                                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Start Date</label>
                                                <div className="relative">
                                                    <input
                                                        id="range-start-date"
                                                        name="startDate"
                                                        type="date"
                                                        value={dateRange.start}
                                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                                        max={format(subDays(startOfToday(), 1), 'yyyy-MM-dd')}
                                                        className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-medium"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">End Date</label>
                                                <div className="relative">
                                                    <input
                                                        id="range-end-date"
                                                        name="endDate"
                                                        type="date"
                                                        value={dateRange.end}
                                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                                        min={dateRange.start}
                                                        max={format(subDays(startOfToday(), 1), 'yyyy-MM-dd')}
                                                        className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-medium"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FaCalendarAlt className="text-brand-500" />
                                {showDateRangePicker && dateRange.start && dateRange.end
                                    ? <span>History from <span className="text-brand-600 dark:text-brand-400">{format(parseISO(dateRange.start), 'MMM do')}</span> to <span className="text-brand-600 dark:text-brand-400">{format(parseISO(dateRange.end), 'MMM do, yyyy')}</span></span>
                                    : <span>History for <span className="text-brand-600 dark:text-brand-400">{format(selectedHistoryDate, 'MMMM do, yyyy')}</span></span>
                                }
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                {historyFiltered.length} total
                            </span>
                        </div>

                        {historySortedGroups.length > 0 ? (
                            historySortedGroups.map((group) => (
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
                                                    {group.totalBookings} Booking{group.totalBookings !== 1 ? 's' : ''}
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
                                                                                            {/* Date Display (Crucial for History) */}
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

                                                                                            {/* User Info Row */}
                                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                                <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold text-[10px]">
                                                                                                    {booking.user?.name?.charAt(0) || <FaUser size={10} />}
                                                                                                </div>
                                                                                                <div className="overflow-hidden min-w-0">
                                                                                                    <p className="font-semibold text-gray-900 dark:text-white truncate text-xs">{booking.user?.name || 'Unknown User'}</p>
                                                                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{booking.user?.email}</p>
                                                                                                </div>
                                                                                            </div>

                                                                                            {/* Actions */}
                                                                                            {booking.status === 'confirmed' && parseISO(booking.startTime) > new Date() && (
                                                                                                <button
                                                                                                    onClick={(e) => { e.stopPropagation(); handleCancelBooking(booking._id); }}
                                                                                                    className="w-full py-1.5 rounded border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-[10px] font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1.5"
                                                                                                >
                                                                                                    <FaTimesCircle size={10} /> Cancel
                                                                                                </button>
                                                                                            )}
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
                                <p className="text-gray-500 dark:text-gray-400">No past bookings found for this date.</p>
                            </div>
                        )}
                    </div>
                )
            }

            {/* --- Booking Details Modal --- */}
            {
                selectedBooking && (
                    <BookingDetailsModal
                        booking={selectedBooking}
                        onClose={() => setSelectedBooking(null)}
                        onCancel={handleCancelBooking}
                        showAddToCalendar={false}
                    />
                )
            }
        </div >
    );
};

export default AllBookings;
