import { createContext, ReactNode, useContext, useState } from 'react';
import { CreateModuleRequest } from '../types/api/module';

type ModuleContextType = {
    newModule: CreateModuleRequest | null;
    setNewModule :  (module: CreateModuleRequest | null) => void;
}

const NewModuleContext = createContext<ModuleContextType | null>(null);

export const NewModuleContextProvider = ({children} : {children : ReactNode}) => {
    const [newModule, setNewModule] = useState<CreateModuleRequest | null>(null);

    return (
        <NewModuleContext.Provider value={{newModule, setNewModule}}>
            {children}
        </NewModuleContext.Provider>
    );
}

export const useNewModule = () => {
  const context = useContext(NewModuleContext);
  if (!context) {
    throw new Error('useNewModule must be used within a NewModuleContextProvider');
  }
  return context;
}