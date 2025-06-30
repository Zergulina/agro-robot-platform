import { SketchProcedure } from "../../types/api/sketch";
import { Constant } from "../../types/nodes/Constant";
import { Command } from "../../types/nodes/input/Command";
import { MicroController } from "../../types/nodes/MicroController";
import { Connector } from "../../types/nodes/primitives/Connector";
import { DrawUnit } from "../../types/nodes/primitives/DrawUnit";
import { Repeater } from "../../types/nodes/Repeater";

type ConnRecord = {
    conn: Connector;
    value: string;
}

export const compile = (nodes: DrawUnit[]): string => {
    var result = "";

    let startNodes = nodes.filter(node => node instanceof Command || node instanceof Constant);

    let counter = 0;

    let connQueue: ConnRecord[] = [];
    let waitingDict = new Map<DrawUnit, string[][]>();
    let waitingProcedureDict = new Map<SketchProcedure, string[][]>();
    let offsetDict = new Map<DrawUnit, number>();
    let offsetProcedureDict = new Map<SketchProcedure, number>();

    for (let startNode of startNodes) {
        result += startNode.compileToCpp([]);
        startNode.OutConnections.forEach((conn, index) => {
            if (startNode instanceof Command) {
                connQueue.push({ conn: conn.targetNode!, value: startNode.commandArgs[index].arg_name });
            }
            else if (startNode instanceof Constant) {
                connQueue.push({ conn: conn.targetNode!, value: startNode.constant.toString() });
            }
        });
        while (connQueue.length > 0) {
            console.log(connQueue);
            let currentConn = connQueue.shift()!;
            if (currentConn.conn.ownerNode instanceof MicroController) {
                console.log("aboba");
                const microController = currentConn.conn.ownerNode;
                const connectorIndex = microController.InConnections.indexOf(currentConn.conn);
                let procedureIndex = -1;
                let argIndex = 0;
                let argCounter = 0;
                for (let i = 0; i < microController.sketchProcedures.length; i++) {
                    if (microController.sketchProcedures[i].args.length == 0) {
                        if (argCounter == connectorIndex) {
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
                console.log("procedure index", procedureIndex);
                if (currentValueList != undefined) {
                    if (currentValueList[0][argIndex] != "") {
                        currentValueList = currentValueList.concat(currentValueList);
                        for (let i = currentValueList.length / 2; i < currentValueList.length; i++) {
                            currentValueList[i][argIndex] = currentConn.value;
                        }
                        const offset = offsetProcedureDict.get(currentProcedure);
                        if (offset) {
                            waitingProcedureDict.get(currentProcedure)!.slice(offset).forEach(x => {
                                console.log(1, currentValueList)
                                result += microController.compileToCppProcedure(x, procedureIndex);
                            });
                        } else {
                            if (!currentValueList[0].find(x => x == "")) {
                                waitingProcedureDict.get(currentProcedure)!.forEach(x => {
                                    console.log(2, currentValueList)
                                    result += microController.compileToCppProcedure(x, procedureIndex);
                                });
                            }
                        }
                        offsetProcedureDict.set(currentProcedure, currentValueList.length);
                    }
                    else {
                        for (let i = 0; i < currentValueList.length; i++) {
                            currentValueList[i][argIndex] = currentConn.value;
                            console.log("argIndex:", argIndex, currentConn.value, currentValueList[i][argIndex]);
                        }
                        console.log(currentConn.value, currentValueList[0][argIndex])
                        if (!currentValueList[0].map(x => x.length > 0).every(x => x)) {
                            currentValueList.forEach(x => {
                                console.log("eee", x)
                                result += microController.compileToCppProcedure(x, procedureIndex);
                            });
                            offsetProcedureDict.set(currentProcedure, currentValueList.length);
                        }
                    }
                } else {
                    console.log("check", currentValueList)
                    const newCurrentValueList: string[][] = new Array<string[]>();
                    console.log(-2, newCurrentValueList);
                    newCurrentValueList.push([]);
                    for (let i = 0; i < currentProcedure.args.length; i++) {
                        newCurrentValueList[0].push("");
                    }
                    console.log(-1, newCurrentValueList)
                    newCurrentValueList[0][argIndex] = currentConn.value;
                    console.log(4, newCurrentValueList)
                    waitingProcedureDict.set(currentProcedure, newCurrentValueList);
                }
            }
            else if (currentConn.conn.ownerNode instanceof Repeater && !currentConn.conn.ownerNode.isInput) {
                connQueue = connQueue.concat(currentConn.conn.ownerNode.OutConnections.map(x => { return { conn: x.targetNode!, value: currentConn.value } }));
            }
            else if (currentConn.conn.ownerNode instanceof Repeater && currentConn.conn.ownerNode.isInput) {
                connQueue = connQueue.concat(currentConn.conn.ownerNode.OutConnections.map(x => { return { conn: x.targetNode!, value: currentConn.value } }));
            }
            else if (currentConn.conn.ownerNode.InConnections.length == 1) {
                result += `\n${currentConn.conn.ownerNode.compileToCpp([currentConn.value])}`
                connQueue = connQueue.concat(currentConn.conn.ownerNode.OutConnections.map(x => { return { conn: x.targetNode!, value: currentConn.value } }));
            }
            else {
                const index = currentConn.conn.ownerNode.InConnections.indexOf(currentConn.conn);
                let currentValueList = waitingDict.get(currentConn.conn.ownerNode);
                const outConnect = currentConn.conn.ownerNode.OutConnections[0];
                if (currentValueList != undefined) {
                    if (currentValueList[0][index] != "") {
                        currentValueList = currentValueList.concat(currentValueList);
                        for (let i = currentValueList.length / 2; i < currentValueList.length; i++) {
                            currentValueList[i][index] = currentConn.value;
                        }
                        const offset = offsetDict.get(currentConn.conn.ownerNode);
                        if (offset) {
                            connQueue = connQueue.concat(waitingDict.get(currentConn.conn.ownerNode)!.slice(offset).map(x => {
                                const newValue = `x_${counter++}`;
                                result += `auto ${newValue} = ${currentConn.conn.ownerNode.compileToCpp(x)};\n`
                                return { conn: outConnect.targetNode!, value: newValue }
                            }));
                        } else {
                            if (!currentValueList[0].find(x => x == "")) {
                                connQueue = connQueue.concat(waitingDict.get(currentConn.conn.ownerNode)!.map(x => {
                                    const newValue = `x_${counter++}`;
                                    result += `auto ${newValue} = ${currentConn.conn.ownerNode.compileToCpp(x)};\n`
                                    return { conn: outConnect.targetNode!, value: newValue }
                                }));
                            }
                        }
                        offsetDict.set(currentConn.conn.ownerNode, currentValueList.length);
                    }
                    else {
                        for (let i = 0; i < currentValueList.length; i++) {
                            currentValueList[i][index] = currentConn.value;
                        }
                        if (!currentValueList[0].map(x => x != "").every(x => x)) {
                            connQueue = connQueue.concat(waitingDict.get(currentConn.conn.ownerNode)!.map(x => {
                                const newValue = `x_${counter++}`;
                                result += `auto ${newValue} = ${currentConn.conn.ownerNode.compileToCpp(x)};\n`
                                return { conn: outConnect.targetNode!, value: newValue }
                            }));
                            offsetDict.set(currentConn.conn.ownerNode, currentValueList.length)
                        }
                    }
                } else {
                    const newCurrentValueList = [];
                    newCurrentValueList.push(new Array<string>(currentConn.conn.ownerNode.InConnections.length).fill(""));
                    newCurrentValueList[0][index] = currentConn.value;
                    waitingDict.set(currentConn.conn.ownerNode, newCurrentValueList);
                }
            }
        }

    }

    return result;
}

