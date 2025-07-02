import React, { useEffect, useRef, useState } from "react"
import classes from './Canvas.module.css';
import { DrawUnit } from "../../types/nodes/primitives/DrawUnit";
import { ClickType } from "../../types/nodes/ClickType";
import { useSelectedSketch } from "../../storage/SelectSketchContextProvider";
import { RiDivideFill, RiFocus3Line } from "react-icons/ri";
import { BiMath } from "react-icons/bi";
import { LuBinary, LuPercent } from "react-icons/lu";
import { MdInput, MdOutlineExpandMore, MdOutput } from "react-icons/md";
import TipContainer, { TipPosition } from "../../ui/separators/TipContainer/TipContainer";
import { BsPlusSlashMinus, BsX } from "react-icons/bs";
import { HiOutlinePlusSmall } from "react-icons/hi2";
import { FiMinus } from "react-icons/fi";
import { DifferenceNode } from "../../types/nodes/algebra/BinaryOperations/DifferenceNode";
import { Connector } from "../../types/nodes/primitives/Connector";
import { UnaryMinusNode } from "../../types/nodes/algebra/UnaryOperation/UnaryMinusNode";
import { MultiplicationNode } from "../../types/nodes/algebra/BinaryOperations/MultiplicationNode";
import { DivisionNode } from "../../types/nodes/algebra/BinaryOperations/DivisionNode";
import { ModuleDivisionNode } from "../../types/nodes/algebra/BinaryOperations/ModuleDivisionNode";
import { SumNode } from "../../types/nodes/algebra/BinaryOperations/SumNode";
import { NotNode } from "../../types/nodes/logic/UnaryOperations/NotNode";
import { AndNode } from "../../types/nodes/logic/MultiConnectionOperations/AndNode";
import { OrNode } from "../../types/nodes/logic/MultiConnectionOperations/OrNode";
import { NorNode } from "../../types/nodes/logic/MultiConnectionOperations/NorNode";
import { NandNode } from "../../types/nodes/logic/MultiConnectionOperations/Nand";
import { XorNode } from "../../types/nodes/logic/BinaryNodes/XorNode";
import { ImplNode } from "../../types/nodes/logic/BinaryNodes/ImplNode";
import { EqNode } from "../../types/nodes/logic/BinaryNodes/EqNode";
import { LessEqNode } from "../../types/nodes/compare/BinaryOperations/LessEqNode";
import { LessNode } from "../../types/nodes/compare/BinaryOperations/LessNode";
import { MoreEqNode } from "../../types/nodes/compare/BinaryOperations/MoreEqNode";
import { MoreNode } from "../../types/nodes/compare/BinaryOperations/MoreNode";
import { CompareNotEqNode } from "../../types/nodes/compare/BinaryOperations/CompareNotEqNode";
import { CompareEqNode } from "../../types/nodes/compare/BinaryOperations/CompareEqNode";
import { TiArrowShuffle } from "react-icons/ti";
import { Repeater } from "../../types/nodes/Repeater";
import { Command } from "../../types/nodes/input/Command";
import { DataRequest } from "../../types/nodes/output/DataRequest";
import { Constant } from "../../types/nodes/Constant";
import { TbCircleLetterC } from "react-icons/tb";
import { listen } from "@tauri-apps/api/event";



type CanvasProps = {
    setSelectedNodeUnit: (value: DrawUnit | null) => void;
    panelLeftOffset: number;
    nodes: React.MutableRefObject<DrawUnit[]>;
}

export const Canvas: React.FC<CanvasProps> = ({ setSelectedNodeUnit, panelLeftOffset, nodes }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const newSelectedNode = useRef<DrawUnit | null>(null);
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
    const { selectedSketch } = useSelectedSketch();

    const [algebraMenuIsShown, setAlgebraMenuIsShown] = useState<boolean>(false);
    const [logicMenuIsShown, setLogicMenuIsShown] = useState<boolean>(false);
    const [compareMenuIsShown, setCompareMenuIsShown] = useState<boolean>(false);
    const [newSelectedNodeName, setNewSelectedNodeName] = useState<string>("");
    const generateNewSketchNode = useRef<(position: Position) => DrawUnit | null>(() => null)

    function drawArrow(
        ctx: CanvasRenderingContext2D,
        fromPosition: Position,
        toPosition: Position,
        arrowHeadLength: number = 10
    ): void {
        const dx = toPosition.x - fromPosition.x;
        const dy = toPosition.y - fromPosition.y;
        const angle = Math.atan2(dy, dx);

        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";

        ctx.beginPath();
        ctx.moveTo(fromPosition.x, fromPosition.y);
        ctx.lineTo(toPosition.x, toPosition.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toPosition.x, toPosition.y);
        ctx.lineTo(
            toPosition.x - arrowHeadLength * Math.cos(angle - Math.PI / 6),
            toPosition.y - arrowHeadLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            toPosition.x - arrowHeadLength * Math.cos(angle + Math.PI / 6),
            toPosition.y - arrowHeadLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.lineTo(toPosition.x, toPosition.y);
        ctx.fill();
    }

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

        if (isDrawingArrow && selectedNode.current) drawArrow(ctx, selectedNode.current.position, { x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current })

        for (const node of nodes.current) {
            node.draw(ctx);
        }

        ctx.globalAlpha = 0.5;
        newSelectedNode.current?.draw(ctx);

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

        const setupListener = async () => {
            const unlisten = await listen("canvas-draw", () => {
                draw();
            })

            return () => {
                unlisten();
            }
        }
        const cleanup = setupListener();

        return () => {
            observer.disconnect()
            cleanup.then(un => un && un());
        };
    }, []);

    useEffect(() => {
        draw();
    }, [nodes.current, offset.current, scale.current, canvasSize, selectedSketch, isDrawingArrow]);
    useEffect(() => {
        if (!isDrawingArrow) return;
        draw();
    }, [mousePosition]);

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
            if (newSelectedNode.current) {
                nodes.current.push(newSelectedNode.current);
                newSelectedNode.current = generateNewSketchNode.current({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
            }

            setIsDrawingArrow(false);

            for (let node of nodes.current) {
                const clickResponse = node.checkIsClicked({ x: (e.clientX - rect.left - offset.current.x) / scale.current, y: (e.clientY - rect.top - offset.current.y) / scale.current });
                switch (clickResponse.clickType) {
                    case ClickType.Selectable:
                        if (selectedNode.current) selectedNode.current.isSelected = false;
                        if (selectedNode.current instanceof Connector) selectedNode.current.arrowIsSelected = false;
                        selectedNode.current = node;
                        setSelectedNodeUnit(node);
                        selectedNode.current.isSelected = true;
                        setIsNodeDragging(true);
                        setNodePositionDelta({ x: selectedNode.current.position.x - (e.clientX - rect.left - offset.current.x) / scale.current, y: selectedNode.current.position.y - (e.clientY - rect.top - offset.current.y) / scale.current })
                        draw();
                        return;
                    case ClickType.Connector:
                        let targetConnector = clickResponse.clickedUnit as Connector;
                        setSelectedNodeUnit(targetConnector);
                        if (!isDrawingArrow && !targetConnector.isInput) {
                            if (selectedNode.current) selectedNode.current.isSelected = false;
                            if (selectedNode.current instanceof Connector) selectedNode.current.arrowIsSelected = false;
                            selectedNode.current = clickResponse.clickedUnit;
                            setIsDrawingArrow(true);
                        }
                        else if (isDrawingArrow && selectedNode.current) {
                            let sourceConnector = selectedNode.current as Connector;
                            if (targetConnector.checkCanBeConnected(sourceConnector)) {
                                if (sourceConnector.targetNode) sourceConnector.targetNode.sourceNode = null;
                                sourceConnector.targetNode = targetConnector;
                                targetConnector.sourceNode = sourceConnector;
                            }
                            setIsDrawingArrow(false);
                            if (selectedNode.current) selectedNode.current.isSelected = false;
                            selectedNode.current = null;
                        }
                        draw();
                        return;
                    case ClickType.Arrow:
                        let connector = clickResponse.clickedUnit as Connector;
                        setSelectedNodeUnit(connector);
                        if (selectedNode.current) selectedNode.current.isSelected = false;
                        if (selectedNode.current instanceof Connector) selectedNode.current.arrowIsSelected = false;
                        connector.arrowIsSelected = true;
                        setIsDrawingArrow(false);
                        selectedNode.current = connector;
                        draw();
                        return;

                }
            };

            if (selectedNode.current) {
                selectedNode.current.isSelected = false;
                if (selectedNode.current instanceof Connector) selectedNode.current.arrowIsSelected = false;
                selectedNode.current = null;
                setSelectedNodeUnit(null);
            }

            draw();
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

        if (newSelectedNode.current) {
            newSelectedNode.current.position = { x: (e.clientX - rect.left - offset.current.x) / scale.current, y: (e.clientY - rect.top - offset.current.y) / scale.current };
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
        <>
            <canvas
                ref={canvasRef}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className={classes.Canvas}
                onMouseLeave={handleMouseLeave}
                style={{ left: canvasRef.current?.clientLeft }}
            />
            <div className={classes.CoordPanel} style={{ left: panelLeftOffset + 20 }}>
                <div className={classes.Coords}>
                    <div>
                        x: {((mousePosition.x - offset.current.x) / scale.current).toFixed(0)}
                    </div>
                    <div>
                        y: {((mousePosition.y - offset.current.y) / scale.current).toFixed(0)}
                    </div>
                </div>
                <TipContainer tip="Сбросить камеру" tipPadding={20} tipPosition={TipPosition.Top}>
                    <RiFocus3Line className={classes.Icon} onClick={() => {
                        offset.current = { x: 0, y: 0 };
                        scale.current = 1;
                        setOldScale(1);
                        setMousePosition({ x: 0, y: 0 });
                        draw();
                    }} />
                </TipContainer>
            </div>
            <div className={classes.InstrumentPanel} style={{ left: panelLeftOffset + 20 }}>
                <TipContainer
                    tip="Элементы алгебры" tipPadding={20} tipPosition={TipPosition.Right}>
                    <BiMath className={`${classes.Icon} ${algebraMenuIsShown ? classes.ActiveIcon : ""}`} onClick={() => {
                        if (algebraMenuIsShown)
                            setAlgebraMenuIsShown(false);
                        else setAlgebraMenuIsShown(true);
                        setLogicMenuIsShown(false);
                        setCompareMenuIsShown(false);
                    }} />
                </TipContainer>
                <TipContainer tip="Элементы логики" tipPadding={20} tipPosition={TipPosition.Right}>
                    <LuBinary className={`${classes.Icon} ${logicMenuIsShown ? classes.ActiveIcon : ""}`} onClick={() => {
                        setAlgebraMenuIsShown(false);
                        setCompareMenuIsShown(false);
                        if (logicMenuIsShown)
                            setLogicMenuIsShown(false);
                        else setLogicMenuIsShown(true);
                    }} />
                </TipContainer>
                <TipContainer tip="Элементы сравнения" tipPadding={20} tipPosition={TipPosition.Right}>
                    <MdOutlineExpandMore className={`${classes.Icon} ${compareMenuIsShown ? classes.ActiveIcon : ""}`} onClick={() => {
                        setAlgebraMenuIsShown(false);
                        setLogicMenuIsShown(false);
                        if (compareMenuIsShown)
                            setCompareMenuIsShown(false);
                        else setCompareMenuIsShown(true);
                    }} />
                </TipContainer>
                <TipContainer tip="Константа" tipPadding={20} tipPosition={TipPosition.Right}>
                    <TbCircleLetterC className={`${classes.Icon} ${newSelectedNodeName == "constant" ? classes.ActiveIcon : ""}`} onClick={() => {
                        if (newSelectedNodeName != "constant") {
                            setNewSelectedNodeName("constant");
                            newSelectedNode.current = new Constant({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                            generateNewSketchNode.current = (position: Position) => new Constant(position);
                        }
                        else {
                            setNewSelectedNodeName("");
                            newSelectedNode.current = null;
                            draw();
                        }
                        setAlgebraMenuIsShown(false);
                        setLogicMenuIsShown(false);
                        setCompareMenuIsShown(false);
                    }} />
                </TipContainer>
                <TipContainer tip="Повторитель" tipPadding={20} tipPosition={TipPosition.Right}>
                    <TiArrowShuffle className={`${classes.Icon} ${newSelectedNodeName == "repeater" ? classes.ActiveIcon : ""}`} onClick={() => {
                        if (newSelectedNodeName != "repeater") {
                            setNewSelectedNodeName("repeater");
                            newSelectedNode.current = new Repeater({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                            generateNewSketchNode.current = (position: Position) => new Repeater(position);
                        }
                        else {
                            setNewSelectedNodeName("");
                            newSelectedNode.current = null;
                            draw();
                        }
                        setAlgebraMenuIsShown(false);
                        setLogicMenuIsShown(false);
                        setCompareMenuIsShown(false);
                    }} />
                </TipContainer>
                <TipContainer tip="Команда" tipPadding={20} tipPosition={TipPosition.Right}>
                    <MdInput className={`${classes.Icon} ${newSelectedNodeName == "new-command" ? classes.ActiveIcon : ""}`} onClick={() => {
                        if (newSelectedNodeName != "new-command") {
                            setNewSelectedNodeName("new-command");
                            newSelectedNode.current = new Command({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                            generateNewSketchNode.current = (position: Position) => new Command(position);
                        }
                        else {
                            setNewSelectedNodeName("");
                            newSelectedNode.current = null;
                            draw();
                        }
                        setAlgebraMenuIsShown(false);
                        setLogicMenuIsShown(false);
                        setCompareMenuIsShown(false);
                    }} />
                </TipContainer>
                <TipContainer tip="Запрос данных" tipPadding={20} tipPosition={TipPosition.Right}>
                    <MdOutput className={`${classes.Icon} ${newSelectedNodeName == "data-request" ? classes.ActiveIcon : ""}`} onClick={() => {
                        if (newSelectedNodeName != "data-request") {
                            setNewSelectedNodeName("data-request");
                            newSelectedNode.current = new DataRequest({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                            generateNewSketchNode.current = (position: Position) => new DataRequest(position);
                        }
                        else {
                            setNewSelectedNodeName("");
                            newSelectedNode.current = null;
                            draw();
                        }
                        setAlgebraMenuIsShown(false);
                        setLogicMenuIsShown(false);
                        setCompareMenuIsShown(false);
                    }} />
                </TipContainer>
            </div>
            <div className={`${classes.InstrumentPanel} ${classes.AlgebraNodesPanel}`} style={{ left: panelLeftOffset + 75, display: algebraMenuIsShown ? "flex" : "none" }}>
                <TipContainer tip="Сложение" tipPadding={20} tipPosition={TipPosition.Right}>
                    <HiOutlinePlusSmall
                        className={`${classes.InstrumentElement} ${classes.Icon} ${newSelectedNodeName == "algebra-plus" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "algebra-plus") {
                                setNewSelectedNodeName("algebra-plus");
                                newSelectedNode.current = new SumNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new SumNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    />
                </TipContainer>
                <TipContainer tip="Вычитание" tipPadding={20} tipPosition={TipPosition.Right}>
                    <FiMinus
                        className={`${classes.InstrumentElement} ${classes.Icon} ${newSelectedNodeName == "algebra-minus" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "algebra-minus") {
                                setNewSelectedNodeName("algebra-minus");
                                newSelectedNode.current = new DifferenceNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new DifferenceNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    />
                </TipContainer>
                <TipContainer tip="Изменение знака" tipPadding={20} tipPosition={TipPosition.Right}>
                    <BsPlusSlashMinus
                        className={`${classes.InstrumentElement} ${classes.Icon} ${newSelectedNodeName == "algebra-unary-minus" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "algebra-unary-minus") {
                                setNewSelectedNodeName("algebra-unary-minus");
                                newSelectedNode.current = new UnaryMinusNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new UnaryMinusNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    />
                </TipContainer>
                <TipContainer tip="Умножение" tipPadding={20} tipPosition={TipPosition.Right}>
                    <BsX
                        className={`${classes.Icon} ${newSelectedNodeName == "algebra-multiplication" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "algebra-multiplication") {
                                setNewSelectedNodeName("algebra-multiplication");
                                newSelectedNode.current = new MultiplicationNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new MultiplicationNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    />
                </TipContainer>
                <TipContainer tip="Деление" tipPadding={20} tipPosition={TipPosition.Right}>
                    <RiDivideFill
                        className={`${classes.Icon} ${newSelectedNodeName == "algebra-divide" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "algebra-divide") {
                                setNewSelectedNodeName("algebra-divide");
                                newSelectedNode.current = new DivisionNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new DivisionNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    />
                </TipContainer>
                <TipContainer tip="Деление по модулю" tipPadding={20} tipPosition={TipPosition.Right}>
                    <LuPercent
                        className={`${classes.Icon} ${newSelectedNodeName == "algebra-module-divide" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "algebra-module-divide") {
                                setNewSelectedNodeName("algebra-module-divide");
                                newSelectedNode.current = new ModuleDivisionNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new ModuleDivisionNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    />
                </TipContainer>
            </div>
            <div className={`${classes.InstrumentPanel} ${classes.LogicNodesPanel}`} style={{ left: panelLeftOffset + 75, display: logicMenuIsShown ? "block" : "none" }}>
                <TipContainer tip="Отрицание" tipPadding={20} tipPosition={TipPosition.Right}>
                    <div
                        className={`${classes.Icon} ${classes.PanelElement} ${newSelectedNodeName == "logic-not" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "logic-not") {
                                setNewSelectedNodeName("logic-not");
                                newSelectedNode.current = new NotNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new NotNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    >
                        <div>
                            NOT
                        </div>
                    </div>
                </TipContainer>
                <TipContainer tip="Конъюнкция" tipPadding={20} tipPosition={TipPosition.Right}>
                    <div
                        className={`${classes.Icon} ${classes.PanelElement} ${newSelectedNodeName == "logic-and" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "logic-and") {
                                setNewSelectedNodeName("logic-and");
                                newSelectedNode.current = new AndNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new AndNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    >
                        <div>
                            AND
                        </div>
                    </div>
                </TipContainer>
                <TipContainer tip="Дизъюнкция" tipPadding={20} tipPosition={TipPosition.Right}>
                    <div
                        className={`${classes.Icon} ${classes.PanelElement} ${newSelectedNodeName == "logic-or" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "logic-or") {
                                setNewSelectedNodeName("logic-or");
                                newSelectedNode.current = new OrNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new OrNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    >
                        <div>
                            OR
                        </div>
                    </div>
                </TipContainer>
                <TipContainer tip="Штрих Шеффера" tipPadding={20} tipPosition={TipPosition.Right}>
                    <div
                        className={`${classes.Icon} ${classes.PanelElement} ${newSelectedNodeName == "logic-or-not" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "logic-or-not") {
                                setNewSelectedNodeName("logic-or-not");
                                newSelectedNode.current = new NorNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new NorNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    >
                        <div>
                            NOR
                        </div>
                    </div>
                </TipContainer>
                <TipContainer tip="Стрелка Пирса" tipPadding={20} tipPosition={TipPosition.Right}>
                    <div
                        className={`${classes.Icon} ${classes.PanelElement} ${newSelectedNodeName == "logic-and-not" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "logic-and-not") {
                                setNewSelectedNodeName("logic-and-not");
                                newSelectedNode.current = new NandNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new NandNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    >
                        <div>
                            NAND
                        </div>
                    </div>
                </TipContainer>
                <TipContainer tip="Исключающее или" tipPadding={20} tipPosition={TipPosition.Right}>
                    <div
                        className={`${classes.Icon} ${classes.PanelElement} ${newSelectedNodeName == "logic-xor" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "logic-xor") {
                                setNewSelectedNodeName("logic-xor");
                                newSelectedNode.current = new XorNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new XorNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    >
                        <div>
                            XOR
                        </div>
                    </div>
                </TipContainer>
                <TipContainer tip="Импликация" tipPadding={20} tipPosition={TipPosition.Right}>
                    <div
                        className={`${classes.Icon} ${classes.PanelElement} ${newSelectedNodeName == "logic-implication" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "logic-implication") {
                                setNewSelectedNodeName("logic-implication");
                                newSelectedNode.current = new ImplNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new ImplNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    >
                        <div>
                            IMPL
                        </div>
                    </div>
                </TipContainer>
                <TipContainer tip="Эквивалентность" tipPadding={20} tipPosition={TipPosition.Right}>
                    <div
                        className={`${classes.Icon} ${classes.PanelElement} ${newSelectedNodeName == "logic-equivalence" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "logic-equivalence") {
                                setNewSelectedNodeName("logic-equivalence");
                                newSelectedNode.current = new EqNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new EqNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    >
                        <div>
                            EQ
                        </div>
                    </div>
                </TipContainer>
            </div>
            <div className={`${classes.InstrumentPanel} ${classes.CompareNodesPanel}`} style={{ left: panelLeftOffset + 75, display: compareMenuIsShown ? "flex" : "none" }}>
                <TipContainer tip="Равно" tipPadding={20} tipPosition={TipPosition.Right}>
                    <div
                        className={`${classes.Icon} ${classes.PanelElement} ${newSelectedNodeName == "compare-eq" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "compare-eq") {
                                setNewSelectedNodeName("compare-eq");
                                newSelectedNode.current = new CompareEqNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new CompareEqNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    >
                        <div>
                            ==
                        </div>
                    </div>
                </TipContainer>
                <TipContainer tip="Не равно" tipPadding={20} tipPosition={TipPosition.Right}>
                    <div
                        className={`${classes.Icon} ${classes.PanelElement} ${newSelectedNodeName == "compare-not-eq" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "compare-not-eq") {
                                setNewSelectedNodeName("compare-not-eq");
                                newSelectedNode.current = new CompareNotEqNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new CompareNotEqNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    >
                        <div>
                            !=
                        </div>
                    </div>
                </TipContainer>
                <TipContainer tip="Строго больше" tipPadding={20} tipPosition={TipPosition.Right}>
                    <div
                        className={`${classes.Icon} ${classes.PanelElement} ${newSelectedNodeName == "compare-more" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "compare-more") {
                                setNewSelectedNodeName("compare-more");
                                newSelectedNode.current = new MoreNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new MoreNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    >
                        <div>
                            {'>'}
                        </div>
                    </div>
                </TipContainer>
                <TipContainer tip="Больше или равно" tipPadding={20} tipPosition={TipPosition.Right}>
                    <div
                        className={`${classes.Icon} ${classes.PanelElement} ${newSelectedNodeName == "compare-more-eq" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "compare-more-eq") {
                                setNewSelectedNodeName("compare-more-eq");
                                newSelectedNode.current = new MoreEqNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new MoreEqNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    >
                        <div>
                            {'>='}
                        </div>
                    </div>
                </TipContainer>
                <TipContainer tip="Строго меньше" tipPadding={20} tipPosition={TipPosition.Right}>
                    <div
                        className={`${classes.Icon} ${classes.PanelElement} ${newSelectedNodeName == "compare-less" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "compare-less") {
                                setNewSelectedNodeName("compare-less");
                                newSelectedNode.current = new LessNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new LessNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    >
                        <div>
                            {'<'}
                        </div>
                    </div>
                </TipContainer>
                <TipContainer tip="Меньше или равно" tipPadding={20} tipPosition={TipPosition.Right}>
                    <div
                        className={`${classes.Icon} ${classes.PanelElement} ${newSelectedNodeName == "compare-less-eq" ? classes.ActiveIcon : ""}`}
                        onClick={() => {
                            if (newSelectedNodeName != "compare-less-eq") {
                                setNewSelectedNodeName("compare-less-eq");
                                newSelectedNode.current = new LessEqNode({ x: (mousePosition.x - offset.current.x) / scale.current, y: (mousePosition.y - offset.current.y) / scale.current });
                                generateNewSketchNode.current = (position: Position) => new LessEqNode(position);
                            }
                            else {
                                setNewSelectedNodeName("");
                                newSelectedNode.current = null;
                                draw();
                            }
                        }}
                    >
                        <div>
                            {'<='}
                        </div>
                    </div>
                </TipContainer>
            </div>
        </>
    )
}