import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaEnvelope, FaBan, FaCheckCircle, FaExclamationTriangle, FaCalendarPlus } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { handleCalendarExport } from '../../utils/calendar';

const BookingDetailsModal = ({ booking, onClose, onCancel, showAddToCalendar = true }) => {
    if (!booking) return null;

    const {
        status,
        startTime,
        endTime,
        studio,
        user,
        studioUnit,
        _id
    } = booking;

    const startDate = parseISO(startTime);
    const endDate = parseISO(endTime);

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'cancelled': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            default: return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal: Ticket Style */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header Banner */}
                    <div className="relative h-32 bg-gradient-to-r from-brand-600 to-brand-400 flex items-center justify-center p-6 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors"
                        >
                            <FaTimes />
                        </button>
                        <div className="text-center z-10 text-white">
                            <h2 className="text-2xl font-bold font-display">{studio?.name || 'Studio Booking'}</h2>
                            <div className="flex items-center justify-center gap-2 text-brand-100 text-sm mt-1">
                                <FaMapMarkerAlt />
                                <span>{studio?.city || studio?.location || 'Unknown Location'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Body (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Status & Unit */}
                        <div className="flex items-center justify-between">
                            <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${getStatusColor(status)}`}>
                                {status === 'confirmed' ? <FaCheckCircle /> : status === 'cancelled' ? <FaBan /> : <FaExclamationTriangle />}
                                {status}
                            </div>
                            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                Unit: <span className="text-gray-900 dark:text-white">{studioUnit || 'General'}</span>
                            </div>
                        </div>

                        {/* Date & Time Section - Big Typography */}
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Reserved Slot</h3>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 font-display">
                                {format(startDate, 'EEEE, MMM do')}
                            </div>
                            <div className="text-xl text-brand-600 dark:text-brand-400 font-mono font-semibold flex items-center gap-2">
                                <FaClock className="text-lg" />
                                {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                            </div>
                        </div>

                        {/* Dotted Divider for "Ticket stub" feel */}
                        <div className="relative flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-gray-100 dark:bg-gray-900 -ml-8"></div> {/* Left notch */}
                            <div className="flex-1 border-b-2 border-dashed border-gray-200 dark:border-gray-600"></div>
                            <div className="h-4 w-4 rounded-full bg-gray-100 dark:bg-gray-900 -mr-8"></div> {/* Right notch */}
                        </div>

                        {/* User Details */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <FaUser className="text-brand-500" /> User Details
                            </h4>
                            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-3 rounded-xl">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900 dark:to-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xl">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-gray-900 dark:text-white">{user?.name || 'Unknown User'}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                        <FaEnvelope size={12} /> {user?.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Booking Reference ID */}
                        <div className="text-center">
                            <p className="text-[10px] uppercase text-gray-400 dark:text-gray-600 tracking-widest font-mono select-all">
                                Ref: {_id}
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                        {showAddToCalendar && (
                            <button
                                onClick={() => handleCalendarExport(booking)}
                                className="w-full py-3 rounded-xl bg-white dark:bg-gray-800 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 font-semibold shadow-sm hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:border-brand-300 transition-all flex items-center justify-center gap-2"
                            >
                                <FaCalendarPlus /> Add to Calendar
                            </button>
                        )}

                        {status === 'confirmed' && startDate > new Date() ? (
                            <button
                                onClick={() => onCancel(_id)}
                                className="w-full py-3 rounded-xl bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 transition-all flex items-center justify-center gap-2"
                            >
                                <FaBan /> Cancel this Booking
                            </button>
                        ) : status === 'confirmed' && startDate <= new Date() ? (
                            <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                This booking has already started/passed.
                            </div>
                        ) : status === 'cancelled' ? (
                            <div className="space-y-2">
                                <div className="text-center text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/10 py-2 rounded-lg border border-red-100 dark:border-red-900/30">
                                    <span className="font-bold">Booking Cancelled</span>
                                </div>
                                {booking.cancellationReason && (
                                    <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Reason:</span> {booking.cancellationReason}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                This booking is {status}.
                            </div>
                        )}
                    </div>
                </motion.div >
            </div >
        </AnimatePresence >
    );
};

export default BookingDetailsModal;
