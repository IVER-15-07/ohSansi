import { Loader2 } from "lucide-react"
import { cn } from "../../utils/cn"

const LoadingSpinner = ({ size = "md", className, text = "Cargando..." }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className={cn("animate-spin text-blue-600", sizes[size], className)} />
      {text && <p className="text-sm text-slate-600 font-medium">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
