import React from "react"
import { ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react"
import { cn } from "../../utils/cn"

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-secondary-50", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-secondary-200", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("bg-secondary-50 font-medium", className)}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-secondary-50 data-[state=selected]:bg-secondary-100",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ className, sortable, sortDirection, onSort, ...props }, ref) => {
  const handleSort = () => {
    if (sortable && onSort) {
      onSort()
    }
  }

  return (
    <th
      ref={ref}
      className={cn(
        "px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider",
        sortable && "cursor-pointer hover:text-secondary-700 select-none",
        className
      )}
      onClick={handleSort}
      {...props}
    >
      <div className="flex items-center space-x-1">
        <span>{props.children}</span>
        {sortable && (
          <div className="flex flex-col">
            <ChevronUp 
              className={cn(
                "h-3 w-3",
                sortDirection === "asc" ? "text-primary-600" : "text-secondary-400"
              )} 
            />
            <ChevronDown 
              className={cn(
                "h-3 w-3 -mt-1",
                sortDirection === "desc" ? "text-primary-600" : "text-secondary-400"
              )} 
            />
          </div>
        )}
      </div>
    </th>
  )
})
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-6 py-4 whitespace-nowrap text-sm text-secondary-900",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-secondary-500", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// Componente de acción para celdas
const TableActions = ({ children, className, ...props }) => (
  <div className={cn("flex items-center space-x-2", className)} {...props}>
    {children}
  </div>
)

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableActions,
}
