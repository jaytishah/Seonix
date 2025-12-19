import { forwardRef } from "react";
import clsx from "clsx";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const inputClasses = clsx(
      "input",
      error && "input-error",
      leftIcon && "pl-10",
      rightIcon && "pr-10",
      className
    );

    const containerClasses = clsx(
      "relative",
      fullWidth && "w-full",
      containerClassName
    );

    return (
      <div className={containerClasses}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input ref={ref} className={inputClasses} {...props} />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
