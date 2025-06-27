import { createContext, ReactNode, useContext, useState } from "react";
import { MicroController } from "../types/nodes/MicroController"

type MicroControllerContextType = {
    microController: MicroController | null;
    setMicroController: (microController: MicroController) => void;
}

const MicroControllerContext = createContext<MicroControllerContextType | null>(null);

export const MicroControllerProvider = ({ children }: { children: ReactNode }) => {
    const [microController, setMicroController] = useState<MicroController | null>(null);

    return (
        <MicroControllerContext.Provider value={{ microController, setMicroController }}>
            {children}
        </MicroControllerContext.Provider>
    );
}

export const useMicroController = () => {
    const context = useContext(MicroControllerContext);
    if (!context) {
        throw new Error('useMicroController must be used within a SketchProvider')
    }
    return context;
}