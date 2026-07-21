import React from 'react';
import { useWhitelabel } from '../../hooks/useWhitelabel.jsx';

export function BrandedHeader({ title, subtitle }) {
  const { branding } = useWhitelabel();
  
  return (
    <div className="mb-8">
      <h1 
        className="text-4xl font-bold"
        style={{ color: branding.primaryColor }}
      >
        {branding.appName}
      </h1>
      {subtitle && (
        <p className="text-xl text-gray-400 mt-2">
          {branding.appSubtitle}
        </p>
      )}
    </div>
  );
}
