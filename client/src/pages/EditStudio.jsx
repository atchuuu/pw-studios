import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/apiConfig';
import { FaSave, FaArrowLeft, FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const EditStudio = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        area: '',
        numStudios: 1,
        studioCode: '',
        pocName: '',
        pocContact: '',
        pocEmail: '',
        googleMapLink: '',
        lat: '',
        lng: '',
        facilities: '',
        interiorPhotos: '',
        exteriorPhotos: '',
        coverPhoto: '/assets/profile-banner.png'
    });

    useEffect(() => {
        const fetchStudio = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${API_BASE_URL}/studios/${id}`, config);
                setFormData({
                    name: data.name || '',
                    address: data.address || '',
                    city: data.city || '',
                    area: data.area || '',
                    numStudios: data.numStudios || 1,
                    studioCode: data.studioCode || '',
                    pocName: data.pocName || '',
                    pocContact: data.pocContact || '',
                    pocEmail: data.pocEmail || '',
                    googleMapLink: data.googleMapLink || '',
                    lat: data.lat || '',
                    lng: data.lng || '',
                    facilities: data.facilities ? data.facilities.join(', ') : '',
                    interiorPhotos: data.interiorPhotos ? data.interiorPhotos.join(', ') : '',
                    exteriorPhotos: data.exteriorPhotos ? data.exteriorPhotos.join(', ') : '',
                    coverPhoto: data.coverPhoto || '/assets/profile-banner.png'
                });
            } catch (error) {
                console.error("Failed to fetch studio", error);
                toast.error("Failed to load studio details");
            }
        };
        fetchStudio();
    }, [id, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Helper for image URLs
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('/assets')) return url;
        return `${API_BASE_URL}${url}`;
    };

    const handleImageUpload = async (e, type) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const uploadedUrls = [];

            if (!formData.studioCode) {
                toast.error("Please enter a Studio Code first");
                setUploading(false);
                return;
            }

            let category = 'exterior';
            if (type === 'interiorPhotos') category = 'interior';
            if (type === 'coverPhoto') category = 'cover';

            for (const file of files) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', file);
                const { data } = await axios.post(
                    `${API_BASE_URL}/upload?type=studio&studioCode=${formData.studioCode}&category=${category}`,
                    uploadFormData,
                    config
                );
                uploadedUrls.push(data);
            }

            setFormData(prev => {
                if (type === 'coverPhoto') {
                    // For cover photo, replace the existing one (take the last uploaded if multiple selected by mistake)
                    return { ...prev, [type]: uploadedUrls[uploadedUrls.length - 1] };
                }
                const currentUrls = prev[type] ? prev[type].split(',').map(u => u.trim()).filter(u => u) : [];
                const newUrls = [...currentUrls, ...uploadedUrls].join(', ');
                return { ...prev, [type]: newUrls };
            });
            toast.success('Images uploaded successfully');

        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Failed to upload images");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const updatedData = {
                ...formData,
                facilities: formData.facilities.split(',').map(f => f.trim()),
                interiorPhotos: formData.interiorPhotos.split(',').map(f => f.trim()).filter(f => f),
                exteriorPhotos: formData.exteriorPhotos.split(',').map(f => f.trim()).filter(f => f),
                coverPhoto: formData.coverPhoto
            };

            await axios.put(`${API_BASE_URL}/studios/${id}`, updatedData, config);
            toast.success('Studio updated successfully!');
            navigate(`/studios/${id}`);
        } catch (error) {
            console.error("Failed to update studio", error);
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors group"
                >
                    <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back
                </button>

                <div className="glass-card rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700/50">
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">Edit Studio</h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="studio-name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Studio Name</label>
                                <input
                                    id="studio-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="studio-code" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Studio Code (e.g., NOI)</label>
                                <input
                                    id="studio-code"
                                    type="text"
                                    name="studioCode"
                                    value={formData.studioCode || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                                    maxLength="3"
                                />
                            </div>
                            <div>
                                <label htmlFor="num-studios" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Number of Studios</label>
                                <input
                                    id="num-studios"
                                    type="number"
                                    name="numStudios"
                                    value={formData.numStudios || 1}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="studio-address" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Address</label>
                                <textarea
                                    id="studio-address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="studio-city" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">City</label>
                                <input
                                    id="studio-city"
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="studio-area" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Area</label>
                                <input
                                    id="studio-area"
                                    type="text"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="poc-name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">POC Name</label>
                                <input
                                    id="poc-name"
                                    type="text"
                                    name="pocName"
                                    value={formData.pocName}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="poc-contact" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">POC Contact</label>
                                <input
                                    id="poc-contact"
                                    type="text"
                                    name="pocContact"
                                    value={formData.pocContact}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="poc-email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">POC Email</label>
                                <input
                                    id="poc-email"
                                    type="email"
                                    name="pocEmail"
                                    value={formData.pocEmail || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="google-map-link" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Google Map Link</label>
                                <input
                                    id="google-map-link"
                                    type="text"
                                    name="googleMapLink"
                                    value={formData.googleMapLink}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="studio-lat" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Latitude</label>
                                <input
                                    id="studio-lat"
                                    type="number"
                                    step="any"
                                    name="lat"
                                    value={formData.lat}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="studio-lng" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Longitude</label>
                                <input
                                    id="studio-lng"
                                    type="number"
                                    step="any"
                                    name="lng"
                                    value={formData.lng}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="studio-facilities" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Facilities (comma separated)</label>
                                <input
                                    id="studio-facilities"
                                    type="text"
                                    name="facilities"
                                    value={formData.facilities}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
                                />
                            </div>

                            {/* Cover Photo */}
                            <div className="md:col-span-2">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Cover Photo</label>
                                    <label className="cursor-pointer text-brand-600 hover:text-brand-500 flex items-center gap-2 text-sm font-bold bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-xl transition-all hover:scale-105 shadow-sm">
                                        {uploading ? <FaSpinner className="animate-spin" /> : <FaCloudUploadAlt />}
                                        Upload Cover
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e, 'coverPhoto')}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                                {formData.coverPhoto ? (
                                    <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 group">
                                        <img src={getImageUrl(formData.coverPhoto)} alt="Cover Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
                                    </div>
                                ) : (
                                    <div className="w-full h-64 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                        No cover photo uploaded
                                    </div>
                                )}
                            </div>

                            {/* Exterior Photos */}
                            <div className="md:col-span-2">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Exterior Photos</label>
                                    <label className="cursor-pointer text-brand-600 hover:text-brand-500 flex items-center gap-2 text-sm font-bold bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-xl transition-all hover:scale-105 shadow-sm">
                                        {uploading ? <FaSpinner className="animate-spin" /> : <FaCloudUploadAlt />}
                                        Upload Photos
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e, 'exteriorPhotos')}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                                {formData.exteriorPhotos ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {formData.exteriorPhotos.split(',').map((url, index) => (
                                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 group">
                                                <img src={getImageUrl(url.trim())} alt={`Exterior ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                        No exterior photos uploaded
                                    </div>
                                )}
                            </div>

                            {/* Interior Photos */}
                            <div className="md:col-span-2">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Interior Photos</label>
                                    <label className="cursor-pointer text-brand-600 hover:text-brand-500 flex items-center gap-2 text-sm font-bold bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-xl transition-all hover:scale-105 shadow-sm">
                                        {uploading ? <FaSpinner className="animate-spin" /> : <FaCloudUploadAlt />}
                                        Upload Photos
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e, 'interiorPhotos')}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                                {formData.interiorPhotos ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {formData.interiorPhotos.split(',').map((url, index) => (
                                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 group">
                                                <img src={getImageUrl(url.trim())} alt={`Interior ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                        No interior photos uploaded
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-8 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-600/30 disabled:opacity-70 hover:scale-105"
                            >
                                <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditStudio;
