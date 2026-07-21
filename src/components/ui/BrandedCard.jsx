import React from 'react';
import { useTheme } from '../../providers/ThemeProvider.jsx';

export function BrandedCard({ children, className = '', ...props }) {
  const theme = useTheme();
  
  return (
    <div
      className={`rounded-lg border p-6 ${className}`}
      styleStyle={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.faint
      }}
      {...props}
    >
      {children}
    </div>
  );
}
