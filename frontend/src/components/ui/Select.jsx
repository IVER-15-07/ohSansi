import React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../utils/cn"

const Select = React.forwardRef(
  ({ className, children, options, error, label, helperText, required, placeholder, ...props }, ref) => {
    const id = props.id || props.name

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-secondary-700">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200 appearance-none bg-white",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              error ? "border-danger-300 bg-danger-50 focus:ring-danger-500" : "border-secondary-300 hover:border-secondary-400",
              "disabled:bg-secondary-100 disabled:text-secondary-500 disabled:cursor-not-allowed",
              className,
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options 
              ? options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              : children
            }
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
        {(error || helperText) && (
          <p className={cn("text-xs", error ? "text-red-600" : "text-slate-500")}>{error || helperText}</p>
        )}
      </div>
    )
  },
)

Select.displayName = "Select"

export default Select
