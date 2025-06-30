import React, { ReactNode, useRef, useState } from 'react';
import classes from './TipContainer.module.css';
import { createPortal } from 'react-dom';

export enum TipPosition {
    Top,
    Right,
    Bottom,
    Left
}

type TipContainerProps = {
    tip: string;
    tipPosition: TipPosition;
    tipPadding: number;
    children: ReactNode;
    className?: string;
}

const TipContainer: React.FC<TipContainerProps> = ({ tip, tipPosition, tipPadding, children, className }) => {
    const [isShown, setIsShown] = useState<boolean>(false);
    const [timerId, setTimerId] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        setTimerId(setTimeout(() => {
            setIsShown(true);
            setTimerId(null);
        }, 1000));
    }

    const handleMouseLeave = () => {
        if (timerId) {
            clearTimeout(timerId);
            setTimerId(null);
        }
        else {
            setIsShown(false);
        }
    }

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`${classes.TipContainer} ${className || ""}`}
            ref={containerRef}
        >
            {children}
            {createPortal(
                <div className={classes.Tip} style={
                    tipPosition == TipPosition.Top ?
                        {
                            display: isShown ? "block" : "none",
                            top: (containerRef.current?.getBoundingClientRect().top || 0) - (containerRef.current?.getBoundingClientRect().height || 0) - tipPadding,
                            left: (containerRef.current?.getBoundingClientRect().left || 0)
                        }
                        : tipPosition == TipPosition.Right ?
                            {
                                display: isShown ? "block" : "none",
                                top: containerRef.current?.getBoundingClientRect().top,
                                left: (containerRef.current?.getBoundingClientRect().left || 0) + (containerRef.current?.getBoundingClientRect().width || 0) + tipPadding
                            }
                            : tipPosition == TipPosition.Bottom ?
                                {
                                    display: isShown ? "block" : "none",
                                    top: containerRef.current?.getBoundingClientRect().top,
                                    left: (containerRef.current?.getBoundingClientRect().left || 0) - (containerRef.current?.getBoundingClientRect().width || 0) + tipPadding
                                }
                                :
                                {
                                    display: isShown ? "block" : "none",
                                    top: (containerRef.current?.getBoundingClientRect().bottom || 0) + tipPadding,
                                    left: (containerRef.current?.getBoundingClientRect().left || 0) + (containerRef.current?.getBoundingClientRect().width || 0) + tipPadding
                                }

                }>
                    {tip}
                </div>, document.body
            )}

        </div>
    );
};


export default TipContainer;