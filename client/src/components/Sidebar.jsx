import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTimes, FaSearch, FaCalendarAlt, FaUserShield, FaSignOutAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { API_BASE_URL } from '../utils/apiConfig';
import { useState } from 'react';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-[70] flex flex-col border-l border-gray-200 dark:border-gray-800"
                    >
                        {/* Sidebar Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Menu</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {user && (
                                <Link
                                    to="/profile"
                                    onClick={onClose}
                                    className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                >
                                    <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xl overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-sm">
                                        {user.profilePicture && !imageError ? (
                                            <img
                                                src={user.profilePicture.startsWith('http') || user.profilePicture.startsWith('/assets') ? user.profilePicture : `${API_BASE_URL}${user.profilePicture}`}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            user.name ? user.name.charAt(0) : 'U'
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                    </div>
                                </Link>
                            )}

                            <div className="space-y-2">
                                <Link
                                    to="/"
                                    onClick={onClose}
                                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-brand-900/10 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium"
                                >
                                    <FaSearch className="text-gray-400" /> Browse Studios
                                </Link>
                                <Link
                                    to="/bookings"
                                    onClick={onClose}
                                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-brand-900/10 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium"
                                >
                                    <FaCalendarAlt className="text-gray-400" /> My Bookings
                                </Link>
                                {user && (user.role === 'super_admin' || user.role === 'studio_admin' || user.role === 'faculty_coordinator') && (
                                    <Link
                                        to="/admin"
                                        onClick={onClose}
                                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-brand-900/10 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium"
                                    >
                                        <FaUserShield className="text-gray-400" /> Admin Dashboard
                                    </Link>
                                )}
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-gray-700 dark:text-gray-200 font-medium">Appearance</span>
                                    <ThemeToggle />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 py-3.5 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
