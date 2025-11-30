import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaShieldAlt, FaCamera, FaSpinner, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

import profileBanner from '../assets/profile-banner.png';

const UserProfile = () => {
    const { user, updateUser } = useAuth();
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                    {/* Header / Cover */}
                    <div
                        className="h-32 bg-cover bg-center relative"
                        style={{ backgroundImage: `url(${profileBanner})` }}
                    >
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    {/* Profile Picture Section */}
                    <div className="relative -mt-16 text-center">
                        <div className="relative inline-block">
                            <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 p-1 shadow-xl mx-auto relative group">
                                {user.profilePicture ? (
                                    <img
                                        src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_SERVER_URL}${user.profilePicture}`}
                                        alt={user.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl font-bold text-gray-500 dark:text-gray-400">
                                        {user.name.charAt(0)}
                                    </div>
                                )}

                                {/* Remove Button */}
                                {user.profilePicture && (
                                    <button
                                        onClick={handleRemovePicture}
                                        className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors z-10"
                                        title="Remove Picture"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                )}
                            </div>

                            <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-primary cursor-pointer">
                                {uploading ? <FaSpinner className="animate-spin" size={14} /> : <FaCamera size={14} />}
                            </label>
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{user.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
                    </div>

                    {/* Vertical Content */}
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                <FaUser />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</p>
                                <p className="text-base font-bold text-gray-900 dark:text-white">{user.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                                <FaEnvelope />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</p>
                                <p className="text-base font-bold text-gray-900 dark:text-white break-all">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                                <FaShieldAlt />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</p>
                                <p className="text-base font-bold text-gray-900 dark:text-white capitalize">{user.role.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserProfile;
