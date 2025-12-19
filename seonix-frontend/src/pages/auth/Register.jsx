import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  IoMail,
  IoEye,
  IoEyeOff,
  IoSchool,
  IoPersonCircle,
  IoShieldCheckmark,
  IoRocket,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { register } from "@store/slices/authSlice";
import Button from "@components/common/Button";
import Input from "@components/common/Input";
import toast from "react-hot-toast";
import { APP_NAME } from "@utils/constants";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
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

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const { confirmPassword, ...registerData } = formData;
      const result = await dispatch(register(registerData)).unwrap();
      toast.success("Registration successful!");

      const dashboardPath =
        result.user.role === "student"
          ? "/student/dashboard"
          : "/teacher/dashboard";
      navigate(dashboardPath);
    } catch (error) {
      toast.error(error || "Registration failed. Please try again.");
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

      {/* Right Side - 60% - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8 xl:p-12">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl"
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
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Start your journey with us today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name & Email in 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                name="name"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                rightIcon={<IoPersonCircle className="w-5 h-5" />}
                autoComplete="name"
              />

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
            </div>

            {/* Role Selection - Compact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "student" })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === "student"
                      ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-lg"
                      : "border-gray-300 dark:border-gray-700 hover:border-primary-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        formData.role === "student"
                          ? "bg-primary-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <IoPersonCircle className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        Student
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Take exams
                      </p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "teacher" })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === "teacher"
                      ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-lg"
                      : "border-gray-300 dark:border-gray-700 hover:border-primary-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        formData.role === "teacher"
                          ? "bg-primary-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <IoSchool className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        Teacher
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Create exams
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Password & Confirm Password in 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                label="Password"
                placeholder="Create password"
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
                autoComplete="new-password"
              />

              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <IoEyeOff className="w-5 h-5" />
                    ) : (
                      <IoEye className="w-5 h-5" />
                    )}
                  </button>
                }
                autoComplete="new-password"
              />
            </div>

            {/* Terms & Conditions - Compact */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Privacy Policy
                </Link>
              </p>
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
              Create Account
            </Button>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
