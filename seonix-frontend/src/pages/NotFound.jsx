import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IoHome, IoArrowBack } from "react-icons/io5";
import Button from "@components/common/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <motion.h1
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-9xl font-bold gradient-text mb-4"
        >
          404
        </motion.h1>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link to="/">
            <Button variant="primary" leftIcon={<IoHome />}>
              Go Home
            </Button>
          </Link>
          <Button
            variant="outline"
            leftIcon={<IoArrowBack />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
