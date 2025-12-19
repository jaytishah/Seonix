import { motion } from "framer-motion";
import clsx from "clsx";

const Card = ({
  children,
  className = "",
  hoverable = false,
  padding = "md",
  noBorder = false,
  ...props
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const classes = clsx(
    "card",
    hoverable && "card-hover cursor-pointer",
    !noBorder && "border",
    paddingClasses[padding],
    className
  );

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
