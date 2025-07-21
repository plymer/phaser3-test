import { IRefGameEngine } from "@/engine/GameEngine";
import { createContext, useContext, useRef, ReactNode } from "react";

interface EngineContextType {
  engineRef: React.RefObject<IRefGameEngine | null>;
}

const EngineContext = createContext<EngineContextType | undefined>(undefined);

interface EngineProviderProps {
  children: ReactNode;
}

export const EngineProvider = ({ children }: EngineProviderProps) => {
  const engineRef = useRef<IRefGameEngine | null>(null);

  return <EngineContext.Provider value={{ engineRef }}>{children}</EngineContext.Provider>;
};

export const useEngineContext = () => {
  const context = useContext(EngineContext);
  if (context === undefined) {
    throw new Error("useEngineContext must be used within a EngineProvider");
  }
  return context;
};

export default EngineContext;
