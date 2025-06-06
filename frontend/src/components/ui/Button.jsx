import React from "react"
import { cn } from "../../utils/cn"

const Button = React.forwardRef(
  ({ className, variant = "primary", size = "md", children, disabled, loading, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"

    const variants = {
      primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-soft hover:shadow-medium",
      secondary: "bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 shadow-soft hover:shadow-medium",
      accent: "bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500 shadow-soft hover:shadow-medium",
      success: "bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-soft hover:shadow-medium",
      warning: "bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 shadow-soft hover:shadow-medium",
      danger: "bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 shadow-soft hover:shadow-medium",
      outline: "border-2 border-primary-300 text-primary-700 hover:bg-primary-50 focus:ring-primary-500",
      ghost: "text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg",
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], loading && "cursor-wait", className)}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"

export default Button
