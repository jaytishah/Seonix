import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  IoMail,
  IoEye,
  IoEyeOff,
  IoSchool,
  IoShieldCheckmark,
  IoRocket,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { login } from "@store/slices/authSlice";
import Button from "@components/common/Button";
import Input from "@components/common/Input";
import toast from "react-hot-toast";
import { APP_NAME } from "@utils/constants";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(login(formData)).unwrap();
      toast.success("Login successful!");

      const dashboardPath =
        result.user.role === "student"
          ? "/student/dashboard"
          : "/teacher/dashboard";
      navigate(dashboardPath);
    } catch (error) {
      toast.error(error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: IoShieldCheckmark,
      title: "AI-Powered Proctoring",
      description: "Advanced security with real-time monitoring",
    },
    {
      icon: IoRocket,
      title: "Instant Results",
      description: "Get your scores immediately after submission",
    },
    {
      icon: IoCheckmarkCircle,
      title: "Easy to Use",
      description: "Simple and intuitive interface for everyone",
    },
  ];

  return (
    <div className="min-h-screen flex bg-white dark:bg-dark-bg">
      {/* Left Side - 40% - Features & Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 p-8 xl:p-12 flex-col justify-between relative overflow-hidden"
      >
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />

        {/* Logo & Branding */}
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg mb-4"
          >
            <IoSchool className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl xl:text-4xl font-bold text-white mb-2">
            {APP_NAME}
          </h1>
          <p className="text-lg text-primary-100">Secure. Smart. Simple.</p>
        </div>

        {/* Features List */}
        <div className="relative z-10 space-y-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3 xl:p-4 rounded-xl"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-primary-100">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="relative z-10 flex gap-8"
        >
          <div>
            <p className="text-2xl xl:text-3xl font-bold text-white">10,000+</p>
            <p className="text-sm text-primary-100">Active Users</p>
          </div>
          <div>
            <p className="text-2xl xl:text-3xl font-bold text-white">50,000+</p>
            <p className="text-sm text-primary-100">Exams Conducted</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Side - 60% - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8 xl:p-12">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl shadow-lg mb-3"
            >
              <IoSchool className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold gradient-text">{APP_NAME}</h1>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              rightIcon={<IoMail className="w-5 h-5" />}
              autoComplete="email"
            />

            {/* Password */}
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <IoEyeOff className="w-5 h-5" />
                  ) : (
                    <IoEye className="w-5 h-5" />
                  )}
                </button>
              }
              autoComplete="current-password"
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}
              className="h-12"
            >
              Sign In
            </Button>

            {/* Register Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
