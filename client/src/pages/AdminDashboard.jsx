import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserList from '../components/Admin/UserList';
import StudioList from '../components/Admin/StudioList';
import AllBookings from '../components/Admin/AllBookings';
import { FaBuilding, FaUsers, FaCalendarCheck, FaChartPie } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('studios');

    if (user.role !== 'super_admin' && user.role !== 'studio_admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h2>
                    <p className="text-gray-600 dark:text-gray-400">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'studios', label: 'Studios', icon: <FaBuilding />, roles: ['super_admin', 'studio_admin'] },
        { id: 'users', label: 'Users', icon: <FaUsers />, roles: ['super_admin'] },
        { id: 'bookings', label: 'Bookings', icon: <FaCalendarCheck />, roles: ['super_admin'] },
    ];

    const allowedTabs = tabs.filter(tab => tab.roles.includes(user.role));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">Admin Portal</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Manage studios, users, and bookings</p>
                </div>

                {/* Top Navigation */}
                <div className="flex justify-center mb-10">
                    <div className="glass p-1.5 rounded-2xl shadow-lg inline-flex border border-white/20 dark:border-gray-700/50 backdrop-blur-xl bg-white/40 dark:bg-black/40">
                        {allowedTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'studios' && <StudioList />}
                        {activeTab === 'users' && user.role === 'super_admin' && <UserList />}
                        {activeTab === 'bookings' && user.role === 'super_admin' && <AllBookings />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminDashboard;
