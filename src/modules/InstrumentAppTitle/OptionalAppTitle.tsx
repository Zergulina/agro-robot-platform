import { Window } from '@tauri-apps/api/window';
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../app/theme/useTheme';

import classes from './OptionalAppTitle.module.css'
import { Outlet } from 'react-router-dom';
import { BsDashLg, BsWindowFullscreen, BsWindowStack, BsXLg } from 'react-icons/bs';

const OptionalAppTitle: React.FC = () => {
    const [appWindow, _] = useState(Window.getCurrent());
    const [maximizedWFlag, setMaximizedFlag] = useState<boolean>(false);

    useTheme();

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

export default OptionalAppTitle;