import { motion } from "framer-motion";
import clsx from "clsx";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = "",
  onClick,
  type = "button",
  ...props
}) => {
  const baseClasses = "btn";

  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    danger: "btn-danger",
    success: "btn-success",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  return (
    <motion.button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {leftIcon && <span>{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span>{rightIcon}</span>}
        </div>
      )}
    </motion.button>
  );
};

export default Button;
