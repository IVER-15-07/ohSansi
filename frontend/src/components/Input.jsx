import React from 'react';

const Input = ({ label, type = 'text', placeholder, className = '', ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-2 text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
        {...props}
      />
    </div>
  );
};

export default Input;
