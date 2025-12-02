import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaChevronDown, FaChevronUp, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUser, FaList, FaThLarge } from 'react-icons/fa';
import { API_BASE_URL } from '../../utils/apiConfig';

const AllBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [filters, setFilters] = useState({
        user: '',
        location: '',
        date: ''
    });
    const [expandedStudios, setExpandedStudios] = useState({});

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                let query = `?`;
                if (filters.user) query += `&user=${filters.user}`;
                if (filters.location) query += `&location=${filters.location}`;
                if (filters.date) query += `&date=${filters.date}`;

                const { data } = await axios.get(`${API_BASE_URL}/bookings${query}`, config);
                setBookings(data);

                // Initialize all studios as expanded by default
                const studioIds = [...new Set(data.map(b => b.studio?._id))];
                const initialExpanded = {};
                studioIds.forEach(id => initialExpanded[id] = true);
                setExpandedStudios(initialExpanded);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchBookings();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [user, filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {}, config);

            // Update UI
            setBookings(bookings.map(b =>
                b._id === bookingId ? { ...b, status: 'cancelled' } : b
            ));
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const toggleStudio = (studioId) => {
        setExpandedStudios(prev => ({
            ...prev,
            [studioId]: !prev[studioId]
        }));
    };

    // Group bookings by Studio
    const groupedBookings = bookings.reduce((acc, booking) => {
        const studioId = booking.studio?._id || 'unknown';
        const studioName = booking.studio?.name || 'Unknown Studio';
        const studioLocation = booking.studio?.location || '';

        if (!acc[studioId]) {
            acc[studioId] = {
                id: studioId,
                name: studioName,
                location: studioLocation,
                bookings: []
            };
        }
        acc[studioId].bookings.push(booking);
        return acc;
    }, {});

    // Calendar View Logic
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    const getBookingsForDay = (day) => {
        return bookings.filter(b => {
            const d = new Date(b.startTime);
            return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
    };

    if (loading && bookings.length === 0) return <div className="p-10 text-center text-gray-500">Loading bookings...</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Bookings</h2>
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                            title="List View"
                        >
                            <FaList />
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                            title="Calendar View"
                        >
                            <FaThLarge />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            name="user"
                            placeholder="Search user..."
                            className="pl-9 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={filters.user}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="relative flex-1 md:flex-none">
                        <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            name="location"
                            placeholder="Filter location..."
                            className="pl-9 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={filters.location}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="relative flex-1 md:flex-none">
                        <input
                            type="date"
                            name="date"
                            className="pl-3 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={filters.date}
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="space-y-6">
                    {Object.values(groupedBookings).map((group) => (
                        <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                            <div
                                className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => toggleStudio(group.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{group.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{group.location} • {group.bookings.length} Bookings</p>
                                    </div>
                                </div>
                                <div className="text-gray-400">
                                    {expandedStudios[group.id] ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedStudios[group.id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                                                <thead className="bg-white dark:bg-gray-800">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {group.bookings.map((booking) => (
                                                        <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-xs font-bold">
                                                                        {booking.user?.name?.charAt(0) || <FaUser />}
                                                                    </div>
                                                                    <div className="ml-3">
                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.user?.name || 'Unknown'}</div>
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{booking.user?.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex flex-col text-sm text-gray-900 dark:text-white">
                                                                    <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                                                                        <FaCalendarAlt size={10} /> {new Date(booking.startTime).toLocaleDateString()}
                                                                    </span>
                                                                    <span className="flex items-center gap-2 font-medium">
                                                                        <FaClock size={10} className="text-primary" />
                                                                        {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                                        {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full border ${booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                        booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                    }`}>
                                                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                {booking.status === 'confirmed' && (
                                                                    <button
                                                                        onClick={() => handleCancelBooking(booking._id)}
                                                                        className="text-red-600 hover:text-red-800 font-medium text-xs hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-100"
                                                                    >
                                                                        Cancel Booking
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}

                    {bookings.length === 0 && (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <div className="text-gray-400 mb-3 text-4xl">📅</div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No bookings found</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Try adjusting your filters to see more results.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="grid grid-cols-7 gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                                {day}
                            </div>
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayBookings = getBookingsForDay(day);
                            return (
                                <div key={day} className="min-h-[100px] border border-gray-100 dark:border-gray-700 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{day}</div>
                                    <div className="space-y-1">
                                        {dayBookings.slice(0, 3).map(b => (
                                            <div key={b._id} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded truncate" title={`${b.studio?.name} - ${b.user?.name}`}>
                                                {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        ))}
                                        {dayBookings.length > 3 && (
                                            <div className="text-[10px] text-gray-400 text-center">+{dayBookings.length - 3} more</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllBookings;
