import React from 'react';
import { Input } from '../ui';

const FormField = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  required, 
  disabled, 
  error,
  placeholder,
  className = "",
  labelClassName = "",
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className={`text-sm font-medium text-gray-700 ${labelClassName}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Input
        type={type}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full ${disabled ? "bg-gray-100" : ""} ${error ? "border-red-500" : ""} ${className}`}
        placeholder={placeholder}
        {...props}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};

export default FormField;
