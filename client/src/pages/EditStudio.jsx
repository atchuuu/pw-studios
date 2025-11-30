import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/apiConfig';
import { FaSave, FaArrowLeft, FaCloudUploadAlt, FaSpinner, FaImage } from 'react-icons/fa';
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
        coverPhoto: ''
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
                    coverPhoto: data.coverPhoto || ''
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

    const handleImageUpload = async (e, type) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (!formData.studioCode) {
            toast.error("Please enter a Studio Code first");
            return;
        }

        setUploading(true);
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const uploadedUrls = [];

            // Determine category for backend storage
            let category = 'temp';
            if (type === 'interiorPhotos') category = 'interior';
            else if (type === 'exteriorPhotos') category = 'exterior';
            else if (type === 'coverPhoto') category = 'cover';

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

            if (type === 'coverPhoto') {
                // For cover photo, we only keep the last uploaded one if multiple selected (though input should be single)
                setFormData(prev => ({ ...prev, coverPhoto: uploadedUrls[uploadedUrls.length - 1] }));
            } else {
                setFormData(prev => {
                    const currentUrls = prev[type] ? prev[type].split(',').map(u => u.trim()).filter(u => u) : [];
                    const newUrls = [...currentUrls, ...uploadedUrls].join(', ');
                    return { ...prev, [type]: newUrls };
                });
            }
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                >
                    <FaArrowLeft className="mr-2" /> Back
                </button>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Edit Studio</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Cover Photo Section */}
                        <div className="mb-8 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">Cover Photo</label>
                                <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                    {uploading ? <FaSpinner className="animate-spin" /> : <FaImage />}
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
                                <div className="relative aspect-video rounded-lg overflow-hidden shadow-md">
                                    <img
                                        src={formData.coverPhoto.startsWith('http') ? formData.coverPhoto : `${import.meta.env.VITE_SERVER_URL}${formData.coverPhoto}`}
                                        alt="Cover"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                    <span className="flex items-center gap-2"><FaImage /> No Cover Photo</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Studio Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Studio Code (e.g., NOI)</label>
                                <input
                                    type="text"
                                    name="studioCode"
                                    value={formData.studioCode || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    maxLength="3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Studios</label>
                                <input
                                    type="number"
                                    name="numStudios"
                                    value={formData.numStudios || 1}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area</label>
                                <input
                                    type="text"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">POC Name</label>
                                <input
                                    type="text"
                                    name="pocName"
                                    value={formData.pocName}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">POC Contact</label>
                                <input
                                    type="text"
                                    name="pocContact"
                                    value={formData.pocContact}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">POC Email</label>
                                <input
                                    type="email"
                                    name="pocEmail"
                                    value={formData.pocEmail || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Map Link</label>
                                <input
                                    type="text"
                                    name="googleMapLink"
                                    value={formData.googleMapLink}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="lat"
                                    value={formData.lat}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="lng"
                                    value={formData.lng}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facilities (comma separated)</label>
                                <input
                                    type="text"
                                    name="facilities"
                                    value={formData.facilities}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>

                            {/* Exterior Photos */}
                            <div className="md:col-span-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exterior Photos (URLs)</label>
                                    <label className="cursor-pointer text-primary hover:text-indigo-700 flex items-center gap-1 text-sm font-bold">
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
                                <textarea
                                    name="exteriorPhotos"
                                    value={formData.exteriorPhotos || ''}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                />
                            </div>

                            {/* Interior Photos */}
                            <div className="md:col-span-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interior Photos (URLs)</label>
                                    <label className="cursor-pointer text-primary hover:text-indigo-700 flex items-center gap-1 text-sm font-bold">
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
                                <textarea
                                    name="interiorPhotos"
                                    value={formData.interiorPhotos || ''}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-70"
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
