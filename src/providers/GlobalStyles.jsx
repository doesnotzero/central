import React from 'react';

export function GlobalStyles({ theme }) {
  return (
    <style>{`
      :root {
        --color-primary: ${theme.colors.primary};
        --color-secondary: ${theme.colors.secondary};
        --color-background: ${theme.colors.background};
        --color-surface: ${theme.colors.surface};
        --color-text: ${theme.colors.text};
        --color-muted: ${theme.colors.muted};
        --color-faint: ${theme.colors.faint};
        
        --font-display: ${theme.fonts.display};
        --font-body: ${theme.fonts.body};
        
        --radius-sm: ${theme.borderRadius.sm};
        --radius-md: ${theme.borderRadius.md};
        --radius-lg: ${theme.borderRadius.lg};
      }
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: var(--font-body), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: var(--color-background);
        color: var(--color-text);
        line-height: 1.6;
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-display), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-weight: 600;
        line-height: 1.2;
      }
      
      button {
        font-family: var(--font-body), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      input, textarea, select {
        font-family: var(--font-body), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    `}</style>
  );
}
