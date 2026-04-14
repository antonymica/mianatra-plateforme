import { createContext, useContext } from 'react';

export type NavigationContextValue = {
  path: string;
  navigate: (path: string) => void;
};

export const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation doit être utilisé dans AppRoutes.');
  }

  return context;
}
