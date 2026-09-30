import { LuSun, LuMoon } from "react-icons/lu";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                isDarkMode
                    ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700/80 hover:text-amber-300 shadow-xs"
                    : "bg-gray-100/80 border-gray-200 text-slate-700 hover:bg-gray-200/80 hover:text-sky-600 shadow-xs"
            } ${className}`}
            title={isDarkMode ? "Ganti ke Mode Terang (Light Mode)" : "Ganti ke Mode Gelap (Dark Mode)"}
            aria-label="Toggle Dark/Light Mode"
        >
            {isDarkMode ? (
                <LuSun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
                <LuMoon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
            )}
        </button>
    );
};

export default ThemeToggle;
