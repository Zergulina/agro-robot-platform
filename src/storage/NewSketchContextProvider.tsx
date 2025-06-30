import { createContext, ReactNode, useContext, useState } from 'react';
import { CreateSketchRequest } from '../types/api/sketch';

type SketchContextType = {
    newSketch: CreateSketchRequest | null;
    setNewSketch :  (sketch: CreateSketchRequest | null) => void;
}

const NewSketchContext = createContext<SketchContextType | null>(null);

export const NewSketchContextProvider = ({children} : {children : ReactNode}) => {
    const [newSketch, setNewSketch] = useState<CreateSketchRequest | null>(null);

    return (
        <NewSketchContext.Provider value={{newSketch, setNewSketch}}>
            {children}
        </NewSketchContext.Provider>
    );
}

export const useNewSketch = () => {
  const context = useContext(NewSketchContext);
  if (!context) {
    throw new Error('useNewSketch must be used within a NewSketchContextProvider');
  }
  return context;
}