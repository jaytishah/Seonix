import { motion } from "framer-motion";
import Button from "./Button";

const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      {icon && (
        <div className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-600">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          {description}
        </p>
      )}

      {action || (actionLabel && onAction)
        ? action || <Button onClick={onAction}>{actionLabel}</Button>
        : null}
    </motion.div>
  );
};

export default EmptyState;
