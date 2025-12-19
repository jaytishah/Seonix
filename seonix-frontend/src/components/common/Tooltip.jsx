import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Tooltip = ({ children, content, position = "top", delay = 200 }) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeout;

  const showTooltip = () => {
    timeout = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeout);
    setIsVisible(false);
  };

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}

      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute ${positions[position]} z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg whitespace-nowrap pointer-events-none`}
          >
            {content}
            <div
              className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-800 transform rotate-45 ${
                position === "top"
                  ? "bottom-[-4px] left-1/2 -translate-x-1/2"
                  : position === "bottom"
                  ? "top-[-4px] left-1/2 -translate-x-1/2"
                  : position === "left"
                  ? "right-[-4px] top-1/2 -translate-y-1/2"
                  : "left-[-4px] top-1/2 -translate-y-1/2"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
