import React from 'react';
import { createRoot } from 'react-dom/client';
import { App, ErrorBoundary } from './App.jsx';
import { WhitelabelProvider } from './providers/WhitelabelProvider.jsx';
import { ThemeProvider } from './providers/ThemeProvider.jsx';
import { defaultWhitelabel } from './config/whitelabel';
import { defaultTheme } from './config/themes';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <WhitelabelProvider config={defaultWhitelabel}>
      <ThemeProvider theme={defaultTheme}>
        <App />
      </ThemeProvider>
    </WhitelabelProvider>
  </ErrorBoundary>
);
