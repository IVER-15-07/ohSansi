import React from 'react'

const TogleSwitch = ({ checked, onChange, color = "blue" }) => {
 
  return (
     <label className="relative inline-flex items-center cursor-pointer w-12 h-7">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div
        className={`w-12 h-7 rounded-full transition-colors duration-300
          ${checked
            ? color === "blue"
              ? "bg-[#2640BE] border-[#2640BE]"
              : "bg-red-100 border-red-300"
            : "bg-white border-2 border-red-200"}
        `}
      ></div>
      <div
        className={`absolute left-0 top-0 w-7 h-7 rounded-full bg-white border transition-transform duration-300
          ${checked
            ? color === "blue"
              ? "translate-x-5 border-[#2640BE] bg-[#2640BE]"
              : "translate-x-5 border-red-300 bg-red-100"
            : color === "blue"
            ? "border-[#2640BE]"
            : "border-red-300"}
        `}
      ></div>
    </label>
  )
}

export default TogleSwitch
