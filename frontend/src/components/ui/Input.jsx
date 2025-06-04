import React from "react"
import { cn } from "../../utils/cn"

const Input = React.forwardRef(({ className, type = "text", error, label, helperText, required, ...props }, ref) => {
  const id = props.id || props.name

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={cn(
          "w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200",
          "placeholder:text-secondary-400",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
          error ? "border-danger-300 bg-danger-50 focus:ring-danger-500" : "border-secondary-300 bg-white hover:border-secondary-400",
          "disabled:bg-secondary-100 disabled:text-secondary-500 disabled:cursor-not-allowed",
          className,
        )}
        ref={ref}
        {...props}
      />
      {(error || helperText) && (
        <p className={cn("text-xs", error ? "text-danger-600" : "text-secondary-500")}>{error || helperText}</p>
      )}
    </div>
  )
})

Input.displayName = "Input"

export default Input
