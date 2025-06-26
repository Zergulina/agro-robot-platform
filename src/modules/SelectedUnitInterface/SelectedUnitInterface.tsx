import React, { useEffect, useRef, useState } from 'react';
import classes from './SelectedUnitInterface.module.css';
import { DrawUnit } from '../../types/nodes/primitives/DrawUnit';
import { MicroController } from '../../types/nodes/MicroController';

type SelectedUnitInterfaceProps = {
    width: number,
    setIsDragging: (newValue: boolean) => void,
    selectedNodeUnit: DrawUnit | null
}

const SelectedUnitInterface: React.FC<SelectedUnitInterfaceProps> = ({ width, setIsDragging, selectedNodeUnit }) => {
    const [interfaceData, setInterfaceData] = useState<any>({});

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (selectedNodeUnit instanceof MicroController) {
            setInterfaceData({ sketch: selectedNodeUnit.sketch, codeParams: selectedNodeUnit.codeParams })
            if (!fileInputRef.current?.files) return
            if (selectedNodeUnit.sketch) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(selectedNodeUnit.sketch);
                fileInputRef.current.files = dataTransfer.files;
            } else {
                const dataTransfer = new DataTransfer();
                fileInputRef.current.files = dataTransfer.files;
            }

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
                            <input type="file" ref={fileInputRef} onChange={e => {
                                selectedNodeUnit.sketch = e.target.files ? e.target.files[0] : null
                                console.log(selectedNodeUnit.codeParams);
                                setInterfaceData({ ...interfaceData, file: e.target.files ? e.target.files[0] : null, codeParams: selectedNodeUnit.codeParams });
                            }} />
                            <div>
                                <h4>Параметры</h4>
                                {
                                    interfaceData.codeParams && interfaceData.codeParams.map((codeParam: any, index: number) =>
                                        <div key={codeParam.macrosName}>
                                            {codeParam.name}: <input value={codeParam.value} onChange={e => {
                                                const newCodeParams = [...interfaceData.codeParams];
                                                newCodeParams[index].value = e.target.value;
                                                setInterfaceData({...interfaceData, codeParams: newCodeParams})}
                                            }/>
                                        </div>
                                    )
                                }
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