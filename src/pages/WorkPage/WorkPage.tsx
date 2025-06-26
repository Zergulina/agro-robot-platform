import React, { useEffect, useRef, useState } from 'react';
import pageClasses from '../Page.module.css';
import classes from './WorkPage.module.css'
import WorkspaceSelection from '../../modules/WorkspaceSelection/WorkspaceSelection';
import { Canvas } from '../../components/Canvas/Canvas';
import SelectedUnitInterface from '../../modules/SelectedUnitInterface/SelectedUnitInterface';
import { DrawUnit } from '../../types/nodes/primitives/DrawUnit';


const WorkPage: React.FC = () => {
    const [unitIntefaceIsDragging, setUnitIntefaceIsDragging] = useState(false);
    const [startDraggingPostion, setStartDraggingPostion] = useState<number>(0);
    const startWidth = useRef<number>(200);
    const [unitInterfaceWidth, setUnitInterfaceWidth] = useState(startWidth.current);
    const [workspaceContainerSize, setWorkspaceContainerSize] = useState<Size>({ width: window.innerWidth - startWidth.current, height: window.innerHeight });
    const [selectedNodeUnit, setSelectedNodeUnit] = useState<DrawUnit | null>(null);

    useEffect(() => {
        const handleResize = () => {
            setWorkspaceContainerSize({ width: window.innerWidth - startWidth.current, height: window.innerHeight - 35 });
        }

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (unitIntefaceIsDragging) {
            const newUnitInterfaceWidth = Math.min(Math.max(startWidth.current + e.clientX - startDraggingPostion, 200), 600);
            setUnitInterfaceWidth(newUnitInterfaceWidth);
            setWorkspaceContainerSize({ width: window.innerWidth - newUnitInterfaceWidth, height: workspaceContainerSize.height });
        }
    }

    const hanleMouseUp = (_: React.MouseEvent) => {
        setUnitIntefaceIsDragging(false);
        window.document.body.style.cursor = "default";
        startWidth.current = unitInterfaceWidth;
    }

    const handleMouseLeave = (_: React.MouseEvent) => {
        setUnitIntefaceIsDragging(false);
        window.document.body.style.cursor = "default";
        startWidth.current = unitInterfaceWidth;
    }

    const handleSetUnitIntefaceIsDragging = (newValue: boolean) => {
        setUnitIntefaceIsDragging(newValue);
        window.document.body.style.cursor = "w-resize";
        if (newValue) {
            setStartDraggingPostion(unitInterfaceWidth);
        }
    }

    return (
        <main className={`${pageClasses.Page} ${classes.WorkPage}`} onMouseMove={handleMouseMove} onMouseUp={hanleMouseUp} onMouseLeave={handleMouseLeave}>
            <SelectedUnitInterface width={unitInterfaceWidth} setIsDragging={handleSetUnitIntefaceIsDragging} selectedNodeUnit={selectedNodeUnit} />
            <div className={classes.Main} style={{ width: workspaceContainerSize.width }}>
                <WorkspaceSelection />
                <Canvas setSelectedNodeUnit={setSelectedNodeUnit} />
            </div>
        </main>
    );
};

export default WorkPage;