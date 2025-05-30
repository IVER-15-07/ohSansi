import React from "react"
import { cn } from "../../utils/cn"

const Badge = React.forwardRef(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-primary-100 text-primary-800 border-primary-200",
      secondary: "bg-secondary-100 text-secondary-800 border-secondary-200",
      success: "bg-success-100 text-success-800 border-success-200",
      warning: "bg-warning-100 text-warning-800 border-warning-200",
      danger: "bg-danger-100 text-danger-800 border-danger-200",
      accent: "bg-accent-100 text-accent-800 border-accent-200",
      outline: "bg-transparent border-secondary-300 text-secondary-700"
    }

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
      lg: "px-3 py-1.5 text-base"
    }

    return (
      <span
        className={cn(
          "inline-flex items-center font-medium border rounded-full",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = "Badge"

export default Badge
