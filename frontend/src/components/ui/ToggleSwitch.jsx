import React from "react"
import { cn } from "../../utils/cn"

const ToggleSwitch = React.forwardRef(
  ({ checked, onChange, disabled = false, size = "md", variant = "primary", label, description, className, ...props }, ref) => {
    
    const sizes = {
      sm: "w-8 h-5",
      md: "w-11 h-6", 
      lg: "w-14 h-7"
    }

    const thumbSizes = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6"
    }

    const translates = {
      sm: "translate-x-3",
      md: "translate-x-5", 
      lg: "translate-x-7"
    }

    const variants = {
      primary: {
        bg: checked ? "bg-primary-600" : "bg-secondary-200",
        thumb: "bg-white",
        focus: "focus:ring-primary-500"
      },
      success: {
        bg: checked ? "bg-success-600" : "bg-secondary-200", 
        thumb: "bg-white",
        focus: "focus:ring-success-500"
      },
      danger: {
        bg: checked ? "bg-danger-600" : "bg-secondary-200",
        thumb: "bg-white", 
        focus: "focus:ring-danger-500"
      }
    }

    return (
      <div className={cn("flex items-center", className)}>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            ref={ref}
            {...props}
          />
          <div className={cn(
            "relative rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
            sizes[size],
            variants[variant].bg,
            variants[variant].focus,
            disabled && "opacity-50 cursor-not-allowed",
            "peer-focus:ring-2 peer-focus:ring-offset-2"
          )}>
            <span className={cn(
              "inline-block rounded-full shadow transform transition-transform duration-200 ease-in-out",
              thumbSizes[size],
              variants[variant].thumb,
              checked ? translates[size] : "translate-x-0"
            )} />
          </div>
        </label>
        
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <span className={cn(
                "text-sm font-medium",
                disabled ? "text-secondary-400" : "text-secondary-900"
              )}>
                {label}
              </span>
            )}
            {description && (
              <p className={cn(
                "text-xs",
                disabled ? "text-secondary-300" : "text-secondary-500"
              )}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

ToggleSwitch.displayName = "ToggleSwitch"

export default ToggleSwitch
