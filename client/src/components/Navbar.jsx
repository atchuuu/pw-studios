import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import pwLogo from '../assets/pw-logo.png';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <img className="h-10 w-auto" src={pwLogo} alt="PW Studios" />
                            <span className="ml-3 font-bold text-xl text-gray-900 dark:text-white">PW Studios</span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link to="/" className="text-gray-900 dark:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary dark:hover:text-white text-sm font-medium">
                                Dashboard
                            </Link>
                            <Link to="/bookings" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                                My Bookings
                            </Link>
                            {user && (user.role === 'super_admin' || user.role === 'studio_admin') && (
                                <Link to="/admin" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        {user ? (
                            <div className="flex items-center">
                                <span className="text-gray-700 dark:text-gray-200 mr-4">Hello, {user.name}</span>
                                <button
                                    onClick={logout}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="text-primary font-medium">Login</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
