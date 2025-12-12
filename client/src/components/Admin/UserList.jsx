import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaUserShield, FaUserTie, FaChalkboardTeacher, FaUser } from 'react-icons/fa';
import { API_BASE_URL } from '../../utils/apiConfig';
import { motion } from 'framer-motion';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeRoleTab, setActiveRoleTab] = useState('all');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedStudioIds, setSelectedStudioIds] = useState([]);
    const [expandedRows, setExpandedRows] = useState(new Set()); // Track expanded user rows

    const toggleRowExpansion = (userId) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    useEffect(() => {
        fetchUsers();
        fetchStudios();
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

    const fetchStudios = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            };
            // Assuming this endpoint returns all studios for admin
            // If not, use /api/studios (public) or /api/admin/studios
            const { data } = await axios.get(`${API_BASE_URL}/studios`, config);
            setStudios(data);
        } catch (err) {
            console.error("Failed to fetch studios for assignment", err);
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

    const openAssignmentModal = (user) => {
        setSelectedUser(user);
        setSelectedStudioIds(user.assignedStudios ? user.assignedStudios.map(s => s._id || s) : []);
        setIsModalOpen(true);
    };

    const handleAssignStudios = async () => {
        if (!selectedUser) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            };

            const updatedUser = {
                ...selectedUser,
                assignedStudios: selectedStudioIds
            };

            const { data } = await axios.put(`${API_BASE_URL}/admin/users/${selectedUser._id}`, updatedUser, config);

            // Update local state
            setUsers(users.map(u => u._id === selectedUser._id ? data : u));
            setIsModalOpen(false);
            setSelectedUser(null);
            setSelectedStudioIds([]);
        } catch (err) {
            setError('Failed to assign studios');
        }
    };

    const toggleStudioSelection = (studioId) => {
        if (selectedStudioIds.includes(studioId)) {
            setSelectedStudioIds(prev => prev.filter(id => id !== studioId));
        } else {
            setSelectedStudioIds(prev => [...prev, studioId]);
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
                        id="user-search"
                        name="search"
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned Studios</th>
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
                                    <td className="px-6 py-4">
                                        {(user.role === 'studio_admin' || user.role === 'faculty_coordinator') ? (
                                            <div className="flex flex-col gap-2 min-w-[200px]">
                                                {user.assignedStudios && user.assignedStudios.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {user.assignedStudios.slice(0, expandedRows.has(user._id) ? undefined : 2).map((studio, idx) => (
                                                            <div key={idx} title={studio.studioCode} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
                                                                {studio.name}
                                                            </div>
                                                        ))}
                                                        {user.assignedStudios.length > 2 && (
                                                            <button
                                                                onClick={() => toggleRowExpansion(user._id)}
                                                                className="text-xs font-medium text-primary hover:text-primary-dark hover:underline py-1 px-1 transition-colors"
                                                            >
                                                                {expandedRows.has(user._id) ? 'Show Less' : `+${user.assignedStudios.length - 2} More`}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                        No studios assigned
                                                    </span>
                                                )}

                                                {currentUser.role === 'super_admin' && (
                                                    <button
                                                        onClick={() => openAssignmentModal(user)}
                                                        className="text-[10px] text-gray-400 hover:text-primary font-medium uppercase tracking-wider flex items-center gap-1 mt-1 transition-colors"
                                                    >
                                                        <FaUserShield size={10} />
                                                        Manage Access
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Not applicable</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {currentUser.role === 'super_admin' ? (
                                            <select
                                                id={`role-select-${user._id}`}
                                                name="role"
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
                                        ) : (
                                            <span className="text-xs text-gray-500 italic">Read Only</span>
                                        )}
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

            {/* Assignment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Assign Studios to <span className="text-primary">{selectedUser?.name}</span>
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Select the studios this user should have access to manage.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {studios.map(studio => (
                                    <div
                                        key={studio._id}
                                        onClick={() => toggleStudioSelection(studio._id)}
                                        className={`
                                            p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3
                                            ${selectedStudioIds.includes(studio._id)
                                                ? 'bg-primary/10 border-primary text-primary-dark dark:text-primary-light'
                                                : 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-primary/50 text-gray-700 dark:text-gray-300'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            h-5 w-5 rounded border flex items-center justify-center flex-shrink-0
                                            ${selectedStudioIds.includes(studio._id)
                                                ? 'bg-primary border-primary text-white'
                                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-500'
                                            }
                                        `}>
                                            {selectedStudioIds.includes(studio._id) && '✓'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{studio.name}</p>
                                            <p className="text-xs opacity-70">{studio.city}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignStudios}
                                className="px-6 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark shadow-sm transition-all"
                            >
                                Save Assignments
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
