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
            alert(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {bookings.map((booking) => (
                        <li key={booking._id}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-primary truncate">
                                        {booking.studio?.name || 'Unknown Studio'}
                                    </p>
                                    <div className="ml-2 flex-shrink-0 flex items-center gap-2">
                                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </p>
                                        {booking.status === 'confirmed' && (
                                            <button
                                                onClick={() => handleCancelBooking(booking._id)}
                                                className="text-xs text-red-600 hover:text-red-800 font-medium border border-red-200 rounded px-2 py-1 hover:bg-red-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                    {bookings.length === 0 && (
                        <li className="px-4 py-8 text-center text-gray-500">No bookings found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default MyBookings;
