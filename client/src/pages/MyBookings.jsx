import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/apiConfig';

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${API_BASE_URL}/bookings/my`, config);
                setBookings(data);
            } catch (error) {
                console.error(error);
            }
        };
        if (user) fetchBookings();
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
        } catch (error) {
            console.error('Error cancelling booking:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">My Bookings</h1>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Bookings: <span className="font-bold text-brand-600 dark:text-brand-400">{bookings.length}</span>
                    </div>
                </div>

                <div className="grid gap-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="glass-card rounded-2xl p-6 transition-all hover:shadow-xl hover:scale-[1.01] border border-gray-100 dark:border-gray-700/50">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                        {booking.studio?.name || 'Unknown Studio'}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                                            <span className="font-medium">Unit:</span> {booking.studioUnit || 'N/A'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {new Date(booking.startTime).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                                            {new Date(booking.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 self-end sm:self-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${booking.status === 'confirmed'
                                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30'
                                        : booking.status === 'cancelled'
                                            ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                                            : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30'
                                        }`}>
                                        {booking.status}
                                    </span>

                                    {booking.status === 'confirmed' && (
                                        <button
                                            onClick={() => handleCancelBooking(booking._id)}
                                            className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {bookings.length === 0 && (
                        <div className="text-center py-20 glass-card rounded-3xl border-dashed border-2 border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">You haven't made any bookings yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
