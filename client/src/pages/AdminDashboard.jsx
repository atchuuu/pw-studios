import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import UserList from '../components/Admin/UserList';
import StudioList from '../components/Admin/StudioList';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('users');

    if (user.role !== 'super_admin' && user.role !== 'studio_admin') {
        return <div className="p-8 text-center text-red-500">Access Denied</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {user.role === 'super_admin' && (
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`${activeTab === 'users'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            User Management
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('studios')}
                        className={`${activeTab === 'studios'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Studio Management
                    </button>
                </nav>
            </div>

            {activeTab === 'users' && user.role === 'super_admin' && <UserList />}
            {activeTab === 'studios' && <StudioList />}
        </div>
    );
};

export default AdminDashboard;
