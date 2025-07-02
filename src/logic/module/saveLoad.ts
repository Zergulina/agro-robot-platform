import { DifferenceNode } from "../../types/nodes/algebra/BinaryOperations/DifferenceNode";
import { DivisionNode } from "../../types/nodes/algebra/BinaryOperations/DivisionNode";
import { ModuleDivisionNode } from "../../types/nodes/algebra/BinaryOperations/ModuleDivisionNode";
import { MultiplicationNode } from "../../types/nodes/algebra/BinaryOperations/MultiplicationNode";
import { SumNode } from "../../types/nodes/algebra/BinaryOperations/SumNode";
import { UnaryMinusNode } from "../../types/nodes/algebra/UnaryOperation/UnaryMinusNode";
import { CompareEqNode } from "../../types/nodes/compare/BinaryOperations/CompareEqNode";
import { CompareNotEqNode } from "../../types/nodes/compare/BinaryOperations/CompareNotEqNode";
import { LessEqNode } from "../../types/nodes/compare/BinaryOperations/LessEqNode";
import { LessNode } from "../../types/nodes/compare/BinaryOperations/LessNode";
import { MoreEqNode } from "../../types/nodes/compare/BinaryOperations/MoreEqNode";
import { MoreNode } from "../../types/nodes/compare/BinaryOperations/MoreNode";
import { Constant } from "../../types/nodes/Constant";
import { Command } from "../../types/nodes/input/Command";
import { EqNode } from "../../types/nodes/logic/BinaryNodes/EqNode";
import { ImplNode } from "../../types/nodes/logic/BinaryNodes/ImplNode";
import { XorNode } from "../../types/nodes/logic/BinaryNodes/XorNode";
import { AndNode } from "../../types/nodes/logic/MultiConnectionOperations/AndNode";
import { NandNode } from "../../types/nodes/logic/MultiConnectionOperations/Nand";
import { NorNode } from "../../types/nodes/logic/MultiConnectionOperations/NorNode";
import { OrNode } from "../../types/nodes/logic/MultiConnectionOperations/OrNode";
import { NotNode } from "../../types/nodes/logic/UnaryOperations/NotNode";
import { MicroController } from "../../types/nodes/MicroController";
import { DataRequest } from "../../types/nodes/output/DataRequest";
import { Connector } from "../../types/nodes/primitives/Connector";
import { DrawUnit } from "../../types/nodes/primitives/DrawUnit";
import { Repeater } from "../../types/nodes/Repeater";

export const getSaveModuleData = (nodes: DrawUnit[]): string => {
    let result = `{\n"Module":[\n`;
    for (let i = 0; i < nodes.length - 1; i++) {
        result += nodes[i].convertToSafeRecord() + ",\n";
    }
    result += nodes[nodes.length - 1].convertToSafeRecord() + "\n";

    result += `],\n"Connections":[\n`;

    let outConnectorIndexDict = new Map<Connector, number>();
    let inConnectorIndexDict = new Map<Connector, number>();

    let counter = 0;
    for (let outConnection of nodes.map(node => node.OutConnections).flat()) {
        outConnectorIndexDict.set(outConnection, counter++);
    }

    counter = 0;
    for (let inConnection of nodes.map(node => node.InConnections).flat()) {
        inConnectorIndexDict.set(inConnection, counter++);
    }

    let flag = false;

    for (let i = 0; i < nodes.length - 1; i++) {
        let outConnections = nodes[i].OutConnections;
        for (let j = 0; j < outConnections.length; j++) {
            flag = true;
            if (outConnections[j].targetNode) result += `\"${outConnectorIndexDict.get(outConnections[j])} ${inConnectorIndexDict.get(outConnections[j].targetNode!)}\",\n`;
        }
    }


    let outConnections = nodes[nodes.length - 1].OutConnections.filter(conn => conn.targetNode);
    for (let j = 0; j < outConnections.length - 1; j++) {
        result += `\"${outConnectorIndexDict.get(outConnections[j])} ${inConnectorIndexDict.get(outConnections[j].targetNode!)}\",\n`;
    }

    if (outConnections.length > 0) result += `\"${outConnectorIndexDict.get(outConnections[outConnections.length - 1])} ${inConnectorIndexDict.get(outConnections[outConnections.length - 1].targetNode!)}\"\n`;
    else if (flag) {
        const lastCommaIndex = result.lastIndexOf(",");
        if (lastCommaIndex !== -1) {
            result = result.slice(0, lastCommaIndex) + result.slice(lastCommaIndex + 1);
        }
    }

    return result + "\n]\n}";
}

export const loadModuleData = (text: string): DrawUnit[] => {
    let result: DrawUnit[] = [];

    try {
        const jsonData = JSON.parse(text);
        for (let unit of jsonData.Module) {
            switch (unit.nodeType) {
                case "DifferenceNode":
                    result.push(new DifferenceNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "DivisionNode":
                    result.push(new DivisionNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "ModuleDivisionNode":
                    result.push(new ModuleDivisionNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "MultiplicationNode":
                    result.push(new MultiplicationNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "SumNode":
                    result.push(new SumNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "UnaryMinusNode":
                    result.push(new UnaryMinusNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "CompareEqNode":
                    result.push(new CompareEqNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "CompareNotEqNode":
                    result.push(new CompareNotEqNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "LessEqNode":
                    result.push(new LessEqNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "LessNode":
                    result.push(new LessNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "MoreEqNode":
                    result.push(new MoreEqNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "MoreNode":
                    result.push(new MoreNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "Command":
                    let command = new Command({ x: unit.positionX, y: unit.positionY });
                    command.commandName = unit.commandName;
                    command.programCommandName = unit.programCommandName;
                    for (let i = 0; i < unit.commandArgs.length; i++) {
                        command.addCommandArg();
                        command.updateCommandArg(i, unit.commandArgs[i]);
                    }
                    result.push(command);
                    break;
                case "EqNode":
                    result.push(new EqNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "ImplNode":
                    result.push(new ImplNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "XorNode":
                    result.push(new XorNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "AndNode":
                    let andNode = new AndNode({ x: unit.positionX, y: unit.positionY });
                    for (let i = 2; i < unit.inConnectionsLength; i++) {
                        andNode.addInConnector();
                    }
                    result.push(andNode);
                    break;
                case "NandNode":
                    let nandNode = new NandNode({ x: unit.positionX, y: unit.positionY });
                    for (let i = 2; i < unit.inConnectionsLength; i++) {
                        nandNode.addInConnector();
                    }
                    result.push(nandNode);
                    break;
                case "NorNode":
                    let norNode = new NorNode({ x: unit.positionX, y: unit.positionY });
                    for (let i = 2; i < unit.inConnectionsLength; i++) {
                        norNode.addInConnector();
                    }
                    result.push(norNode);
                    break;
                case "OrNode":
                    let orNode = new OrNode({ x: unit.positionX, y: unit.positionY });
                    for (let i = 2; i < unit.inConnectionsLength; i++) {
                        orNode.addInConnector();
                    }
                    result.push(orNode);
                    break;
                case "NotNode":
                    result.push(new NotNode({ x: unit.positionX, y: unit.positionY }));
                    break;
                case "DataRequest":
                    let dataRequest = new DataRequest({ x: unit.positionX, y: unit.positionY });
                    dataRequest.dataRequestName = unit.dataRequestName;
                    dataRequest.programDataRequestName = unit.programDataRequestName;
                    dataRequest.updateRequestType(unit.type);
                    result.push(dataRequest);
                    break;
                case "Constant":
                    let constant = new Constant({ x: unit.positionX, y: unit.positionY });
                    constant.constant = unit.constant;
                    constant.type = unit.type;
                    result.push(constant);
                    break;
                case "MicroController":
                    let microController = new MicroController({ x: unit.positionX, y: unit.positionY });
                    microController.setSketch({
                        id: 0,
                        name: unit.sketchName,
                        code: unit.sketchCode,
                        params: unit.sketchParams,
                        procedures: unit.sketchProcedures,
                        datas: unit.sketchDatas
                    });
                    microController.sketchParamValues = unit.sketchParamValues;
                    result.push(microController);
                    break;
                case "Repeater":
                    let repeater = new Repeater({ x: unit.positionX, y: unit.positionY });
                    repeater.isInput = unit.isInput;
                    if (repeater.isInput) {
                        for (let i = 1; i < unit.inConnectionsLength; i++) {
                            repeater.addConnector();
                        }
                    }
                    else {
                        for (let i = 1; i < unit.outConnectionsLength; i++) {
                            repeater.addConnector();
                        }
                    }
                    result.push(repeater);
            }
        }

        let outConnectorList: Connector[] = [];
        let inConnectorList: Connector[] = [];

        for (let node of result) {
            for (let conn of node.OutConnections) outConnectorList.push(conn);
            for (let conn of node.InConnections) inConnectorList.push(conn);
        }

        for (let conn of jsonData.Connections) {
            let str = conn as string;
            let splited = str.split(" ");
            let outConnectorIndex = Number.parseInt(splited[0]);
            let inConnectorIndex = Number.parseInt(splited[1]);
            outConnectorList[outConnectorIndex].targetNode = inConnectorList[inConnectorIndex];
            inConnectorList[inConnectorIndex].sourceNode = outConnectorList[outConnectorIndex];
        }

    } catch (parseErr) {
        console.error('Ошибка парсинга JSON:', parseErr);
    }

    return result;
}