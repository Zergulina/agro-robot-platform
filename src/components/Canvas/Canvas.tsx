import React, { useEffect, useRef, useState } from "react"
import classes from './Canvas.module.css';
import { MicroController } from "../../types/nodes/MicroController";
import { DrawUnit } from "../../types/nodes/primitives/DrawUnit";
import { ClickType } from "../../types/nodes/ClickType";


const initialNodes: DrawUnit[] = [
    new MicroController({ x: 0, y: 500 }),
    // new MicroController({ x: 300, y: -250 }),
    // new MicroController({ x: -200, y: -1000 }),
];

type CanvasProps = {
    setSelectedNodeUnit: (value: DrawUnit | null) => void
}

export const Canvas: React.FC<CanvasProps> = ({ setSelectedNodeUnit }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodes = useRef<DrawUnit[]>(initialNodes);
    const offset = useRef<Position>({ x: 0, y: 0 });
    const scale = useRef(1);
    const [oldScale, setOldScale] = useState(scale.current);
    const [isDragging, setIsDragging] = useState(false);
    const [startDraggingPosition, setStartDraggingPosition] = useState<Position>({ x: 0, y: 0 });
    const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
    const [canvasSize, setCanvasSize] = useState<Size>({ width: 0, height: 0 });
    const [isNodeDragging, setIsNodeDragging] = useState<boolean>(false);
    const [nodePositionDelta, setNodePositionDelta] = useState<Position>({ x: 0, y: 0 });
    const selectedNode = useRef<DrawUnit | null>(null);
    const [isDrawingArrow, setIsDrawingArrow] = useState(false);


    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        ctx.translate(offset.current.x, offset.current.y)
        ctx.scale(scale.current, scale.current);

        if (scale.current >= 0.4) {

            const dotsStartWorldX = -offset.current.x / scale.current + offset.current.x / scale.current % 20;
            const dotsStartWorldY = -offset.current.y / scale.current + offset.current.y / scale.current % 20;

            for (let x = dotsStartWorldX; x <= canvas.width / scale.current + dotsStartWorldX + 20; x += 20) {
                for (let y = dotsStartWorldY; y <= canvas.height / scale.current + dotsStartWorldY + 20; y += 20) {
                    ctx.beginPath();
                    ctx.fillStyle = "gray";
                    ctx.arc(x, y, 1, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }

        } else {

            const dotsStartWorldX = -offset.current.x / scale.current + offset.current.x / scale.current % 80;
            const dotsStartWorldY = -offset.current.y / scale.current + offset.current.y / scale.current % 80;

            for (let x = dotsStartWorldX; x <= canvas.width / scale.current + dotsStartWorldX + 80; x += 80) {
                for (let y = dotsStartWorldY; y <= canvas.height / scale.current + dotsStartWorldY + 80; y += 80) {
                    ctx.beginPath();
                    ctx.fillStyle = "gray";
                    ctx.arc(x, y, 4, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }

        }

        for (const node of nodes.current) {
            node.draw(ctx);
        }

        ctx.restore();
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (!canvas.parentElement) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target === canvas.parentElement) {
                    canvas.width = window.innerWidth - canvas.offsetLeft;
                    canvas.height = window.innerHeight - canvas.offsetTop;
                    draw();
                    setCanvasSize({ width: canvas.width, height: canvas.height });
                }
            }
        })


        canvas.width = window.innerWidth - canvas.offsetLeft;
        canvas.height = window.innerHeight - canvas.offsetTop;

        setCanvasSize({ width: canvas.width, height: canvas.height });

        observer.observe(canvas.parentElement);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        draw();
    }, [nodes.current, offset.current, scale.current, canvasSize]);

    const handleWheel = (e: React.WheelEvent) => {
        if (isDragging) return;

        const worldX = (mousePosition.x - offset.current.x) / oldScale;
        const worldY = (mousePosition.y - offset.current.y) / oldScale;

        const scaleAmount = -e.deltaY * 0.001;

        const newScale = Math.min(Math.max(scale.current + scaleAmount, 0.1), 2);
        const newOffsetX = mousePosition.x - worldX * newScale;
        const newOffsetY = mousePosition.y - worldY * newScale;

        scale.current = newScale;

        setOldScale(scale.current);

        offset.current = { x: newOffsetX, y: newOffsetY };
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const rect = canvas.getBoundingClientRect();

        if (e.button === 2) {
            setIsDragging(true);
            setStartDraggingPosition({ x: e.clientX - rect.left - offset.current.x, y: e.clientY - rect.top - offset.current.y });
        }

        if (e.button === 0) {
            if (selectedNode.current) {
                selectedNode.current.isSelected = false;
                selectedNode.current = null;
                setSelectedNodeUnit(null);
            }

            for (let node of nodes.current) {
                const clickResponse = node.checkIsClicked({ x: (e.clientX - rect.left - offset.current.x) / scale.current, y: (e.clientY - rect.top - offset.current.y) / scale.current });
                switch (clickResponse.clickType) {
                    case ClickType.Selectable:
                        selectedNode.current = node;
                        setSelectedNodeUnit(node);
                        selectedNode.current.isSelected = true;
                        setIsNodeDragging(true);
                        setNodePositionDelta({ x: selectedNode.current.position.x - (e.clientX - rect.left - offset.current.x) / scale.current, y: selectedNode.current.position.y - (e.clientY - rect.top - offset.current.y) / scale.current })
                        draw();
                        return;
                    case ClickType.Connector:

                }
            };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const rect = canvas.getBoundingClientRect();

        if (isDragging) {
            offset.current = {
                x: e.clientX - rect.left - startDraggingPosition.x,
                y: e.clientY - rect.top - startDraggingPosition.y
            };
        }

        if (isNodeDragging && selectedNode.current) {
            selectedNode.current.position = { x: (e.clientX - rect.left - offset.current.x) / scale.current + nodePositionDelta.x, y: (e.clientY - rect.top - offset.current.y) / scale.current + nodePositionDelta.y }
            draw();
        }

        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseUp = (_: React.MouseEvent) => {
        setIsNodeDragging(false);
        setIsDragging(false);
    }

    const handleMouseLeave = (_: React.MouseEvent) => {
        setIsNodeDragging(false);
        setIsDragging(false);
    }

    return (
        <canvas
            ref={canvasRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={classes.Canvas}
            onMouseLeave={handleMouseLeave}
        />
    )
}