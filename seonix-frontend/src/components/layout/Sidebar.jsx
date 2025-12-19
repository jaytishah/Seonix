import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IoHome,
  IoDocumentText,
  IoTrophy,
  IoCreate,
  IoList,
} from 'react-icons/io5';
import { useAuth } from '@hooks/useAuth';
import clsx from 'clsx';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { isStudent, isTeacher } = useAuth();

  const studentMenuItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: IoHome },
    { path: '/student/exams', label: 'Available Exams', icon: IoDocumentText },
    { path: '/student/results', label: 'My Results', icon: IoTrophy },
  ];

  const teacherMenuItems = [
    { path: '/teacher/dashboard', label: 'Dashboard', icon: IoHome },
    { path: '/teacher/exams', label: 'My Exams', icon: IoList },
    { path: '/teacher/create-exam', label: 'Create Exam', icon: IoCreate },
  ];

  const menuItems = isStudent ? studentMenuItems : teacherMenuItems;

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: isOpen ? 0 : -300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border overflow-y-auto z-30"
    >
      <div className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
