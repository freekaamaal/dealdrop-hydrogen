import {createContext, useContext, useState, type ReactNode} from 'react';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';

type AsideContextType = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
  isOpen: boolean;
};

const AsideContext = createContext<AsideContextType | null>(null);

export function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  const open = (mode: AsideType) => setType(mode);
  const close = () => setType('closed');

  return (
    <AsideContext.Provider
      value={{type, open, close, isOpen: type !== 'closed'}}
    >
      {children}
    </AsideContext.Provider>
  );
}

export function useAside() {
  const context = useContext(AsideContext);
  if (!context) {
    // Fallback for SSR or when provider is missing to prevent crash
    return {
      type: 'closed',
      open: () => {},
      close: () => {},
      isOpen: false,
    } as AsideContextType;
  }
  return context;
}
