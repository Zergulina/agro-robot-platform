import { createContext, ReactNode, useContext, useState } from "react";

export enum FileType {
    Project,
    Module
}

export type Descriptor = {
    filePath: string;
    fileType: FileType | null
}

type DescriptorContextType = {
    descriptor: Descriptor | null;
    setDescriptor: (value: Descriptor | null) => void;
}

const DescriptorContext = createContext<DescriptorContextType| null>(null);

export const DescriptorContextProvider = ({children}: {children: ReactNode}) => {
    const [descriptor, setDescriptor] = useState<Descriptor | null>({filePath: "", fileType: FileType.Module});

    return (
        <DescriptorContext.Provider value={{descriptor, setDescriptor}}>
            {children}
        </DescriptorContext.Provider>
    );
}

export const useDescriptor = () => {
    const context = useContext(DescriptorContext);
      if (!context) {
        throw new Error('useDescriptor must be used within a DescriptorContextProvider');
      }
      return context;
}