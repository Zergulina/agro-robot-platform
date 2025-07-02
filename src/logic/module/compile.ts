import { SketchProcedure } from "../../types/api/sketch";
import { Constant } from "../../types/nodes/Constant";
import { Command } from "../../types/nodes/input/Command";
import { MicroController } from "../../types/nodes/MicroController";
import { DataRequest } from "../../types/nodes/output/DataRequest";
import { Connector } from "../../types/nodes/primitives/Connector";
import { DrawUnit } from "../../types/nodes/primitives/DrawUnit";
import { Repeater } from "../../types/nodes/Repeater";
import { CheckIsOk } from "./checkIsOk";

type ConnRecord = {
    conn: Connector;
    value: string;
}

const generateId = (length: number = 10): string => {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
}


export const compile = (nodes: DrawUnit[]): string => {
    CheckIsOk(nodes);
    let microController = nodes.filter(node => node instanceof MicroController)[0];
    let commands = nodes.filter(node => node instanceof Command);
    let dataRequests = nodes.filter(node => node instanceof DataRequest);

    let commandIds: string[] = [];
    let dataRequestIds: string[] = [];

    for (let i = 0; i < dataRequests.length; i++) {
        dataRequestIds.push(generateId());
    }

    for (let i = 0; i < commands.length; i++) {
        commandIds.push(generateId());
    }

    let counter = 16;

    let insertText = "#define ARP_I2C_ADRESS 0\n";

    for (let i = 0; i < dataRequests.length; i++) {
        insertText += `#define ${dataRequestIds[i]} ${counter++}\n`;
    }

    insertText += "\n"

    for (let i = 0; i < commands.length; i++) {
        insertText += `#define ${commandIds[i]} ${counter++}\n`;
    }

    insertText += "\n"

    insertText += `uint8_t lastRequest = 0;\n\t${compileCommands(nodes)}\n${compileDataRequest(nodes)}\n`;

     insertText += `void handleCommand(uint8_t cmd) {\n\tswitch (cmd) {\n`

    for (let i = 0; i < commandIds.length; i++) {
        let length = 0;
        for (let j = 0; j < commands[i].commandArgs.length; j++) {
            switch (commands[i].commandArgs[j].type) {
                case "int":
                    length += 4;
                    break;
                case "float":
                    length += 4;
                    break;
                case "bool":
                    length += 1;
                    break;
                default:
                    break;
            }
        }
        insertText += `\t\tcase ${commandIds[i]}:\n\t\t\tif (Wire.available() >= ${length}) {\n`
        for (let j = 0; j < commands[i].commandArgs.length; j++) {
            switch (commands[i].commandArgs[j].type) {
                case "int":
                    insertText += `\t\t\t\tuint8_t buf${j}[4];\n\t\t\t\tWire.readBytes(buf${j}, 4);\n\t\t\t\tint val${j};\n\t\t\t\tmemcpy(&val${j}, buf${j}, 4);\n`
                    break;
                case "float":
                    insertText += `\t\t\t\tuint8_t buf${j}[4];\n\t\t\t\tWire.readBytes(buf${j}, 4);\n\t\t\t\tfloat val${j};\n\t\t\t\tmemcpy(&val${j}, buf${j}, 4);\n`
                    break;
                case "bool":
                    insertText += `\t\t\t\tbool val${j} = Wire.read();\n`;
                    break;
                default:
                    break;
            }
        }
        let valCounter = 0;
        let vals = commands[i].commandArgs.map(_ => `val${valCounter++}`);
        insertText += `\t\t\t\t${commands[i].programCommandName}(${vals.join(", ")});\n\t\t\t}\n\t\tbreak;\n`
    }

    insertText += "\t}\n}\n\n";

    insertText += `void onReceive(int howMany) {\n\tif(howMany < 1) return;\n\tlastRequest = Wire.read();\n\tif (lastRequest >= ${commandIds[0]}) {\n\t\thandleCommand(lastRequest);\n\t}\n}\n\n`

    insertText += `void onRequest() {\n\tswitch(lastRequest) {\n\n`;

    for (let i = 0; i < dataRequestIds.length; i++) {
        insertText += `\t\tcase ${dataRequestIds[i]}:\n\t\t\t${dataRequests[i].programDataRequestName}();\n\t\t\tbreak;\n`
    }
    insertText += "\t\tdefault:\n\t\t\tbreak;\n}\n"
    insertText += "\t}\n\n"

    let lines = microController.sketchCode.split('\n');
    if (!microController.sketchCode.includes(`#include "Wire.h"`)) lines.unshift(`#include "Wire.h"`);

    let indexToInsert = lines.findIndex(line => line.includes('void setup()'));

    if (indexToInsert !== -1) {
        const insertLines = insertText.split('\n');
        lines.splice(indexToInsert, 0, ...insertLines);
    }

    indexToInsert = lines.findIndex(line => line.includes('void setup()')) + 1;

    insertText = `\tWire.begin(ARP_I2C_ADRESS);\n\tWire.onReceive(onReceive);\n\tWire.onRequest(onRequest);`

    if (indexToInsert !== -1) {
        const insertLines = insertText.split('\n');
        lines.splice(indexToInsert, 0, ...insertLines);
    }

    for(let i = 0; i < lines.length; i++) {
        for (let j = 0; j < microController.sketchParams.length; j++) {
            if (lines[i].includes("#define") && lines[i].includes(microController.sketchParams[j].macros_name)) {
                lines[i] = `#define ${microController.sketchParams[j].macros_name} ${microController.sketchParamValues[j]}`
                break;
            }
        }
    }

    const updatedFileContent = lines.join('\n');

    return updatedFileContent;
}

const compileCommands = (nodes: DrawUnit[]): string => {
    var result = "";

    let startNodes = nodes.filter(node => node instanceof Command);
    let constantNodes = nodes.filter(node => node instanceof Constant);

    let counter = 0;

    for (let startNode of startNodes) {
        let connQueue: ConnRecord[] = [];
        let offsetDict = new Map<DrawUnit, number>();
        let offsetProcedureDict = new Map<SketchProcedure, number>();
        let waitingDict = new Map<DrawUnit, string[][]>();
        let waitingProcedureDict = new Map<SketchProcedure, string[][]>();

        result += startNode.compileToCpp([]);
        startNode.OutConnections.forEach((conn, index) => {
            connQueue.push({ conn: conn.targetNode!, value: startNode.commandArgs.length > 0 ? startNode.commandArgs[index].arg_name : "" });
        });
        constantNodes.map(node => node.OutConnections.forEach((conn) => {
            connQueue.push({ conn: conn.targetNode!, value: node.constant.toString() });
        }));
        while (connQueue.length > 0) {
            let currentConn = connQueue.shift()!;
            if (currentConn.conn.ownerNode! instanceof MicroController) {
                const microController = currentConn.conn.ownerNode!;
                const connectorIndex = microController.InConnections.indexOf(currentConn.conn);
                let noArgsFlag = false;
                let procedureIndex = -1;
                let argIndex = 0;
                let argCounter = 0;
                for (let i = 0; i < microController.sketchProcedures.length; i++) {
                    if (microController.sketchProcedures[i].args.length == 0) {
                        if (argCounter == connectorIndex) {
                            noArgsFlag = true;
                            procedureIndex = i;
                            argIndex = 0;
                            break;
                        }
                        argCounter++;
                        continue;
                    }
                    for (let j = 0; j < microController.sketchProcedures[i].args.length; j++) {
                        if (argCounter == connectorIndex) {
                            procedureIndex = i;
                            argIndex = j;
                            break;
                        }
                        argCounter++;
                    }
                    if (procedureIndex > -1) {
                        break;
                    }
                }
                const currentProcedure = microController.sketchProcedures[procedureIndex];
                let currentValueList = waitingProcedureDict.get(currentProcedure);
                if (noArgsFlag) {
                    result += "\t" + microController.compileToCppProcedure([], procedureIndex);
                }
                else if (currentValueList) {
                    if (currentValueList[0][argIndex] != "") {
                        currentValueList = currentValueList.concat(currentValueList);
                        for (let i = currentValueList.length / 2; i < currentValueList.length; i++) {
                            currentValueList[i][argIndex] = currentConn.value;
                        }
                        const offset = offsetProcedureDict.get(currentProcedure);
                        if (offset) {
                            waitingProcedureDict.get(currentProcedure)!.slice(offset - 1).forEach(x => {
                                result += "\t" + microController.compileToCppProcedure(x, procedureIndex);
                            });
                        } else {
                            if (currentValueList[0].every(x => x.length > 0)) {
                                waitingProcedureDict.get(currentProcedure)!.forEach(x => {
                                    result += "\t" + microController.compileToCppProcedure(x, procedureIndex);
                                });
                            }
                        }
                        offsetProcedureDict.set(currentProcedure, currentValueList.length);
                    }
                    else {
                        for (let i = 0; i < currentValueList.length; i++) {
                            currentValueList[i][argIndex] = currentConn.value;;
                        }
                        if (currentValueList[0].every(x => x.length > 0)) {
                            currentValueList.forEach(x => {
                                result += "\t" + microController.compileToCppProcedure(x, procedureIndex);
                            });
                            offsetProcedureDict.set(currentProcedure, currentValueList.length);
                        }
                    }
                } else {
                    const newCurrentValueList: string[][] = new Array<string[]>();
                    newCurrentValueList.push([]);
                    for (let i = 0; i < currentProcedure.args.length; i++) {
                        newCurrentValueList[0].push("");
                    }
                    newCurrentValueList[0][argIndex] = currentConn.value;
                    waitingProcedureDict.set(currentProcedure, newCurrentValueList);
                    if (newCurrentValueList[0].every(x => x.length > 0)) {
                        newCurrentValueList.forEach(x => {
                            result += "\t" + microController.compileToCppProcedure(x, procedureIndex);
                        });
                        offsetProcedureDict.set(currentProcedure, newCurrentValueList.length);
                    }
                }
            }
            else if (currentConn.conn.ownerNode! instanceof Repeater && !currentConn.conn.ownerNode!.isInput) {
                connQueue = connQueue.concat(currentConn.conn.ownerNode!.OutConnections.map(x => { return { conn: x.targetNode!, value: currentConn.value } }));
            }
            else if (currentConn.conn.ownerNode! instanceof Repeater && currentConn.conn.ownerNode!.isInput) {
                connQueue = connQueue.concat(currentConn.conn.ownerNode!.OutConnections.map(x => { return { conn: x.targetNode!, value: currentConn.value } }));
            }
            else if (currentConn.conn.ownerNode!.InConnections.length == 1) {
                result += `\n${currentConn.conn.ownerNode!.compileToCpp([currentConn.value])}`
                connQueue = connQueue.concat(currentConn.conn.ownerNode!.OutConnections.map(x => { return { conn: x.targetNode!, value: currentConn.value } }));
            }
            else {
                const index = currentConn.conn.ownerNode!.InConnections.indexOf(currentConn.conn);
                let currentValueList = waitingDict.get(currentConn.conn.ownerNode!);
                const outConnect = currentConn.conn.ownerNode!.OutConnections[0];
                if (currentValueList != undefined) {
                    if (currentValueList[0][index] != "") {
                        currentValueList = currentValueList.concat(currentValueList);
                        for (let i = currentValueList.length / 2; i < currentValueList.length; i++) {
                            currentValueList[i][index] = currentConn.value;
                        }
                        const offset = offsetDict.get(currentConn.conn.ownerNode!);
                        if (offset) {
                            connQueue = connQueue.concat(waitingDict.get(currentConn.conn.ownerNode!)!.slice(offset - 1).map(x => {
                                const newValue = `x_${counter++}`;
                                result += `\tauto ${newValue} = ${currentConn.conn.ownerNode!.compileToCpp(x)};\n`
                                return { conn: outConnect.targetNode!, value: newValue }
                            }));
                        } else {
                            if (currentValueList[0].every(x => x.length > 0)) {
                                connQueue = connQueue.concat(waitingDict.get(currentConn.conn.ownerNode!)!.map(x => {
                                    const newValue = `x_${counter++}`;
                                    result += `\tauto ${newValue} = ${currentConn.conn.ownerNode!.compileToCpp(x)};\n`
                                    return { conn: outConnect.targetNode!, value: newValue }
                                }));
                            }
                        }
                        offsetDict.set(currentConn.conn.ownerNode!, currentValueList.length);
                    }
                    else {
                        for (let i = 0; i < currentValueList.length; i++) {
                            currentValueList[i][index] = currentConn.value;
                        }
                        if (currentValueList[0].every(x => x.length > 0)) {
                            connQueue = connQueue.concat(waitingDict.get(currentConn.conn.ownerNode!)!.map(x => {
                                const newValue = `x_${counter++}`;
                                result += `\tauto ${newValue} = ${currentConn.conn.ownerNode!.compileToCpp(x)};\n`
                                return { conn: outConnect.targetNode!, value: newValue }
                            }));
                            offsetDict.set(currentConn.conn.ownerNode!, currentValueList.length)
                        }
                    }
                } else {
                    const newCurrentValueList = [];
                    newCurrentValueList.push(new Array<string>(currentConn.conn.ownerNode!.InConnections.length).fill(""));
                    newCurrentValueList[0][index] = currentConn.value;
                    waitingDict.set(currentConn.conn.ownerNode!, newCurrentValueList);
                    if (newCurrentValueList[0].every(x => x.length > 0)) {
                        connQueue = connQueue.concat(waitingDict.get(currentConn.conn.ownerNode!)!.map(x => {
                            const newValue = `x_${counter++}`;
                            result += `\tauto ${newValue} = ${currentConn.conn.ownerNode!.compileToCpp(x)};\n`
                            return { conn: outConnect.targetNode!, value: newValue }
                        }));
                        offsetDict.set(currentConn.conn.ownerNode!, newCurrentValueList.length)
                    }
                }
            }
        }
        result += "}\n\n"
    }

    return result;
}

type Subtree = {
    connectors: Connector[];
    nodes: DrawUnit[];
}

const findDataRequestDataMcConnectors = (node: DataRequest): Subtree => {
    let result: Subtree = { connectors: [], nodes: [node] };
    let connQueue: Connector[] = [node.InConnections[0]];
    while (connQueue.length > 0) {
        let conn = connQueue.shift()!;
        if (conn.sourceNode && !result.nodes.includes(conn.sourceNode.ownerNode!)) result.nodes.push(conn.sourceNode.ownerNode!);
        if (conn.sourceNode && conn.sourceNode.ownerNode instanceof MicroController) {
            if (!result.connectors.includes(conn.sourceNode)) result.connectors.push(conn.sourceNode!);
            continue;
        }
        for (let inConn of conn.sourceNode!.ownerNode!.InConnections) {
            connQueue.push(inConn);
        }
    }

    return result;
}

const compileDataRequest = (nodes: DrawUnit[]): string => {
    var result = "";

    let constantNodes = nodes.filter(node => node instanceof Constant);
    let dataRequests = nodes.filter(node => node instanceof DataRequest);
    let microController = nodes.filter(node => node instanceof MicroController)[0];

    let counter = 0;

    for (let dataRequest of dataRequests) {
        let connQueue: ConnRecord[] = [];
        let offsetDict = new Map<DrawUnit, number>();
        let waitingDict = new Map<DrawUnit, string[][]>();


        result += `void ${dataRequest.programDataRequestName}() {`;

        let tree = findDataRequestDataMcConnectors(dataRequest);
        tree.connectors.forEach(conn => {
            const startVar = `x_${counter++}`;
            result += `\n\tauto ${startVar} = ${microController.compileToCppDataRequest(microController.OutConnections.findIndex(x => x == conn))}`
            connQueue.push({ conn: conn.targetNode!, value: startVar });
        });

        constantNodes.map(node => node.OutConnections.forEach((conn) => {
            connQueue.push({ conn: conn.targetNode!, value: node.constant.toString() });
        }));
        while (connQueue.length > 0) {
            let currentConn = connQueue.shift()!;
            if (!tree.nodes.includes(currentConn.conn.ownerNode!)) continue;
            if (currentConn.conn.ownerNode! instanceof Repeater && !currentConn.conn.ownerNode!.isInput) {
                connQueue = connQueue.concat(currentConn.conn.ownerNode!.OutConnections.map(x => { return { conn: x.targetNode!, value: currentConn.value } }));
            }
            else if (currentConn.conn.ownerNode! instanceof Repeater && currentConn.conn.ownerNode!.isInput) {
                connQueue = connQueue.concat(currentConn.conn.ownerNode!.OutConnections.map(x => { return { conn: x.targetNode!, value: currentConn.value } }));
            }
            else if (currentConn.conn.ownerNode! instanceof DataRequest) {
                result += currentConn.conn.ownerNode!.compileToCpp([currentConn.value]);
            }
            else if (currentConn.conn.ownerNode!.InConnections.length == 1) {
                const newValue = `x_${counter++}`;
                result += `\n\tauto ${newValue} = ${currentConn.conn.ownerNode!.compileToCpp([currentConn.value])};\n`
                connQueue = connQueue.concat(currentConn.conn.ownerNode!.OutConnections.map(x => { return { conn: x.targetNode!, value: currentConn.value } }));
            }
            else {
                const index = currentConn.conn.ownerNode!.InConnections.indexOf(currentConn.conn);
                let currentValueList = waitingDict.get(currentConn.conn.ownerNode!);
                const outConnect = currentConn.conn.ownerNode!.OutConnections[0];
                if (currentValueList != undefined) {
                    if (currentValueList[0][index] != "") {
                        currentValueList = currentValueList.concat(currentValueList);
                        for (let i = currentValueList.length / 2; i < currentValueList.length; i++) {
                            currentValueList[i][index] = currentConn.value;
                        }
                        const offset = offsetDict.get(currentConn.conn.ownerNode!);
                        if (offset) {
                            connQueue = connQueue.concat(waitingDict.get(currentConn.conn.ownerNode!)!.slice(offset - 1).map(x => {
                                const newValue = `x_${counter++}`;
                                result += `\tauto ${newValue} = ${currentConn.conn.ownerNode!.compileToCpp(x)};\n`
                                return { conn: outConnect.targetNode!, value: newValue }
                            }));
                        } else {
                            if (currentValueList[0].every(x => x.length > 0)) {
                                connQueue = connQueue.concat(waitingDict.get(currentConn.conn.ownerNode!)!.map(x => {
                                    const newValue = `x_${counter++}`;
                                    result += `\tauto ${newValue} = ${currentConn.conn.ownerNode!.compileToCpp(x)};\n`
                                    return { conn: outConnect.targetNode!, value: newValue }
                                }));
                            }
                        }
                        offsetDict.set(currentConn.conn.ownerNode!, currentValueList.length);
                    }
                    else {
                        for (let i = 0; i < currentValueList.length; i++) {
                            currentValueList[i][index] = currentConn.value;
                        }
                        if (currentValueList[0].every(x => x.length > 0)) {
                            connQueue = connQueue.concat(waitingDict.get(currentConn.conn.ownerNode!)!.map(x => {
                                const newValue = `x_${counter++}`;
                                result += `\tauto ${newValue} = ${currentConn.conn.ownerNode!.compileToCpp(x)};\n`
                                return { conn: outConnect.targetNode!, value: newValue }
                            }));
                            offsetDict.set(currentConn.conn.ownerNode!, currentValueList.length)
                        }
                    }
                } else {
                    const newCurrentValueList = [];
                    newCurrentValueList.push(new Array<string>(currentConn.conn.ownerNode!.InConnections.length).fill(""));
                    newCurrentValueList[0][index] = currentConn.value;
                    waitingDict.set(currentConn.conn.ownerNode!, newCurrentValueList);
                    if (newCurrentValueList[0].every(x => x.length > 0)) {
                        connQueue = connQueue.concat(waitingDict.get(currentConn.conn.ownerNode!)!.map(x => {
                            const newValue = `x_${counter++}`;
                            result += `\tauto ${newValue} = ${currentConn.conn.ownerNode!.compileToCpp(x)};\n`
                            return { conn: outConnect.targetNode!, value: newValue }
                        }));
                        offsetDict.set(currentConn.conn.ownerNode!, newCurrentValueList.length)
                    }
                }
            }
        }
        result += "}\n\n"
    }

    return result;
}