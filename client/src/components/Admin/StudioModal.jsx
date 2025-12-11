import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSave, FaBuilding, FaMapMarkerAlt, FaUserTie, FaImage, FaList, FaCloudUploadAlt, FaSpinner, FaChevronRight, FaGlobe, FaMapPin, FaPhone, FaEnvelope, FaCamera, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/apiConfig';
import toast from 'react-hot-toast';

const StudioModal = ({ isOpen, onClose, studio, onSave }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const tabs = [
        { id: 'basic', label: 'Studio Info', icon: <FaBuilding className="text-xl" />, desc: 'Core Details' },
        { id: 'location', label: 'Location', icon: <FaMapMarkerAlt className="text-xl" />, desc: 'Map & Address' },
        { id: 'details', label: 'Amenities', icon: <FaList className="text-xl" />, desc: 'Facilities' },
        { id: 'poc', label: 'Contact', icon: <FaUserTie className="text-xl" />, desc: 'Manager' },
        { id: 'media', label: 'Gallery', icon: <FaImage className="text-xl" />, desc: 'Photos' },
    ];

    const handleNext = () => {
        const currentIndex = tabs.findIndex(t => t.id === activeTab);
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id);
        }
    };

    // Initial State
    const initialState = {
        name: '',
        studioCode: '',
        numStudios: 1,
        address: '',
        city: '',
        area: '',
        location: '',
        coordinates: { coordinates: [] },
        lat: '',
        lng: '',
        pocName: '',
        pocEmail: '',
        pocContact: '',
        googleMapLink: '',
        facilities: '',
        coverPhoto: '/assets/profile-banner.png',
        interiorPhotos: '',
        exteriorPhotos: ''
    };

    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        if (isOpen) {
            if (studio) {
                setFormData({
                    ...initialState,
                    ...studio,
                    lat: studio.lat || (studio.coordinates?.coordinates ? studio.coordinates.coordinates[1] : ''),
                    lng: studio.lng || (studio.coordinates?.coordinates ? studio.coordinates.coordinates[0] : ''),
                    facilities: Array.isArray(studio.facilities) ? studio.facilities.join(', ') : (studio.facilities || ''),
                    interiorPhotos: Array.isArray(studio.interiorPhotos) ? studio.interiorPhotos.join(', ') : (studio.interiorPhotos || ''),
                    exteriorPhotos: Array.isArray(studio.exteriorPhotos) ? studio.exteriorPhotos.join(', ') : (studio.exteriorPhotos || ''),
                    coverPhoto: studio.coverPhoto || '/assets/profile-banner.png'
                });
            } else {
                setFormData(initialState);
            }
            setActiveTab('basic');
        }
    }, [isOpen, studio]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e, type) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (!formData.studioCode) {
            toast.error("Please enter a Studio Code first");
            return;
        }

        setUploading(true);
        const toastId = toast.loading('Uploading images...');

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const uploadedUrls = [];

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
                    return { ...prev, [type]: uploadedUrls[uploadedUrls.length - 1] };
                }
                const current = prev[type] ? prev[type].split(',').map(s => s.trim()).filter(s => s) : [];
                return { ...prev, [type]: [...current, ...uploadedUrls].join(', ') };
            });
            toast.success('Upload successful', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Upload failed', { id: toastId });
        } finally {
            setUploading(false);
            // Reset file input value to allow re-uploading same file if needed
            e.target.value = '';
        }
    };

    const handleRemoveImage = (type, index) => {
        setFormData(prev => {
            if (type === 'coverPhoto') {
                return { ...prev, coverPhoto: '/assets/profile-banner.png' };
            }
            const currentList = prev[type].split(',').map(s => s.trim()).filter(s => s);
            const newList = currentList.filter((_, i) => i !== index);
            return { ...prev, [type]: newList.join(', ') };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submissionData = {
                ...formData,
                facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f),
                interiorPhotos: formData.interiorPhotos.split(',').map(p => p.trim()).filter(p => p),
                exteriorPhotos: formData.exteriorPhotos.split(',').map(p => p.trim()).filter(p => p),
                location: formData.location || formData.city
            };

            await onSave(submissionData, studio?._id);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save studio");
        } finally {
            setLoading(false);
        }
    };

    // Helper to get correct image source


    const getImageSrc = (path) => {
        if (!path) return '/assets/profile-banner.png';
        if (path.startsWith('http') || path.startsWith('/assets')) return path;
        return `${API_BASE_URL}${path}`;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                        className="relative w-full max-w-7xl bg-[#F8F9FB] dark:bg-[#0A0A0A] rounded-[30px] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[85vh] border border-white/20 dark:border-white/5"
                    >
                        <div className="flex flex-1 overflow-hidden">
                            {/* Rich Sidebar */}
                            <div className="w-80 bg-white dark:bg-[#111] border-r border-gray-100 dark:border-white/5 p-6 flex flex-col relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                                <div className="mb-10 pl-2">
                                    <h2 className="text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 tracking-tight">
                                        Studio Manager
                                    </h2>
                                    <p className="text-xs font-semibold text-gray-400 mt-2 uppercase tracking-widest">
                                        {studio ? 'Update Existing' : 'Create New'}
                                    </p>
                                </div>

                                <div className="space-y-3 flex-1 overflow-y-auto hide-scrollbar">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full text-left p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === tab.id
                                                ? 'bg-brand-600 text-white shadow-xl shadow-brand-600/30 ring-4 ring-brand-100 dark:ring-brand-900/20'
                                                : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400'
                                                }`}
                                        >
                                            <div className="relative z-10 flex items-center gap-4">
                                                <span className={`p-2 rounded-xl transition-all ${activeTab === tab.id
                                                    ? 'bg-white/20'
                                                    : 'bg-white dark:bg-black/40 group-hover:scale-110'
                                                    }`}>
                                                    {tab.icon}
                                                </span>
                                                <div>
                                                    <span className={`block font-bold text-base mb-0.5 ${activeTab === tab.id ? 'text-white' : 'text-gray-700 dark:text-gray-200'
                                                        }`}>
                                                        {tab.label}
                                                    </span>
                                                    <span className={`block text-xs font-medium ${activeTab === tab.id ? 'text-brand-100' : 'text-gray-400'
                                                        }`}>
                                                        {tab.desc}
                                                    </span>
                                                </div>
                                            </div>
                                            {activeTab === tab.id && (
                                                <motion.div
                                                    layoutId="activeGlow"
                                                    className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                                    <button
                                        onClick={onClose}
                                        className="w-full px-4 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaTimes /> Cancel
                                    </button>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 overflow-y-auto bg-[#F8F9FB] dark:bg-[#0A0A0A] relative scroll-smooth custom-scrollbar">
                                <form id="studioForm" onSubmit={handleSubmit} className="max-w-5xl mx-auto p-12">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                                            transition={{ duration: 0.4, ease: "circOut" }}
                                            className="space-y-10"
                                        >
                                            {/* Basic Info */}
                                            {activeTab === 'basic' && (
                                                <div className="space-y-8 animate-in">
                                                    <SectionHeader title="Studio Identity" subtitle="Define the core identity and capacity of the studio." />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <InputGroup label="Studio Name" icon={<FaBuilding />} value={formData.name} name="name" onChange={handleChange} placeholder="e.g. Noida HQ Studio" required />
                                                        <InputGroup label="Studio Code" icon={<FaGlobe />} value={formData.studioCode} name="studioCode" onChange={handleChange} placeholder="NOI" required uppercase mono />
                                                        <InputGroup label="Total Rooms" icon={<FaList />} type="number" value={formData.numStudios} name="numStudios" onChange={handleChange} required min="1" width="half" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Location */}
                                            {activeTab === 'location' && (
                                                <div className="space-y-8 animate-in">
                                                    <SectionHeader title="Geographic Location" subtitle="Pinpoint the studio for accurate mapping." />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="col-span-2">
                                                            <InputGroup label="Full Address" icon={<FaMapPin />} value={formData.address} name="address" onChange={handleChange} textarea placeholder="Complete street address..." required />
                                                        </div>
                                                        <InputGroup label="City" icon={<FaMapMarkerAlt />} value={formData.city} name="city" onChange={handleChange} placeholder="e.g. Noida" required />
                                                        <InputGroup label="Locality / Area" icon={<FaMapMarkerAlt />} value={formData.area} name="area" onChange={handleChange} placeholder="e.g. Sector 62" />
                                                        <InputGroup label="Latitude" icon={<FaGlobe />} value={formData.lat} name="lat" onChange={handleChange} placeholder="e.g. 28.6235" mono />
                                                        <InputGroup label="Longitude" icon={<FaGlobe />} value={formData.lng} name="lng" onChange={handleChange} placeholder="e.g. 77.3665" mono />
                                                        <div className="col-span-2">
                                                            <InputGroup label="Google Maps URL" icon={<FaMapPin />} value={formData.googleMapLink} name="googleMapLink" onChange={handleChange} placeholder="https://maps.google.com/..." />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Facilities */}
                                            {activeTab === 'details' && (
                                                <div className="space-y-8 animate-in">
                                                    <SectionHeader title="Amenities & Features" subtitle="What makes this studio special?" />
                                                    <div className="bg-white dark:bg-[#111] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                                                        <InputGroup label="Facilities List (Comma Separated)" value={formData.facilities} name="facilities" onChange={handleChange} textarea rows={5} placeholder="e.g. Wi-Fi, Soundproof, Chroma..." noBorder />
                                                        <div className="mt-6 flex flex-wrap gap-3">
                                                            {formData.facilities.split(',').filter(f => f.trim()).map((f, i) => (
                                                                <span key={i} className="px-4 py-2 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl border border-gray-200 dark:border-white/5 shadow-sm transform hover:scale-105 transition-transform cursor-default">
                                                                    {f.trim()}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* POC */}
                                            {activeTab === 'poc' && (
                                                <div className="space-y-8 animate-in">
                                                    <SectionHeader title="Point of Contact" subtitle="Designated manager for this location." />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <InputGroup label="Manager Name" icon={<FaUserTie />} value={formData.pocName} name="pocName" onChange={handleChange} placeholder="Full Name" />
                                                        <InputGroup label="Contact Number" icon={<FaPhone />} value={formData.pocContact} name="pocContact" onChange={handleChange} placeholder="+91..." />
                                                        <div className="col-span-2">
                                                            <InputGroup label="Email Address" icon={<FaEnvelope />} type="email" value={formData.pocEmail} name="pocEmail" onChange={handleChange} placeholder="name@pw.live" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Media */}
                                            {activeTab === 'media' && (
                                                <div className="space-y-8 animate-in">
                                                    <SectionHeader title="Visual Gallery" subtitle="Upload assets to showcase the studio." />

                                                    {/* Cover Photo */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Cover Photo</label>
                                                        <div className="group relative h-64 w-full rounded-3xl overflow-hidden bg-white dark:bg-[#111] border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-brand-500 dark:hover:border-brand-500 transition-colors shadow-sm">
                                                            <img
                                                                src={getImageSrc(formData.coverPhoto)}
                                                                alt="Cover"
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => { e.target.onerror = null; e.target.src = '/assets/profile-banner.png'; }}
                                                            />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                                <label htmlFor="coverPhoto-upload" className="cursor-pointer bg-white text-black px-6 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                                                                    {uploading ? <FaSpinner className="animate-spin" /> : <FaCloudUploadAlt />}
                                                                    Change Cover
                                                                    <input id="coverPhoto-upload" name="coverPhoto" type="file" onChange={(e) => handleImageUpload(e, 'coverPhoto')} className="hidden" accept="image/*" disabled={uploading} />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Interior Photos */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-4">
                                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Interior Photos</label>
                                                            <label htmlFor="interiorPhotos-upload" className="text-xs font-bold text-brand-600 cursor-pointer hover:underline flex items-center gap-1">
                                                                <FaCloudUploadAlt /> Upload
                                                                <input id="interiorPhotos-upload" name="interiorPhotos" type="file" multiple onChange={(e) => handleImageUpload(e, 'interiorPhotos')} className="hidden" accept="image/*" disabled={uploading} />
                                                            </label>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            {formData.interiorPhotos.split(',').filter(s => s.trim()).map((url, i) => (
                                                                <div key={i} className="group relative h-32 rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 shadow-sm">
                                                                    <img src={getImageSrc(url.trim())} alt={`Interior ${i}`} className="h-full w-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <button type="button" onClick={() => handleRemoveImage('interiorPhotos', i)} className="p-2 bg-white/20 text-white rounded-xl backdrop-blur-md hover:bg-red-500/80 transition-colors">
                                                                            <FaTrash size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {/* Placeholder if empty */}
                                                            {!formData.interiorPhotos && (
                                                                <div className="col-span-full py-8 text-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 text-gray-400 text-sm">
                                                                    No interior photos uploaded yet.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Exterior Photos */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-4">
                                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Exterior Photos</label>
                                                            <label htmlFor="exteriorPhotos-upload" className="text-xs font-bold text-brand-600 cursor-pointer hover:underline flex items-center gap-1">
                                                                <FaCloudUploadAlt /> Upload
                                                                <input id="exteriorPhotos-upload" name="exteriorPhotos" type="file" multiple onChange={(e) => handleImageUpload(e, 'exteriorPhotos')} className="hidden" accept="image/*" disabled={uploading} />
                                                            </label>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            {formData.exteriorPhotos.split(',').filter(s => s.trim()).map((url, i) => (
                                                                <div key={i} className="group relative h-32 rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 shadow-sm">
                                                                    <img src={getImageSrc(url.trim())} alt={`Exterior ${i}`} className="h-full w-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <button type="button" onClick={() => handleRemoveImage('exteriorPhotos', i)} className="p-2 bg-white/20 text-white rounded-xl backdrop-blur-md hover:bg-red-500/80 transition-colors">
                                                                            <FaTrash size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {/* Placeholder if empty */}
                                                            {!formData.exteriorPhotos && (
                                                                <div className="col-span-full py-8 text-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 text-gray-400 text-sm">
                                                                    No exterior photos uploaded yet.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Navigation Buttons */}
                                    <div className="mt-12 flex justify-end pt-6 border-t border-gray-100 dark:border-white/5">
                                        {activeTab !== tabs[tabs.length - 1].id ? (
                                            <button
                                                type="button"
                                                onClick={handleNext}
                                                className="flex items-center gap-2 bg-brand-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand-700 hover:scale-105 transition-all shadow-lg shadow-brand-600/20"
                                            >
                                                Next Step <FaChevronRight />
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={loading || uploading}
                                                className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3.5 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all shadow-lg"
                                            >
                                                {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                                Save Studio
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Reusable Components
const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-6">
        <h3 className="text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight mb-2">{title}</h3>
        <p className="text-base font-medium text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
);

const InputGroup = ({ label, icon, value, name, onChange, type = "text", placeholder, required, textarea, rows, mono, uppercase, noBorder, width }) => (
    <div className={`group relative ${width === 'half' ? 'col-span-1' : ''}`}>
        <label htmlFor={name} className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 ml-1 transition-colors group-focus-within:text-brand-600 dark:group-focus-within:text-brand-400">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className={`relative flex items-center bg-gray-50 dark:bg-[#111] rounded-xl overflow-hidden transition-all duration-200 ${noBorder ? '' : 'border border-gray-200 dark:border-white/10 group-focus-within:border-brand-500 dark:group-focus-within:border-brand-500 group-focus-within:ring-4 group-focus-within:ring-brand-500/10 dark:group-focus-within:ring-brand-400/10 group-focus-within:bg-white dark:group-focus-within:bg-[#000]'}`}>
            {icon && (
                <div className="pl-4 pr-3 text-gray-400 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-400 transition-colors">
                    {icon}
                </div>
            )}
            {textarea ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    rows={rows || 3}
                    className={`w-full bg-transparent border-none text-gray-900 dark:text-white text-base font-medium p-3.5 focus:ring-0 placeholder:text-gray-400 ${mono ? 'font-mono' : ''}`}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`w-full bg-transparent border-none text-gray-900 dark:text-white text-base font-medium h-12 px-2 focus:ring-0 placeholder:text-gray-400 ${mono ? 'font-mono' : ''} ${uppercase ? 'uppercase' : ''}`}
                    placeholder={placeholder}
                    required={required}
                />
            )}
        </div>
    </div>
);

export default StudioModal;
