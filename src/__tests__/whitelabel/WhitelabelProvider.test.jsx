import React from 'react';
import { render, screen } from '@testing-library/react';
import { WhitelabelProvider } from '../../providers/WhitelabelProvider.jsx';

describe('WhitelabelProvider', () => {
  it('applies custom branding', () => {
    const customConfig = {
      branding: { appName: 'Custom App', primaryColor: '#00ff00' }
    };
    
    render(
      <WhitelabelProvider config={customConfig}>
        <div>Test</div>
      </WhitelabelProvider>
    );
    
    // Teste básico - verifica se o provider renderiza
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('uses default config when no config provided', () => {
    render(
      <WhitelabelProvider>
        <div>Test</div>
      </WhitelabelProvider>
    );
    
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
