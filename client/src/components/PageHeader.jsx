import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaBars } from 'react-icons/fa';

const PageHeader = ({ onOpenSidebar, title }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine title based on path if not provided
    const getTitle = () => {
        if (title) return title;
        const path = location.pathname;
        if (path.includes('/studios/')) return 'Studio Details';
        if (path.includes('/bookings')) return 'My Bookings';
        if (path.includes('/admin')) return 'Admin Dashboard';
        if (path.includes('/profile')) return 'Profile';
        return '';
    };

    // Check if we are on strictly the Studio Details page (not edit)
    const isStudioDetails = location.pathname.startsWith('/studios/') && !location.pathname.endsWith('/edit');

    return (
        <div className={`
            ${isStudioDetails
                ? 'absolute top-0 w-full z-40 bg-transparent border-none'
                : 'sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800'
            } 
            transition-colors duration-300
        `}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-2 -ml-2 rounded-full transition-colors ${isStudioDetails
                                ? 'bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                            }`}
                        aria-label="Go back"
                    >
                        <FaArrowLeft size={20} />
                    </button>

                    {!isStudioDetails && (
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                            {getTitle()}
                        </h1>
                    )}
                </div>

                <button
                    onClick={onOpenSidebar}
                    className={`p-2 -mr-2 rounded-xl transition-colors ${isStudioDetails
                            ? 'bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}
                    aria-label="Open menu"
                >
                    <FaBars size={22} />
                </button>
            </div>
        </div>
    );
};

export default PageHeader;
