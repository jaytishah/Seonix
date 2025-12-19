import { motion } from "framer-motion";
import { IoSunny, IoMoon } from "react-icons/io5";
import { useTheme } from "@/context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors ${className}`}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        className="absolute top-1 left-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-md flex items-center justify-center"
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <IoMoon className="w-4 h-4 text-primary-500" />
        ) : (
          <IoSunny className="w-4 h-4 text-yellow-500" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
