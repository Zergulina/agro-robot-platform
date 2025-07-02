import React, { useEffect, useRef, useState } from 'react';
import pageClasses from '../Page.module.css';
import classes from './WorkPage.module.css'
import WorkspaceSelection from '../../modules/WorkspaceSelection/WorkspaceSelection';
import { Canvas } from '../../components/Canvas/Canvas';
import SelectedUnitInterface from '../../modules/SelectedUnitInterface/SelectedUnitInterface';
import { DrawUnit } from '../../types/nodes/primitives/DrawUnit';
import { MicroController } from '../../types/nodes/MicroController';
import { listen } from '@tauri-apps/api/event';
import { FileType, useDescriptor } from '../../storage/DescriptiorContextProvider';
import { saveAsModule } from '../../api/other/saveAsModule';
import { getSaveModuleData, loadModuleData } from '../../logic/module/saveLoad';
import { saveModule } from '../../api/other/saveModule';
import { loadFile } from '../../api/other/loadFile';
import { Notifications } from '../../modules/Notifications/Notifications';
import { MyNotification } from '../../components/Notification/NotificationItem';

const WorkPage: React.FC = () => {
    const [unitIntefaceIsDragging, setUnitIntefaceIsDragging] = useState(false);
    const [startDraggingPostion, setStartDraggingPostion] = useState<number>(0);
    const startWidth = useRef<number>(200);
    const [unitInterfaceWidth, setUnitInterfaceWidth] = useState(startWidth.current);
    const [workspaceContainerSize, setWorkspaceContainerSize] = useState<Size>({ width: window.innerWidth - startWidth.current, height: window.innerHeight });
    const [selectedNodeUnit, setSelectedNodeUnit] = useState<DrawUnit | null>(null);
    const initialNodes: DrawUnit[] = [
        new MicroController({ x: 0, y: 500 }),
    ];
    const nodes = useRef<DrawUnit[]>(initialNodes);
    const [notifications, setNotifications] = useState<MyNotification[]>([]);

    const { descriptor, setDescriptor } = useDescriptor();
    const filePath = useRef<string>("");

    useEffect(() => {
        const handleResize = () => {
            setWorkspaceContainerSize({ width: window.innerWidth - startWidth.current, height: window.innerHeight - 35 });
        }

        window.addEventListener("resize", handleResize);

        const setupListener = async () => {
            const saveAsModuleUnlisten = await listen("save-as-module", () => {
                if (!descriptor) return;
                saveAsModule(getSaveModuleData(nodes.current), (path) => setDescriptor({ ...descriptor, filePath: path }))
            });
            const saveModuleUnlisten = await listen("save-module", () => {
                if (!filePath.current) return;
                saveModule(filePath.current, getSaveModuleData(nodes.current));
                setNotifications((prev) => [
                    ...prev,
                    {
                        id: Date.now() + Math.random(),
                        type: "success",
                        message: "Успешно сохранено",
                    },
                ]);
            });
            const loadFileUnlisten = await listen("load-file", () => {
                loadFile((loadedFile) => {
                    const checkRow = loadedFile.data.split(/\r\n|\r|\n/)[1];
                    if (checkRow.includes("Module")) {
                        nodes.current = loadModuleData(loadedFile.data);
                        console.log(loadedFile.path)
                        setDescriptor({ filePath: loadedFile.path, fileType: FileType.Module });
                        filePath.current = loadedFile.path;
                    } else {
                        console.error("Неверный файл");
                    }
                    setNotifications((prev) => [
                    ...prev,
                    {
                        id: Date.now() + Math.random(),
                        type: "success",
                        message: "Успешно загружено",
                    },
                ]);
                });
            });
            const deleteUnlisten = await listen("delete-node", (event) => {
                nodes.current.find(x => x.uuid == event.payload)?.InConnections.forEach(x => {
                    if (x.sourceNode) {
                        x.sourceNode.targetNode = null
                        x.sourceNode = null;
                        x.ownerNode = null;
                    }
                })
                nodes.current.find(x => x.uuid == event.payload)?.OutConnections.forEach(x => {
                    if (x.targetNode) {
                        x.targetNode.sourceNode = null
                        x.targetNode = null;
                        x.ownerNode = null;
                    }
                })
                setSelectedNodeUnit(null);
                nodes.current = nodes.current.filter(node => node.uuid != event.payload);
            });
            const getNotificationUnlisten = await listen<MyNotification>("notification", (event) => {
                setNotifications((prev) => [
                    ...prev,
                    {
                        id: Date.now() + Math.random(),
                        type: event.payload!.type!,
                        message: event.payload!.message,
                    },
                ]);
            });
            const newModuleUnlisten = await listen("new-module", () => {
                nodes.current = [new MicroController({ x: 0, y: 500 })];
                setSelectedNodeUnit(null);
                setNotifications((prev) => [
                    ...prev,
                    {
                        id: Date.now() + Math.random(),
                        type: "success",
                        message: "Создан новый модуль",
                    },
                ]);
            });

            return () => {
                saveModuleUnlisten();
                saveAsModuleUnlisten();
                loadFileUnlisten();
                deleteUnlisten();
                getNotificationUnlisten();
                newModuleUnlisten();
            }
        }

        const cleanup = setupListener();

        return () => {
            window.removeEventListener("resize", handleResize);
            cleanup.then(un => un && un());
        }
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (unitIntefaceIsDragging) {
            const newUnitInterfaceWidth = Math.min(Math.max(startWidth.current + e.clientX - startDraggingPostion, 200), 550);
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
                <WorkspaceSelection nodes={nodes.current} />
                <Canvas nodes={nodes} setSelectedNodeUnit={setSelectedNodeUnit} panelLeftOffset={unitInterfaceWidth} />
            </div>
            <Notifications notifications={notifications} setNotifications={setNotifications} />
        </main>
    );
};

export default WorkPage;