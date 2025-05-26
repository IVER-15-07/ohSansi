import React from 'react'

const Input = ({ label, error, ...props }) => {
  return (
      <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-blue-500 mb-1">{label}</label>
      )}
      <input
        className={`
          w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 text-base
          ${error
            ? 'border-red-400 focus:ring-red-200 placeholder-red-500 text-red-600'
            : 'border-blue-300 focus:ring-blue-200 placeholder-gray-400 text-gray-800'}
        `}
        {...props}
      />
    </div>
  )
}

export default Input
