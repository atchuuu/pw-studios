import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import logo from '../assets/pw-logo.png';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <img src={logo} alt="PW Logo" className="h-8 w-auto" />
                            <span className="font-bold text-xl text-primary">Studios</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link
                                    to="/"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/') ? 'text-primary bg-primary/10' : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/bookings"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/bookings') ? 'text-primary bg-primary/10' : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                >
                                    My Bookings
                                </Link>
                                {user.role === 'super_admin' && (
                                    <Link
                                        to="/admin/studios"
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/studios') ? 'text-primary bg-primary/10' : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                    >
                                        Manage Studios
                                    </Link>
                                )}

                                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
                                >
                                    {user.profilePicture ? (
                                        <img
                                            src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_SERVER_URL}${user.profilePicture}`}
                                            alt="Profile"
                                            className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                        />
                                    ) : (
                                        <FaUserCircle className="h-6 w-6" />
                                    )}
                                    <span className="text-sm font-medium">{user.name}</span>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="Logout"
                                >
                                    <FaSignOutAlt />
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-primary/30"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                        >
                            {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                                    {user.profilePicture ? (
                                        <img
                                            src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_SERVER_URL}${user.profilePicture}`}
                                            alt="Profile"
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <FaUserCircle className="h-10 w-10 text-gray-400" />
                                    )}
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                    </div>
                                </div>

                                <Link
                                    to="/"
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'text-primary bg-primary/10' : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/bookings"
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/bookings') ? 'text-primary bg-primary/10' : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    My Bookings
                                </Link>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/profile') ? 'text-primary bg-primary/10' : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    Profile
                                </Link>
                                {user.role === 'super_admin' && (
                                    <Link
                                        to="/admin/studios"
                                        onClick={() => setIsOpen(false)}
                                        className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin/studios') ? 'text-primary bg-primary/10' : 'text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                    >
                                        Manage Studios
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-center bg-primary text-white px-4 py-3 rounded-lg font-bold shadow-lg"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
