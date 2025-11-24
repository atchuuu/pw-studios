import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [studios, setStudios] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const studioRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/studios?keyword=${search}`, config);
                setStudios(studioRes.data);

                const recRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/recommendations`, config);
                setRecommendations(recRes.data);
            } catch (error) {
                console.error(error);
            }
        };
        if (user) fetchData();
    }, [user, search]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name}</h1>
                <p className="text-gray-500 dark:text-gray-400">Find and book your next recording session.</p>
            </div>

            {/* Recommendations Widget */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-yellow-500">★</span> Recommended for You
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendations.map((studio) => (
                        <div key={studio._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                            <img src={studio.images[0]} alt={studio.name} className="h-32 w-full object-cover" />
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{studio.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{studio.location}</p>
                                <Link to={`/studios/${studio._id}`} className="mt-3 block text-center bg-primary text-white py-2 rounded-md text-sm hover:bg-indigo-700">
                                    Book Now
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Search & List */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Studios</h2>
                <input
                    type="text"
                    placeholder="Search studios..."
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studios.map((studio) => (
                    <div key={studio._id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-transparent dark:border-gray-700">
                        <img src={studio.images[0]} alt={studio.name} className="h-48 w-full object-cover rounded-t-lg" />
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{studio.name}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{studio.address}</p>
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Available</span>
                            </div>

                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Facilities:</h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {studio.facilities.map((fac, idx) => (
                                        <span key={idx} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                            {fac}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    to={`/studios/${studio._id}`}
                                    className="w-full block text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
                                >
                                    View Details & Book
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
