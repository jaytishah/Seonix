import { motion } from "framer-motion";
import {
  IoCheckmarkCircle,
  IoWarning,
  IoInformationCircle,
  IoClose,
} from "react-icons/io5";
import clsx from "clsx";

const Alert = ({ type = "info", title, message, onClose, className = "" }) => {
  const icons = {
    success: <IoCheckmarkCircle className="w-5 h-5" />,
    error: <IoClose className="w-5 h-5" />,
    warning: <IoWarning className="w-5 h-5" />,
    info: <IoInformationCircle className="w-5 h-5" />,
  };

  const variantClasses = {
    success:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    error:
      "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    warning:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
  };

  const classes = clsx(
    "flex items-start gap-3 p-4 rounded-lg border",
    variantClasses[type],
    className
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={classes}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>

      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        {message && <p className="text-sm">{message}</p>}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
        >
          <IoClose className="w-5 h-5" />
        </button>
      )}
    </motion.div>
  );
};

export default Alert;
    