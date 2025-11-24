import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none"
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? (
                <FaMoon className="h-5 w-5 text-gray-600" />
            ) : (
                <FaSun className="h-5 w-5 text-yellow-400" />
            )}
        </button>
    );
};

export default ThemeToggle;
