import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaUserShield, FaUserTie, FaChalkboardTeacher, FaUser } from 'react-icons/fa';
import { API_BASE_URL } from '../../utils/apiConfig';
import { motion } from 'framer-motion';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeRoleTab, setActiveRoleTab] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            };
            const { data } = await axios.get(`${API_BASE_URL}/admin/users`, config);
            setUsers(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch users');
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            };
            await axios.put(`${API_BASE_URL}/admin/users/${userId}`, { role: newRole }, config);
            // Update local state
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            setError('Failed to update user role');
        }
    };

    const roleTabs = [
        { id: 'all', label: 'All Users', icon: null },
        { id: 'super_admin', label: 'Super Admins', icon: <FaUserShield className="text-purple-500" /> },
        { id: 'studio_admin', label: 'Studio Admins', icon: <FaUserTie className="text-blue-500" /> },
        { id: 'faculty_coordinator', label: 'Coordinators', icon: <FaChalkboardTeacher className="text-orange-500" /> },
        { id: 'faculty', label: 'Faculty', icon: <FaUser className="text-green-500" /> },
    ];

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = activeRoleTab === 'all' || user.role === activeRoleTab;
        return matchesSearch && matchesRole;
    });

    if (loading) return <div className="p-10 text-center text-gray-500">Loading users...</div>;

    return (
        <div>
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="pl-10 p-3 w-full border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Role Tabs */}
            <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
                {roleTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveRoleTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeRoleTab === tab.id
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                        <span className="ml-1 opacity-60 text-xs bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded-full">
                            {tab.id === 'all' ? users.length : users.filter(u => u.role === tab.id).length}
                        </span>
                    </button>
                ))}
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.map((user) => (
                                <motion.tr
                                    key={user._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${user.role === 'super_admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                user.role === 'studio_admin' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    user.role === 'faculty_coordinator' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                        'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            className="block w-full max-w-[180px] pl-3 pr-8 py-2 text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow cursor-pointer hover:border-gray-300 dark:hover:border-gray-500"
                                            disabled={user.email === 'atchuta.jommala@pw.live'}
                                        >
                                            <option value="faculty">Faculty</option>
                                            <option value="faculty_coordinator">Faculty Coordinator</option>
                                            <option value="studio_admin">Studio Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        No users found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;
