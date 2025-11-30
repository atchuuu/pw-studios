import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/apiConfig';
import toast from 'react-hot-toast';

const StudioList = () => {
    const { user } = useAuth();
    const [studios, setStudios] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newStudio, setNewStudio] = useState({
        name: '', location: '', address: '', capacity: 0, facilities: ''
    });

    const fetchStudios = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/studios`, config);
            setStudios(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchStudios();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const studioData = {
                ...newStudio,
                facilities: newStudio.facilities.split(',').map(f => f.trim())
            };
            await axios.post(`${API_BASE_URL}/studios`, studioData, config);
            setNewStudio({ name: '', location: '', address: '', capacity: 0, facilities: '' });
            setShowForm(false);
            fetchStudios();
            toast.success('Studio created successfully');
        } catch (error) {
            toast.error('Error creating studio');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Studios</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                >
                    {showForm ? 'Cancel' : 'Add New Studio'}
                </button>
            </div>

            {showForm && (
                <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Studio Name"
                                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                value={newStudio.name}
                                onChange={(e) => setNewStudio({ ...newStudio, name: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Location (City)"
                                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                value={newStudio.location}
                                onChange={(e) => setNewStudio({ ...newStudio, location: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                value={newStudio.address}
                                onChange={(e) => setNewStudio({ ...newStudio, address: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Capacity"
                                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                value={newStudio.capacity}
                                onChange={(e) => setNewStudio({ ...newStudio, capacity: parseInt(e.target.value) })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Facilities (comma separated)"
                                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg md:col-span-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                value={newStudio.facilities}
                                onChange={(e) => setNewStudio({ ...newStudio, facilities: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold shadow-md">
                            Save Studio
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studios.map((studio) => (
                    <div key={studio._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{studio.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">{studio.location}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{studio.address}</p>
                        <div className="mb-4">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Facilities</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {studio.facilities.map((f, i) => (
                                    <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-md">{f}</span>
                                ))}
                            </div>
                        </div>
                        <button className="w-full mt-2 bg-primary/10 text-primary hover:bg-primary hover:text-white py-2 rounded-lg transition-colors font-medium">
                            Edit Details
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudioList;
