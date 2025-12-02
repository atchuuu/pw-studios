import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaShieldAlt, FaCamera, FaSpinner, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

import profileBanner from '../assets/profile-banner.png';

const UserProfile = () => {
    const { user, updateUser } = useAuth(); // Assuming login updates the user state, or we might need a dedicated updateUser function in context
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const { data: imagePath } = await axios.post(`${API_BASE_URL}/upload?type=profile`, formData, config);

            // Now update user profile with new image path
            const userConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data: updatedUser } = await axios.put(`${API_BASE_URL}/auth/profile`, { profilePicture: imagePath }, userConfig);

            updateUser(updatedUser);
            setUploading(false);

        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    const handleRemovePicture = async () => {
        if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

        try {
            const userConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data: updatedUser } = await axios.put(`${API_BASE_URL}/auth/profile`, { profilePicture: null }, userConfig);
            updateUser(updatedUser);
        } catch (error) {
            console.error(error);
        }
    };

    if (!user) return <div className="flex justify-center items-center h-screen text-gray-500">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-lg mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-card rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700/50 shadow-2xl"
                >
                    {/* Header / Cover */}
                    <div
                        className="h-40 bg-cover bg-center relative"
                        style={{ backgroundImage: `url(${profileBanner})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60"></div>
                        <div className="absolute inset-0 bg-brand-900/20 mix-blend-overlay"></div>
                    </div>

                    {/* Profile Picture Section */}
                    <div className="relative -mt-20 text-center px-6">
                        <div className="relative inline-block">
                            <div className="w-40 h-40 rounded-full bg-white dark:bg-dark-card p-1.5 shadow-2xl mx-auto relative group ring-4 ring-white/10 dark:ring-black/20">
                                {user.profilePicture ? (
                                    <img
                                        src={user.profilePicture.startsWith('http') || user.profilePicture.startsWith('/assets') ? user.profilePicture : `${import.meta.env.VITE_SERVER_URL}${user.profilePicture}`}
                                        alt={user.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/40 dark:to-brand-800/20 flex items-center justify-center text-5xl font-bold text-brand-500 dark:text-brand-400">
                                        {user.name.charAt(0)}
                                    </div>
                                )}

                                {/* Remove Button */}
                                {user.profilePicture && (
                                    <button
                                        onClick={handleRemovePicture}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-2.5 rounded-full shadow-lg hover:bg-red-600 transition-all z-10 hover:scale-110"
                                        title="Remove Picture"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                )}
                            </div>

                            <label htmlFor="profile-upload" className="absolute bottom-2 right-2 bg-brand-600 text-white p-3 rounded-full shadow-lg hover:bg-brand-700 transition-all cursor-pointer hover:scale-110 ring-4 ring-white dark:ring-dark-card">
                                {uploading ? <FaSpinner className="animate-spin" size={16} /> : <FaCamera size={16} />}
                            </label>
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mt-4">{user.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{user.email}</p>
                    </div>

                    {/* Vertical Content */}
                    <div className="p-8 space-y-4">
                        <div className="flex items-center gap-5 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                            <div className="p-3.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl shadow-sm">
                                <FaUser size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Full Name</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                            <div className="p-3.5 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl shadow-sm">
                                <FaEnvelope size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Email</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white break-all">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                            <div className="p-3.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl shadow-sm">
                                <FaShieldAlt size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Role</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{user.role.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserProfile;
