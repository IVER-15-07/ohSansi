import React from 'react'

const Card = ({
  title,
  subtitle,
  icon,
  color = "from-blue-50 to-blue-100 border-blue-200",
  children,
  className = "",
}) => {
  return (
    
     <div
      className={`
        bg-gradient-to-r ${color} border rounded-2xl shadow p-5 flex flex-col gap-2 hover:scale-[1.01] transition ${className}
      `}
    >
      <div className="flex items-center gap-3 mb-1">
        {icon && (
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 text-2xl">
            {icon}
          </div>
        )}
        {title && <div className="font-bold text-[#20335C] text-lg">{title}</div>}
      </div>
      {subtitle && <div className="text-sm text-gray-600 mb-1">{subtitle}</div>}
      <div className="flex-1">{children}</div>
    </div>
  );
  
}

export default Card
