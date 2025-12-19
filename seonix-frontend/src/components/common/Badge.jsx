import clsx from "clsx";

const Badge = ({
  children,
  variant = "primary",
  size = "md",
  rounded = true,
  className = "",
}) => {
  const baseClasses = "badge";

  const variantClasses = {
    primary: "badge-primary",
    success: "badge-success",
    danger: "badge-danger",
    warning: "badge-warning",
    info: "badge-info",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    rounded ? "rounded-full" : "rounded",
    className
  );

  return <span className={classes}>{children}</span>;
};

export default Badge;
