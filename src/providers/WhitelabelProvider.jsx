import React, { createContext, useContext } from 'react';
import { defaultWhitelabel } from '../config/whitelabel';

const WhitelabelContext = createContext(defaultWhitelabel);

export function WhitelabelProvider({ children, config = defaultWhitelabel }) {
  return (
    <WhitelabelContext.Provider value={config}>
      {children}
    </WhitelabelContext.Provider>
  );
}

export function useWhitelabel() {
  const context = useContext(WhitelabelContext);
  if (!context) {
    throw new Error('useWhitelabel must be used within WhitelabelProvider');
  }
  return context;
}
