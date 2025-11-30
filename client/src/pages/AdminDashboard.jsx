import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserList from '../components/Admin/UserList';
import StudioList from '../components/Admin/StudioList';
import AllBookings from '../components/Admin/AllBookings';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('studios');

    if (user.role !== 'super_admin' && user.role !== 'studio_admin') {
        return <div className="p-8 text-center text-red-500">Access Denied</div>;
    }

    const tabs = [
        { id: 'studios', label: 'Studios', roles: ['super_admin', 'studio_admin'] },
        { id: 'users', label: 'Users', roles: ['super_admin'] },
        { id: 'bookings', label: 'Bookings', roles: ['super_admin'] },
    ];

    const allowedTabs = tabs.filter(tab => tab.roles.includes(user.role));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {allowedTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'studios' && <StudioList />}
                {activeTab === 'users' && user.role === 'super_admin' && <UserList />}
                {activeTab === 'bookings' && user.role === 'super_admin' && <AllBookings />}
            </div>
        </div>
    );
};

export default AdminDashboard;
