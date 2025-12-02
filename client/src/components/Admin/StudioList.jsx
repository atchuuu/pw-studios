import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/apiConfig';
import toast from 'react-hot-toast';
import { FaPlus, FaMapMarkerAlt, FaUsers, FaTools, FaImage, FaEdit, FaTrash, FaGlobe, FaMap } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const StudioList = () => {
    const { user } = useAuth();
    const [studios, setStudios] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStudioId, setCurrentStudioId] = useState(null);
    const [newStudio, setNewStudio] = useState({
        name: '', city: '', area: '', address: '', numStudios: 1, facilities: '',
        lat: '', lng: '', googleMapLink: '',
        coverPhoto: '/assets/profile-banner.png', interiorPhotos: '', exteriorPhotos: ''
    });

    const fetchStudios = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/studios`, config);
            setStudios(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudios();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const studioData = {
                ...newStudio,
                facilities: typeof newStudio.facilities === 'string' ? newStudio.facilities.split(',').map(f => f.trim()) : newStudio.facilities,
                interiorPhotos: typeof newStudio.interiorPhotos === 'string' ? newStudio.interiorPhotos.split(',').map(f => f.trim()).filter(f => f) : newStudio.interiorPhotos,
                exteriorPhotos: typeof newStudio.exteriorPhotos === 'string' ? newStudio.exteriorPhotos.split(',').map(f => f.trim()).filter(f => f) : newStudio.exteriorPhotos
            };

            if (isEditing) {
                await axios.put(`${API_BASE_URL}/studios/${currentStudioId}`, studioData, config);
                toast.success('Studio updated successfully');
            } else {
                await axios.post(`${API_BASE_URL}/studios`, studioData, config);
                toast.success('Studio created successfully');
            }

            resetForm();
            fetchStudios();
        } catch (error) {
            console.error(error);
            toast.error(isEditing ? 'Error updating studio' : 'Error creating studio');
        }
    };

    const handleEdit = (studio) => {
        setNewStudio({
            name: studio.name,
            city: studio.city || '',
            area: studio.area || '',
            address: studio.address,
            numStudios: studio.numStudios || 1,
            lat: studio.lat || '',
            lng: studio.lng || '',
            googleMapLink: studio.googleMapLink || '',
            facilities: studio.facilities.join(', '),
            coverPhoto: studio.coverPhoto || '/assets/profile-banner.png',
            interiorPhotos: studio.interiorPhotos.join(', '),
            exteriorPhotos: studio.exteriorPhotos.join(', ')
        });
        setIsEditing(true);
        setCurrentStudioId(studio._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const resetForm = () => {
        setNewStudio({
            name: '', city: '', area: '', address: '', numStudios: 1, facilities: '',
            lat: '', lng: '', googleMapLink: '',
            coverPhoto: '/assets/profile-banner.png', interiorPhotos: '', exteriorPhotos: ''
        });
        setIsEditing(false);
        setCurrentStudioId(null);
        setShowForm(false);
    };

    // Helper for image URLs
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('/assets')) return url;
        return `${API_BASE_URL}${url}`;
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading studios...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Studio Management</h2>
                <button
                    onClick={() => {
                        if (showForm && isEditing) {
                            resetForm();
                        } else {
                            setShowForm(!showForm);
                            if (!showForm) resetForm();
                        }
                    }}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-primary/30"
                >
                    {showForm ? 'Cancel' : <><FaPlus /> Add New Studio</>}
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{isEditing ? 'Edit Studio' : 'Create New Studio'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Studio Name"
                                    className="input-field"
                                    value={newStudio.name}
                                    onChange={(e) => setNewStudio({ ...newStudio, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    className="input-field"
                                    value={newStudio.city}
                                    onChange={(e) => setNewStudio({ ...newStudio, city: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Area"
                                    className="input-field"
                                    value={newStudio.area}
                                    onChange={(e) => setNewStudio({ ...newStudio, area: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Address"
                                    className="input-field"
                                    value={newStudio.address}
                                    onChange={(e) => setNewStudio({ ...newStudio, address: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Number of Studios"
                                    className="input-field"
                                    value={newStudio.numStudios}
                                    onChange={(e) => setNewStudio({ ...newStudio, numStudios: parseInt(e.target.value) })}
                                    required
                                    min="1"
                                />
                                <input
                                    type="text"
                                    placeholder="Facilities (comma separated)"
                                    className="input-field"
                                    value={newStudio.facilities}
                                    onChange={(e) => setNewStudio({ ...newStudio, facilities: e.target.value })}
                                />

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Latitude"
                                        className="input-field"
                                        value={newStudio.lat}
                                        onChange={(e) => setNewStudio({ ...newStudio, lat: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Longitude"
                                        className="input-field"
                                        value={newStudio.lng}
                                        onChange={(e) => setNewStudio({ ...newStudio, lng: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Google Map Link"
                                        className="input-field"
                                        value={newStudio.googleMapLink}
                                        onChange={(e) => setNewStudio({ ...newStudio, googleMapLink: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <FaImage /> Images (URLs)
                                    </h4>
                                    <input
                                        type="text"
                                        placeholder="/assets/profile-banner.png"
                                        className="input-field w-full"
                                        value={newStudio.coverPhoto}
                                        onChange={(e) => setNewStudio({ ...newStudio, coverPhoto: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Interior Photos (comma separated URLs)"
                                        className="input-field w-full"
                                        value={newStudio.interiorPhotos}
                                        onChange={(e) => setNewStudio({ ...newStudio, interiorPhotos: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Exterior Photos (comma separated URLs)"
                                        className="input-field w-full"
                                        value={newStudio.exteriorPhotos}
                                        onChange={(e) => setNewStudio({ ...newStudio, exteriorPhotos: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="bg-green-600 text-white px-8 py-2.5 rounded-xl hover:bg-green-700 font-medium shadow-lg shadow-green-600/20 transition-all">
                                    {isEditing ? 'Update Studio' : 'Save Studio'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studios.map((studio) => (
                    <motion.div
                        key={studio._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group"
                    >
                        <div className="h-40 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                            {studio.coverPhoto ? (
                                <img src={getImageUrl(studio.coverPhoto)} alt={studio.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <FaImage size={32} />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    onClick={() => handleEdit(studio)}
                                    className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-full text-blue-600 hover:text-blue-700 shadow-sm backdrop-blur-sm transition-transform hover:scale-110"
                                >
                                    <FaEdit size={14} />
                                </button>
                                {user.role === 'super_admin' && (
                                    <button
                                        onClick={() => handleDelete(studio._id)}
                                        className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-full text-red-600 hover:text-red-700 shadow-sm backdrop-blur-sm transition-transform hover:scale-110"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{studio.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                <FaMapMarkerAlt className="text-red-500" /> {studio.city || studio.location}{studio.area && `, ${studio.area}`}
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <span className="flex items-center gap-2"><FaGlobe className="text-blue-500" /> Studios: {studio.numStudios || 1}</span>
                                <span className="flex items-center gap-2"><FaTools className="text-orange-500" /> {studio.facilities.length} Facilities</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {studio.facilities.slice(0, 3).map((f, i) => (
                                    <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">{f}</span>
                                ))}
                                {studio.facilities.length > 3 && (
                                    <span className="text-xs text-gray-400 py-1">+{studio.facilities.length - 3} more</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <style>{`
                .input-field {
                    @apply w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none;
                }
            `}</style>
        </div>
    );
};

export default StudioList;
