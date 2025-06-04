import React from "react"
import { cn } from "../../utils/cn"

const Skeleton = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "animate-pulse rounded-md bg-secondary-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Skeleton.displayName = "Skeleton"

// Componentes de skeleton predefinidos
const SkeletonText = ({ lines = 3, className, ...props }) => (
  <div className={cn("space-y-2", className)} {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={cn(
          "h-4",
          i === lines - 1 ? "w-3/4" : "w-full"
        )} 
      />
    ))}
  </div>
)

const SkeletonCard = ({ className, ...props }) => (
  <div className={cn("p-6 space-y-4", className)} {...props}>
    <Skeleton className="h-6 w-1/3" />
    <SkeletonText lines={2} />
    <div className="flex space-x-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
)

const SkeletonTable = ({ rows = 5, columns = 4, className, ...props }) => (
  <div className={cn("space-y-3", className)} {...props}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} className="h-6" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={`row-${i}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={`cell-${i}-${j}`} className="h-4" />
        ))}
      </div>
    ))}
  </div>
)

export default Skeleton
export { SkeletonText, SkeletonCard, SkeletonTable }
