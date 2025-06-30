import { createContext, ReactNode, useContext, useState } from "react";
import { MicroControllerSketch } from "../types/api/sketch"

type SelectedSketchContextType = {
    selectedSketch: MicroControllerSketch | null;
    setSelectedSketch: (sketch: MicroControllerSketch | null) => void;
}

const SelectedSketchContext = createContext<SelectedSketchContextType | null>(null);

export const SelectSketchContextProvider = ({ children }: { children: ReactNode }) => {
    const [selectedSketch, setSelectedSketch] = useState<MicroControllerSketch | null>(null);

    return (
        <SelectedSketchContext.Provider value={{ selectedSketch, setSelectedSketch }}>
            {children}
        </SelectedSketchContext.Provider>
    )
}

export const useSelectedSketch = () => {
    const context = useContext(SelectedSketchContext);
    if (!context) {
        throw new Error("useSelectedSketch must be used within a SelectSketchContextProvider")
    }
    return context;
}