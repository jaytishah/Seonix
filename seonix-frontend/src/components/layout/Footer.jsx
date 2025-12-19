import { APP_NAME, APP_VERSION } from "@utils/constants";
import { IoHeart } from "react-icons/io5";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Section */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} <span className="font-semibold">{APP_NAME}</span>.
              All rights reserved.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Version {APP_VERSION}
            </p>
          </div>

          {/* Center Section */}
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <span>Made with</span>
            <IoHeart className="w-4 h-4 text-red-500 animate-pulse" />
            <span>for secure online examinations</span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6 text-sm">
            <a
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
