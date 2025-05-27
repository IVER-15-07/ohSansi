import React from 'react'

const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Seleccione una opción",
  error,
  disabled,
  name,
  ...props
}) => {
  return (
     <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    )}
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full appearance-none px-3 py-2 pr-10 rounded-lg border bg-gray-50 text-gray-800 text-base shadow-sm transition
          focus:outline-none focus:ring-2
          ${error
            ? 'border-red-400 focus:ring-red-200'
            : 'border-blue-300 focus:ring-blue-200'}
          ${disabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}
        `}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
            {opt.label ?? opt.nombre}
          </option>
        ))}
      </select>
      {/* Flecha personalizada */}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
  )
}

export default Select
