import React from 'react'

const Button = ({ children, color = "bg-blue-700", ...props }) => {
   return (
    <button
      className={`${color} text-white font-medium rounded-md px-6 py-2 hover:bg-blue-800 transition`}
      {...props}
    >
      {children}
    </button> 
  );
}

export default Button
