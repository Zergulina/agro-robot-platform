import React, { useEffect, useState } from 'react';
import classes from './SelectedUnitInterface.module.css';
import { DrawUnit } from '../../types/nodes/primitives/DrawUnit';
import { MicroController } from '../../types/nodes/MicroController';
import AccentButton from '../../ui/buttons/AccentButton/AccentButton';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useSelectedSketch } from '../../storage/SelectSketchContextProvider';
import { emit, listen } from '@tauri-apps/api/event';
import { MicroControllerSketch } from '../../types/api/sketch';
import { SumNode } from '../../types/nodes/algebra/BinaryOperations/SumNode';
import { DifferenceNode } from '../../types/nodes/algebra/BinaryOperations/DifferenceNode';
import { UnaryMinusNode } from '../../types/nodes/algebra/UnaryOperation/UnaryMinusNode';
import { MultiplicationNode } from '../../types/nodes/algebra/BinaryOperations/MultiplicationNode';
import { DivisionNode } from '../../types/nodes/algebra/BinaryOperations/DivisionNode';
import { ModuleDivisionNode } from '../../types/nodes/algebra/BinaryOperations/ModuleDivisionNode';
import { NotNode } from '../../types/nodes/logic/UnaryOperations/NotNode';
import { AndNode } from '../../types/nodes/logic/MultiConnectionOperations/AndNode';
import { OrNode } from '../../types/nodes/logic/MultiConnectionOperations/OrNode';
import { NorNode } from '../../types/nodes/logic/MultiConnectionOperations/NorNode';
import { NandNode } from '../../types/nodes/logic/MultiConnectionOperations/Nand';
import { XorNode } from '../../types/nodes/logic/BinaryNodes/XorNode';
import { ImplNode } from '../../types/nodes/logic/BinaryNodes/ImplNode';
import { EqNode } from '../../types/nodes/logic/BinaryNodes/EqNode';
import { CompareEqNode } from '../../types/nodes/compare/BinaryOperations/CompareEqNode';
import { CompareNotEqNode } from '../../types/nodes/compare/BinaryOperations/CompareNotEqNode';
import { MoreNode } from '../../types/nodes/compare/BinaryOperations/MoreNode';
import { MoreEqNode } from '../../types/nodes/compare/BinaryOperations/MoreEqNode';
import { LessNode } from '../../types/nodes/compare/BinaryOperations/LessNode';
import { LessEqNode } from '../../types/nodes/compare/BinaryOperations/LessEqNode';
import { Constant } from '../../types/nodes/Constant';
import { Repeater } from '../../types/nodes/Repeater';
import { Command, CommandArgument } from '../../types/nodes/input/Command';
import { DataRequest } from '../../types/nodes/output/DataRequest';
import SecondaryButton from '../../ui/buttons/SecondaryButton/SecondaryButton';
import { Connector } from '../../types/nodes/primitives/Connector';

type SelectedUnitInterfaceProps = {
    width: number,
    setIsDragging: (newValue: boolean) => void,
    selectedNodeUnit: DrawUnit | null
}

const SelectedUnitInterface: React.FC<SelectedUnitInterfaceProps> = ({ width, setIsDragging, selectedNodeUnit }) => {
    const [interfaceData, setInterfaceData] = useState<any>({});
    const { selectedSketch, setSelectedSketch } = useSelectedSketch();
    const [selectedSketchId, setSelectedSketchId] = useState<number | null>(null);

    useEffect(() => {
        const setupListener = async () => {
            const unlisten = await listen("mc-sketch-update", (event) => {
                setSelectedSketch(event.payload as MicroControllerSketch | null);
            })

            return () => {
                unlisten();
            }
        }
        const cleanup = setupListener();

        return () => {
            cleanup.then(un => un && un());
        };
    }, [])

    useEffect(() => {
        if (selectedNodeUnit instanceof MicroController) {
            setInterfaceData({
                sketchName: selectedNodeUnit.sketchName,
                paramShowMoreInfoFlag: Array(selectedNodeUnit.sketchParams.length).fill(false),
                paramValues: selectedNodeUnit.sketchParamValues
            });
            setSelectedSketch(null);
            setSelectedSketchId(null);
        }
        else if (selectedNodeUnit instanceof Command) {
            setInterfaceData({
                commandName: selectedNodeUnit.commandName,
                programCommandName: selectedNodeUnit.programCommandName,
                commandArgs: selectedNodeUnit.commandArgs
            });
        } else if (selectedNodeUnit instanceof DataRequest) {
            setInterfaceData({
                dataRequestName: selectedNodeUnit.dataRequestName,
                programDataRequestName: selectedNodeUnit.programDataRequestName,
                type: selectedNodeUnit.type
            });
        } else if (selectedNodeUnit instanceof Repeater) {
            setInterfaceData({
                connectorsLength: selectedNodeUnit.connectorsLength,
                isInput: selectedNodeUnit.isInput
            });
        } else if (selectedNodeUnit instanceof Constant) {
            setInterfaceData({
                constant: selectedNodeUnit.constant,
                type: selectedNodeUnit.type
            });
        } else if (selectedNodeUnit instanceof AndNode) {
            setInterfaceData({
                inConnectorsLength: selectedNodeUnit.inConnectorsLength
            });
        } else if (selectedNodeUnit instanceof NandNode) {
            setInterfaceData({
                inConnectorsLength: selectedNodeUnit.inConnectorsLength
            });
        } else if (selectedNodeUnit instanceof NorNode) {
            setInterfaceData({
                inConnectorsLength: selectedNodeUnit.inConnectorsLength
            });
        } else if (selectedNodeUnit instanceof OrNode) {
            setInterfaceData({
                inConnectorsLength: selectedNodeUnit.inConnectorsLength
            });
        }
        else {
            setInterfaceData({});
        }
    }, [selectedNodeUnit])

    if (selectedSketchId != selectedSketch?.id || null) {
        if (selectedNodeUnit instanceof MicroController && selectedSketch) {
            selectedNodeUnit.setSketch(selectedSketch);
            setInterfaceData({
                sketchName: selectedSketch.name,
                paramShowMoreInfoFlag: Array(selectedSketch.params.length).fill(false),
                paramValues: selectedNodeUnit.sketchParamValues
            });
        }
        setSelectedSketchId(selectedSketch?.id || null);
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) {
            setIsDragging(true);
        }
    }

    const renderSelectedNode = (node: DrawUnit | null) => {
        if (node instanceof MicroController) return (
            <div>
                <h3 className={classes.SelectedNodeTitle}>
                    Микроконтроллер
                </h3>
                <h4>Выбранный скетч</h4>
                <p>
                    {interfaceData.sketchName == "" ? "Отсутствует" : interfaceData.sketchName}
                </p>
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
                    {
                        <ul>
                            {
                                interfaceData.paramValues && node.sketchParams.length > 0 && interfaceData.paramShowMoreInfoFlag ?
                                    <div>
                                        {
                                            node.sketchParams.map((param, index) =>
                                                <li>
                                                    <div>
                                                        <p>{param.name}</p> <input value={interfaceData.paramValues[index]} onChange={(e) => {
                                                            let newParamValues = [...interfaceData.paramValues]
                                                            newParamValues[index] = e.target.value;
                                                            console.log(newParamValues)
                                                            setInterfaceData({ ...interfaceData, paramValues: newParamValues })
                                                            node.sketchParamValues = newParamValues;
                                                        }} />
                                                        <AccentButton onClick={() => {
                                                            let newParamShowMoreInfoFlag = [...interfaceData.paramShowMoreInfoFlag];
                                                            newParamShowMoreInfoFlag[index] = !newParamShowMoreInfoFlag[index];
                                                            setInterfaceData({ ...interfaceData, paramShowMoreInfoFlag: newParamShowMoreInfoFlag });

                                                        }}>{interfaceData.paramShowMoreInfoFlag[index] ? "Скрыть подробности" : "Подробнее"}</AccentButton>
                                                        {
                                                            interfaceData.paramShowMoreInfoFlag[index] ?
                                                                <>
                                                                    <p>Значение по умолчанию: {param.default_value == "" ? "Отсутствует" : param.default_value}</p>
                                                                    <p>Название макроса: {param.macros_name}</p>
                                                                    <p>Проверочное регулярное выражение: {param.regex == "" ? "Отсутствует" : param.regex}</p>
                                                                    {
                                                                        param.value_list.length > 0 ?
                                                                            <>
                                                                                Список возможных значений:
                                                                                <ul>
                                                                                    {
                                                                                        param.value_list.map(value => <li>{value.value}</li>)
                                                                                    }
                                                                                </ul>
                                                                            </>
                                                                            :
                                                                            <></>
                                                                    }
                                                                </>
                                                                : <></>
                                                        }
                                                    </div>
                                                </li>
                                            )
                                        }
                                    </div>
                                    :
                                    <div>
                                        Отсутствуют
                                    </div>
                            }
                        </ul>
                    }
                </div>
                <div>
                    <h4>Процедуры</h4>
                    <ul>
                        {
                            node.sketchProcedures.length > 0 ?
                                <div>
                                    {
                                        node.sketchProcedures.map(procedure =>
                                            <li>
                                                <div>
                                                    <p>Название: {procedure.name}</p>
                                                    <p>Название в коде: {procedure.procedure_name}</p>
                                                    {
                                                        procedure.args.length > 0 ?
                                                            <>
                                                                Список Агрументов:
                                                                <ul>
                                                                    {
                                                                        procedure.args.map(arg =>
                                                                            <li>
                                                                                <div>
                                                                                    <p>Название: {arg.name}</p>
                                                                                    <p>Тип данных: {arg.arg_type}</p>
                                                                                    <p>Название в коде: {arg.arg_name}</p>
                                                                                </div>
                                                                            </li>
                                                                        )
                                                                    }
                                                                </ul>
                                                            </>
                                                            :
                                                            <></>
                                                    }
                                                </div>
                                            </li>
                                        )
                                    }
                                </div>
                                :
                                <div>
                                    Отсутствуют
                                </div>
                        }
                    </ul>
                </div>
                <div>
                    <h4>Данные</h4>
                    <ul>
                        {
                            node.sketchDatas.length > 0 ?
                                <div>
                                    {
                                        node.sketchDatas.map(data =>
                                            <li>
                                                <div>
                                                    <p>Название: {data.name}</p>
                                                    <p>Тип данных: {data.data_type}</p>
                                                    <p>Название в коде: {data.data_name}</p>
                                                </div>
                                            </li>
                                        )
                                    }
                                </div>
                                :
                                <div>
                                    Отсутствуют
                                </div>
                        }
                    </ul>
                </div>
            </div>);
        else if (node instanceof SumNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Сложение</h3>
                </div>
            )
        else if (node instanceof DifferenceNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Вычитание</h3>
                </div>);
        else if (node instanceof UnaryMinusNode) return (
            <div>
                <h3 className={classes.SelectedNodeTitle}>Изменение знака</h3>
            </div>);
        else if (node instanceof MultiplicationNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Умножение</h3>
                </div>);
        else if (node instanceof DivisionNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Деление</h3>
                </div>);
        else if (node instanceof ModuleDivisionNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Деление по модулю</h3>
                </div>);
        else if (node instanceof NotNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Логическое НЕ</h3>
                </div>);
        else if (node instanceof AndNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Логическое И</h3>
                    <p>Входы: {interfaceData.inConnectorsLength}</p>
                    <div className={classes.ButtonsPanel}>
                        <AccentButton onClick={() => {
                            node.addInConnector();
                            setInterfaceData({ ...interfaceData, inConnectorsLength: node.inConnectorsLength })
                            emit("canvas-draw");
                        }}>Добавить</AccentButton>
                        <p> </p>
                        <SecondaryButton onClick={() => {
                            node.removeInConnector();
                            setInterfaceData({ ...interfaceData, inConnectorsLength: node.inConnectorsLength })
                            emit("canvas-draw");
                        }}>Удалить</SecondaryButton>
                    </div>
                </div>);
        else if (node instanceof OrNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Логическое ИЛИ</h3>
                    <p>Входы: {interfaceData.inConnectorsLength}</p>
                    <div className={classes.ButtonsPanel}>
                        <AccentButton onClick={() => {
                            node.addInConnector();
                            setInterfaceData({ ...interfaceData, inConnectorsLength: node.inConnectorsLength })
                            emit("canvas-draw");
                        }}>Добавить</AccentButton>
                        <p> </p>
                        <SecondaryButton onClick={() => {
                            node.removeInConnector();
                            setInterfaceData({ ...interfaceData, inConnectorsLength: node.inConnectorsLength })
                            emit("canvas-draw");
                        }}>Удалить</SecondaryButton>
                    </div>
                </div>
            );
        else if (node instanceof NorNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Логическое НЕ ИЛИ</h3>
                    <p>Входы: {interfaceData.inConnectorsLength}</p>
                    <div className={classes.ButtonsPanel}>
                        <AccentButton onClick={() => {
                            node.addInConnector();
                            setInterfaceData({ ...interfaceData, inConnectorsLength: node.inConnectorsLength })
                            emit("canvas-draw");
                        }}>Добавить</AccentButton>
                        <p> </p>
                        <SecondaryButton onClick={() => {
                            node.removeInConnector();
                            setInterfaceData({ ...interfaceData, inConnectorsLength: node.inConnectorsLength })
                            emit("canvas-draw");
                        }}>Удалить</SecondaryButton>
                    </div>
                </div>
            );
        else if (node instanceof NandNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Логическое НЕ ИЛИ</h3>
                    <p>Входы: {interfaceData.inConnectorsLength}</p>
                    <div className={classes.ButtonsPanel}>
                        <AccentButton onClick={() => {
                            node.addInConnector();
                            setInterfaceData({ ...interfaceData, inConnectorsLength: node.inConnectorsLength })
                            emit("canvas-draw");
                        }}>Добавить</AccentButton>
                        <p> </p>
                        <SecondaryButton onClick={() => {
                            node.removeInConnector();
                            setInterfaceData({ ...interfaceData, inConnectorsLength: node.inConnectorsLength })
                            emit("canvas-draw");
                        }}>Удалить</SecondaryButton>
                    </div>
                </div>
            );
        else if (node instanceof XorNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Логическое исключающее ИЛИ</h3>
                </div>
            );
        else if (node instanceof ImplNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Логическая импликация</h3>
                </div>
            );
        else if (node instanceof EqNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Логическая эквивалентность</h3>
                </div>
            );
        else if (node instanceof CompareEqNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Равно</h3>
                </div>
            );
        else if (node instanceof CompareNotEqNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Не равно</h3>
                </div>
            );
        else if (node instanceof MoreNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Строго больше</h3>
                </div>
            );
        else if (node instanceof MoreEqNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Больше или равно</h3>
                </div>
            );
        else if (node instanceof LessNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Строго меньше</h3>
                </div>
            );
        else if (node instanceof LessEqNode)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Меньше или равно</h3>
                </div>
            );
        else if (node instanceof Constant)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Константа</h3>
                    {
                        interfaceData.constant != undefined ?
                            <>
                                <p>Значение</p>
                                <input value={interfaceData.constant} onChange={(e) => {
                                    if (e.target.value.length <= 15) {
                                        node.constant = Number.parseFloat(e.target.value);
                                        setInterfaceData({ ...interfaceData, constant: e.target.value });
                                        emit("canvas-draw");
                                    }
                                }} />
                            </>
                            : <></>
                    }
                    <div>
                        {
                            interfaceData.type ?
                                <>
                                    <p>Тип данных</p>
                                    <select value={interfaceData.type} onChange={(e) => {
                                        setInterfaceData({ ...interfaceData, type: e.target.value })
                                        node.updateConstantType(e.target.value);
                                    }}>
                                        <option value={"int"}>int</option>
                                        <option value={"float"}>float</option>
                                        <option value={"bool"}>bool</option>
                                    </select>
                                </>
                                : <></>
                        }
                    </div>
                </div>
            );
        else if (node instanceof Repeater)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Повторитель</h3>
                    <p>{interfaceData.isInput ? "Входы" : "Выходы"}: {interfaceData.connectorsLength}</p>
                    <div className={classes.ButtonsPanel}>
                        <AccentButton onClick={() => {
                            node.addConnector();
                            setInterfaceData({ ...interfaceData, connectorsLength: node.connectorsLength })
                            emit("canvas-draw");
                        }}>Добавить</AccentButton>
                        <p> </p>
                        <SecondaryButton onClick={() => {
                            node.removeConnector();
                            setInterfaceData({ ...interfaceData, connectorsLength: node.connectorsLength })
                            emit("canvas-draw");
                        }}>Удалить</SecondaryButton>
                        <p>Режим</p>
                        <AccentButton onClick={() => {
                            setInterfaceData({ ...interfaceData, isInput: !node.isInput })
                            node.isInput = !node.isInput;
                            emit("canvas-draw");
                        }}>{interfaceData.isInput ? "Входы" : "Выходы"}</AccentButton>
                    </div>
                </div>
            );
        else if (node instanceof Command)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Команда</h3>
                    <div>
                        {
                            interfaceData.commandName != undefined ?
                                <>
                                    <p>Название команды</p>
                                    <input value={interfaceData.commandName} onChange={(e) => {
                                        if (e.target.value.length <= 15) {
                                            node.commandName = e.target.value;
                                            setInterfaceData({ ...interfaceData, commandName: e.target.value });
                                            emit("canvas-draw");
                                        }
                                    }} />
                                </>
                                : <></>
                        }
                    </div>
                    <div>
                        {
                            interfaceData.programCommandName != undefined ?
                                <>
                                    <p>Название команды в коде</p>
                                    <input value={interfaceData.programCommandName} onChange={(e) => {
                                        node.programCommandName = e.target.value;
                                        setInterfaceData({ ...interfaceData, programCommandName: e.target.value });
                                    }} />
                                </>
                                : <></>
                        }
                    </div>
                    {
                        interfaceData.commandArgs ? <>
                            <h4>Аргументы</h4>
                            <ol>
                                {
                                    interfaceData.commandArgs.length ?
                                        interfaceData.commandArgs.map((arg: CommandArgument, index: number) =>
                                            <div>
                                                <li>
                                                    <div>
                                                        <input value={arg.name} onChange={(e) => {
                                                            let commandArgs = [...interfaceData.commandArgs];
                                                            commandArgs[index].name = e.target.value;
                                                            setInterfaceData({ ...interfaceData, commandArgs: commandArgs })
                                                            node.updateCommandArg(index, { ...commandArgs[index], name: e.target.value });
                                                            emit("canvas-draw");
                                                        }} />
                                                        <input value={arg.arg_name} onChange={(e) => {
                                                            let commandArgs = [...interfaceData.commandArgs];
                                                            commandArgs[index].arg_name = e.target.value;
                                                            setInterfaceData({ ...interfaceData, commandArgs: commandArgs })
                                                            node.updateCommandArg(index, { ...commandArgs[index], arg_name: e.target.value });
                                                        }} />
                                                        <select value={arg.type} onChange={(e) => {
                                                            let commandArgs = [...interfaceData.commandArgs];
                                                            commandArgs[index].type = e.target.value;
                                                            setInterfaceData({ ...interfaceData, commandArgs: commandArgs })
                                                            node.updateCommandArg(index, { ...commandArgs[index], type: e.target.value });
                                                        }}>
                                                            <option value={"int"}>int</option>
                                                            <option value={"float"}>float</option>
                                                            <option value={"bool"}>bool</option>
                                                        </select>
                                                    </div>
                                                </li>
                                            </div>
                                        )
                                        :
                                        <>Отсутствуют</>
                                }
                            </ol>
                            <div className={classes.ButtonsPanel}>
                                <AccentButton onClick={() => {
                                    node.addCommandArg();
                                    setInterfaceData({ ...interfaceData, commandArgs: node.commandArgs })
                                    emit("canvas-draw");
                                }}>Добавить</AccentButton>
                                <SecondaryButton onClick={() => {
                                    node.removeCommandArg();
                                    setInterfaceData({ ...interfaceData, commandArgs: node.commandArgs })
                                    emit("canvas-draw");
                                }}>Удалить</SecondaryButton>
                            </div>
                        </>
                            :
                            <></>
                    }
                </div>
            );
        else if (node instanceof DataRequest)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Запрос данных</h3>
                    <div>
                        {
                            interfaceData.dataRequestName != undefined ?
                                <>
                                    <p>Название запроса</p>
                                    <input value={interfaceData.dataRequestName} onChange={(e) => {
                                        if (e.target.value.length <= 15) {
                                            node.dataRequestName = e.target.value;
                                            setInterfaceData({ ...interfaceData, dataRequestName: e.target.value });
                                            emit("canvas-draw");
                                        }
                                    }} />
                                </>
                                : <></>
                        }
                    </div>
                    <div>
                        {
                            interfaceData.programDataRequestName != undefined ?
                                <>
                                    <p>Название запроса в коде</p>
                                    <input value={interfaceData.programDataRequestName} onChange={(e) => {
                                        node.programDataRequestName = e.target.value;
                                        setInterfaceData({ ...interfaceData, programDataRequestName: e.target.value });
                                    }} />
                                </>
                                : <></>
                        }
                    </div>
                    <div>
                        {
                            interfaceData.type ?
                                <>
                                    <p>Тип данных</p>
                                    <select value={interfaceData.type} onChange={(e) => {
                                        setInterfaceData({ ...interfaceData, type: e.target.value })
                                        node.updateRequestType(e.target.value);
                                    }}>
                                        <option value={"int"}>int</option>
                                        <option value={"float"}>float</option>
                                        <option value={"bool"}>bool</option>
                                    </select>
                                </>
                                : <></>
                        }
                    </div>
                </div>
            );
        else if (node instanceof Connector)
            return (
                <div>
                    <h3 className={classes.SelectedNodeTitle}>Соединение</h3>
                    {
                        !node.isInput ?
                            <SecondaryButton onClick={() => {
                                if (node.targetNode) {
                                    node.targetNode.sourceNode = null;
                                    node.targetNode = null;
                                    emit("canvas-draw");
                                }
                            }}>Удалить соединение</SecondaryButton>
                            :
                            <></>
                    }
                </div>
            )
        else
            return (
                <></>
            );
    }


    return (
        <div className={classes.SelectedUnitInterface} style={{ width: width }}>
            <div className={classes.DraggableArea} onMouseDown={handleMouseDown} />
            <div className={classes.SelectedUnitInterfaceContainer}>
                <div>
                    {renderSelectedNode(selectedNodeUnit)}
                </div>
                {
                    selectedNodeUnit && !(selectedNodeUnit instanceof Connector) && !(selectedNodeUnit instanceof MicroController) ?
                        <div className={classes.BottomButton}>
                            <SecondaryButton onClick={() => emit("delete-node", selectedNodeUnit.uuid)}>Удалить элемент</SecondaryButton>
                        </div>
                        :
                        <></>
                }
            </div>
        </div>
    );
};

export default SelectedUnitInterface;