import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/apiConfig';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaVideo } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // If super_admin, fetch all bookings, else fetch my bookings
                const endpoint = user.role === 'super_admin' ? '/bookings' : '/bookings/my';
                const { data } = await axios.get(`${API_BASE_URL}${endpoint}`, config);
                setBookings(data);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [user]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    {user.role === 'super_admin' ? 'All Bookings' : 'My Bookings'}
                </h1>

                {bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No bookings found</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">You haven't made any bookings yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking, index) => (
                            <motion.div
                                key={booking._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {booking.studio?.name || 'Unknown Studio'}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                booking.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <FaVideo className="text-primary" />
                                            Unit: <span className="font-semibold">{booking.studioUnit}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-primary" />
                                            {booking.studio?.city}, {booking.studio?.area}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-primary" />
                                            {formatDate(booking.startTime)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaClock className="text-primary" />
                                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                        </div>
                                    </div>

                                    {user.role === 'super_admin' && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Booked by: </span>
                                            <span className="font-medium text-gray-900 dark:text-white">{booking.user?.name} ({booking.user?.email})</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
