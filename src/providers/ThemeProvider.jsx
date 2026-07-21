import React, { createContext, useContext } from 'react';
import { defaultTheme } from '../config/themes';
import { GlobalStyles } from './GlobalStyles.jsx';

const ThemeContext = createContext(defaultTheme);

export function ThemeProvider({ children, theme = defaultTheme }) {
  return (
    <ThemeContext.Provider value={theme}>
      <GlobalStyles theme={theme} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
