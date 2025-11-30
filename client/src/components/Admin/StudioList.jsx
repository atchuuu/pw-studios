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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Studios</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    {showForm ? 'Cancel' : 'Add New Studio'}
                </button>
            </div>

            {showForm && (
                <div className="mb-8 bg-white p-6 rounded-lg shadow">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Studio Name"
                                className="border p-2 rounded"
                                value={newStudio.name}
                                onChange={(e) => setNewStudio({ ...newStudio, name: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Location (City)"
                                className="border p-2 rounded"
                                value={newStudio.location}
                                onChange={(e) => setNewStudio({ ...newStudio, location: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                className="border p-2 rounded"
                                value={newStudio.address}
                                onChange={(e) => setNewStudio({ ...newStudio, address: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Capacity"
                                className="border p-2 rounded"
                                value={newStudio.capacity}
                                onChange={(e) => setNewStudio({ ...newStudio, capacity: parseInt(e.target.value) })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Facilities (comma separated)"
                                className="border p-2 rounded md:col-span-2"
                                value={newStudio.facilities}
                                onChange={(e) => setNewStudio({ ...newStudio, facilities: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                            Save Studio
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studios.map((studio) => (
                    <div key={studio._id} className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-xl font-bold">{studio.name}</h3>
                        <p className="text-gray-500">{studio.location}</p>
                        <p className="text-sm mt-2">{studio.address}</p>
                        <div className="mt-4">
                            <span className="text-sm font-medium">Facilities:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {studio.facilities.map((f, i) => (
                                    <span key={i} className="bg-gray-100 text-xs px-2 py-1 rounded">{f}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudioList;
