import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoMenu,
  IoClose,
  IoPersonCircle,
  IoLogOut,
  IoSettings,
  IoSchool,
} from "react-icons/io5";
import { useAuth } from "@hooks/useAuth";
import ThemeToggle from "@components/common/ThemeToggle";
import { getInitials } from "@utils/helpers";
import { APP_NAME } from "@utils/constants";

const Navbar = () => {
  const { user, logout, isStudent, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const dashboardLink = isStudent ? "/student/dashboard" : "/teacher/dashboard";

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={dashboardLink} className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <IoSchool className="w-6 h-6 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-text">{APP_NAME}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isStudent ? "Student Portal" : "Teacher Portal"}
              </p>
            </div>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white font-semibold">
                  {getInitials(user?.name)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </p>
                </div>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowProfileMenu(false)}
                    />

                    {/* Menu */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-200 dark:border-dark-border overflow-hidden z-20"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-border">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/student/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <IoPersonCircle className="w-5 h-5" />
                          Profile
                        </Link>

                        <Link
                          to="/student/settings"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <IoSettings className="w-5 h-5" />
                          Settings
                        </Link>

                        <hr className="my-2 border-gray-200 dark:border-dark-border" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <IoLogOut className="w-5 h-5" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
