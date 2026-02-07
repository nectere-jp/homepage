'use client';

import { createContext, useContext, ReactNode } from 'react';

type Business = 'nobilva' | 'teachit' | 'translation' | 'web-design' | 'print' | null;

interface BusinessContextType {
  business: Business;
}

const BusinessContext = createContext<BusinessContextType>({
  business: null,
});

export function BusinessProvider({
  children,
  business,
}: {
  children: ReactNode;
  business: Business;
}) {
  return (
    <BusinessContext.Provider value={{ business }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
