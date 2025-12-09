import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/apiConfig';
import toast from 'react-hot-toast';
import { FaPlus, FaMapMarkerAlt, FaUsers, FaTools, FaImage, FaEdit, FaTrash, FaGlobe } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import StudioModal from './StudioModal';
import { StudioCardSkeleton } from '../common/SkeletonLoader';

const StudioList = () => {
    const { user } = useAuth();
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudio, setSelectedStudio] = useState(null);

    const fetchStudios = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/studios`, config);
            setStudios(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error("Failed to load studios");
        }
    };

    useEffect(() => {
        fetchStudios();
    }, []);

    const handleSaveStudio = async (studioData, studioId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            if (studioId) {
                // Update
                await axios.put(`${API_BASE_URL}/studios/${studioId}`, studioData, config);
                toast.success('Studio updated successfully');
            } else {
                // Create
                await axios.post(`${API_BASE_URL}/studios`, studioData, config);
                toast.success('Studio created successfully');
            }

            fetchStudios(); // Refresh list
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Operation failed';
            toast.error(msg);
            throw error; // Re-throw so Modal knows it failed (optional, but good for UX logic if modal handles error state)
        }
    };

    const handleEdit = (studio) => {
        setSelectedStudio(studio);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedStudio(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this studio?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_BASE_URL}/studios/${id}`, config);
            setStudios(studios.filter(s => s._id !== id));
            toast.success('Studio deleted successfully');
        } catch (error) {
            console.error(error);
            toast.error('Error deleting studio');
        }
    };

    // Helper for image URLs
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('/assets')) return url;
        return `${API_BASE_URL}${url}`;
    };

    if (loading) return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    {/* Skeleton for Header Text */}
                    <div className="h-8 w-48 bg-gray-200 dark:bg-white/5 rounded-lg animate-pulse mb-2"></div>
                    <div className="h-4 w-64 bg-gray-200 dark:bg-white/5 rounded-lg animate-pulse"></div>
                </div>
                {/* Skeleton for Button */}
                <div className="h-12 w-40 bg-gray-200 dark:bg-white/5 rounded-xl animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <StudioCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Studios</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage all studio locations</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30 transform hover:scale-105 active:scale-95 duration-200"
                >
                    <FaPlus /> Add New Studio
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {studios.map((studio) => (
                        <motion.div
                            key={studio._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.90 }}
                            layout
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                                {studio.coverPhoto ? (
                                    <img src={getImageUrl(studio.coverPhoto)} alt={studio.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-2">
                                        <FaImage size={32} />
                                        <span className="text-xs">No Image</span>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <button
                                        onClick={() => handleEdit(studio)}
                                        className="p-2 bg-white/90 dark:bg-black/80 rounded-full text-brand-600 hover:text-brand-500 shadow-lg backdrop-blur-sm"
                                        title="Edit Studio"
                                    >
                                        <FaEdit size={14} />
                                    </button>
                                    {user.role === 'super_admin' && (
                                        <button
                                            onClick={() => handleDelete(studio._id)}
                                            className="p-2 bg-white/90 dark:bg-black/80 rounded-full text-red-500 hover:text-red-400 shadow-lg backdrop-blur-sm"
                                            title="Delete Studio"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                    <h3 className="text-lg font-bold text-white mb-0.5 shadow-sm">{studio.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-200 font-medium">
                                        <FaMapMarkerAlt className="text-brand-400" /> {studio.city || studio.location}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                    <span className="flex items-center gap-1.5"><FaGlobe className="text-blue-500" /> {studio.studioCode || 'N/A'}</span>
                                    <span className="flex items-center gap-1.5"><FaUsers className="text-purple-500" /> {studio.numStudios || 1} Rooms</span>
                                    <span className="flex items-center gap-1.5"><FaTools className="text-orange-500" /> {studio.facilities?.length || 0}</span>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-2 h-[28px] overflow-hidden">
                                    {studio.facilities?.slice(0, 3).map((f, i) => (
                                        <span key={i} className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-200 dark:border-white/5 uppercase tracking-wider">{f}</span>
                                    ))}
                                    {studio.facilities?.length > 3 && (
                                        <span className="text-[10px] text-gray-400 py-1 font-bold">+{studio.facilities.length - 3}</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Studio Modal */}
            <StudioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                studio={selectedStudio}
                onSave={handleSaveStudio}
            />
        </div>
    );
};

export default StudioList;
