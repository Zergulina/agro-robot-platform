import React, { useEffect, useRef, useState } from 'react';
import classes from './SelectedUnitInterface.module.css';
import { DrawUnit } from '../../types/nodes/primitives/DrawUnit';
import { MicroController } from '../../types/nodes/MicroController';
import AccentButton from '../../ui/buttons/AccentButton/AccentButton';
import { useMicroController } from '../../storage/SelectedMicroControllerProvider';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

type SelectedUnitInterfaceProps = {
    width: number,
    setIsDragging: (newValue: boolean) => void,
    selectedNodeUnit: DrawUnit | null
}

const SelectedUnitInterface: React.FC<SelectedUnitInterfaceProps> = ({ width, setIsDragging, selectedNodeUnit }) => {
    const [interfaceData, setInterfaceData] = useState<any>({});
    const { microController, setMicroController } = useMicroController();

    useEffect(() => {
        if (selectedNodeUnit instanceof MicroController) {
            setInterfaceData({})
            setMicroController(selectedNodeUnit);
        }
        else {
            setInterfaceData({});
        }
    }, [selectedNodeUnit])

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) {
            setIsDragging(true);
        }
    }

    return (
        <div className={classes.SelectedUnitInterface} style={{ width: width }}>
            <div className={classes.DraggableArea} onMouseDown={handleMouseDown} />
            <div>
                {
                    selectedNodeUnit instanceof MicroController ?
                        <div>
                            <h3>Выбранный скетч</h3>
                            <AccentButton onClick={() => {
                                const w = new WebviewWindow('optional', {
                                    url: 'optional/sketch-manager/select',
                                    width: 600, height: 400,
                                    decorations: false,
                                });

                                w.once('tauri://created', () => console.log('OK'));
                                w.once('tauri://error', e => console.error(e));
                            }}>
                                Выбрать скетч
                            </AccentButton>
                            <div>
                                <h4>Параметры</h4>

                            </div>
                        </div>
                        :
                        <>Hiiii</>
                }
            </div>
        </div>
    );
};

export default SelectedUnitInterface;