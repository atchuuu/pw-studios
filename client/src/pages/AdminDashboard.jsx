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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Manage studios, users, and bookings</p>
                </div>

                {/* Top Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 inline-flex">
                        {allowedTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-primary text-white shadow-md shadow-primary/25'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                {tab.icon}
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
                        transition={{ duration: 0.2 }}
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
