import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseStyles = 'px-4 py-2 font-semibold rounded-lg focus:outline-none';
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700',
    secondary: 'bg-secondary text-white hover:bg-purple-700',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
