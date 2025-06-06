import React from "react"
import { cn } from "../../utils/cn"

const Card = React.forwardRef(({ className, children, title, subtitle, color, ...props }, ref) => {
  // Si se pasan title y subtitle, renderizar como tarjeta personalizada
  if (title || subtitle) {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-gradient-to-r p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
          color || "from-blue-50 to-blue-100 border-blue-200",
          className,
        )}
        {...props}
      >
        {title && (
          <h4 className="font-semibold text-blue-800 text-sm">{title}</h4>
        )}
        {subtitle && (
          <p className="text-blue-700 text-xs mt-1">{subtitle}</p>
        )}
        {children}
      </div>
    )
  }

  // Comportamiento original
  return (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})

const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pb-4", className)} {...props}>
    {children}
  </div>
))

const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-xl font-semibold text-slate-900 leading-tight", className)} {...props}>
    {children}
  </h3>
))

const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-slate-600 mt-1", className)} {...props}>
    {children}
  </p>
))

const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
))

const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 flex items-center justify-between", className)} {...props}>
    {children}
  </div>
))

Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardTitle.displayName = "CardTitle"
CardDescription.displayName = "CardDescription"
CardContent.displayName = "CardContent"
CardFooter.displayName = "CardFooter"

export default Card
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
