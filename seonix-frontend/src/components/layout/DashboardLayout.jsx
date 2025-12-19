import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Content Area */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
};

export default DashboardLayout;
