import React, { useEffect, useState } from 'react';
import { BsDashLg, BsWindowFullscreen, BsWindowStack, BsXLg } from 'react-icons/bs';
import { Window } from '@tauri-apps/api/window'
import { useTheme } from '../../app/theme/useTheme';
import classes from './AppTitle.module.css'
import { Outlet } from 'react-router-dom';
import DropdownMenu from '../../ui/separators/DropdownMenu/DropdownMenu';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { FileType, useDescriptor } from '../../storage/DescriptiorContextProvider';
import { emit } from '@tauri-apps/api/event';

const AppTitle: React.FC = () => {
    const [appWindow, _] = useState(Window.getCurrent());
    const [maximizedWFlag, setMaximizedFlag] = useState<boolean>(false);
    const [filePanelIsOpen, setFilePanelIsOpen] = useState<boolean>(false);
    const [instrumentPanelIsOpen, setInstrumentPanelIsOpen] = useState<boolean>(false);
    useTheme();
    const { descriptor, setDescriptor } = useDescriptor();

    useEffect(() => {
        appWindow.isMaximized().then(resp => setMaximizedFlag(resp));
        const handleResize = () => {
            appWindow.isMaximized().then(resp => setMaximizedFlag(resp));
        }

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <>
            <header className={`${classes.AppTitle} ${maximizedWFlag ? classes.AppTitleMaximized : ""}`}>
                <div className={classes.Left} data-tauri-drag-region>
                    <DropdownMenu
                        className={classes.MenuButtonWrapper}
                        buttonClassName={classes.MenuButton}
                        buttonContent={
                            <div className={classes.TitleMenuItem}>
                                Файл
                            </div>
                        }
                        isOpen={filePanelIsOpen}
                        setIsOpen={setFilePanelIsOpen}
                    >
                        <div className={classes.FileMenuPanel}>
                            <button className={classes.MenuPanelItem} onClick={() => {
                                setDescriptor({ filePath: "", fileType: FileType.Module });
                                emit("new-module")
                            }}>Новый модуль</button>
                            <button className={classes.MenuPanelItem} onClick={() => {
                                emit("load-file")
                            }}>Загрузить файл</button>
                            <button className={`${classes.MenuPanelItem} ${descriptor?.filePath ? "" : classes.UnactiveMenuPanelItem}`} onClick={() => {
                                if (!descriptor?.filePath) return;
                                if (descriptor.fileType == FileType.Module) {
                                    emit("save-module")
                                } else if (descriptor.fileType == FileType.Project) {
                                    emit("save-project")
                                }
                            }}>Сохранить</button>
                            <button className={`${classes.MenuPanelItem} ${descriptor?.fileType != null ? "" : classes.UnactiveMenuPanelItem}`} onClick={() => {
                                if (descriptor?.fileType == null) return;
                                if (descriptor.fileType == FileType.Module) {
                                    emit("save-as-module")
                                } else if (descriptor.fileType == FileType.Project) {
                                    emit("save-as-project")
                                }
                            }}>Сохранить как...</button>
                        </div>
                    </DropdownMenu>
                    <DropdownMenu
                        className={classes.MenuButtonWrapper}
                        buttonClassName={classes.MenuButton}
                        buttonContent={
                            <div className={classes.TitleMenuItem} >
                                Инструменты
                            </div>
                        }
                        isOpen={instrumentPanelIsOpen}
                        setIsOpen={setInstrumentPanelIsOpen}
                    >
                        <div className={classes.InstrumentMenuPanel}>
                            <button className={classes.MenuPanelItem} onClick={() => {
                                const w = new WebviewWindow('optional', {
                                    url: 'optional/sketch-manager',
                                    width: 600, height: 400,
                                    decorations: false,
                                });

                                w.once('tauri://created', () => console.log('OK'));
                                w.once('tauri://error', e => console.error(e));
                            }}>Менеджер скетчей</button>
                            <button className={classes.MenuPanelItem} onClick={() => {
                                const w = new WebviewWindow('optional', {
                                    url: 'optional/module-manager',
                                    width: 600, height: 400,
                                    decorations: false,
                                });

                                w.once('tauri://created', () => console.log('OK'));
                                w.once('tauri://error', e => console.error(e));
                            }}>Менеджер модулей</button>
                        </div>
                    </DropdownMenu>
                </div>
                <div className={classes.Right} data-tauri-drag-region>
                    <BsDashLg onClick={() => appWindow.minimize()} className={classes.Icon} />
                    {
                        maximizedWFlag ?
                            <BsWindowStack className={classes.Icon} onClick={() => appWindow.unmaximize()} />
                            :
                            <BsWindowFullscreen className={classes.Icon} onClick={() => appWindow.maximize()} />
                    }
                    <BsXLg className={`${classes.Icon} ${classes.Quit}`} onClick={() => appWindow.close()} />
                </div>
            </header>
            <Outlet />
        </>
    );
};

export default AppTitle;