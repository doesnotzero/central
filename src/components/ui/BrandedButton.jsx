import React from 'react';
import { useWhitelabel } from '../../hooks/useWhitelabel.jsx';

export function BrandedButton({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const { branding } = useWhitelabel();
  
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: `bg-[${branding.primaryColor}] text-white hover:opacity-90 focus:ring-[${branding.primaryColor}]`,
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500',
    outline: `border-2 border-[${branding.primaryColor}] text-[${branding.primaryColor}] hover:bg-[${branding.primaryColor}] hover:text-white focus:ring-[${branding.primaryColor}]`,
    ghost: 'text-gray-300 hover:bg-gray-800 focus:ring-gray-500'
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={{ 
        backgroundColor: variant === 'primary' ? branding.primaryColor : undefined,
        borderColor: variant === 'outline' ? branding.primaryColor : undefined,
        color: variant === 'outline' ? branding.primaryColor : undefined
      }}
      {...props}
    >
      {children}
    </button>
  );
}
