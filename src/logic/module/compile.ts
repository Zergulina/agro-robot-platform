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
    let offsetDict = new Map<DrawUnit, number>();

    for (let startNode of startNodes) {
        result += startNode.compileToCpp([]);
        startNode.OutConnections.forEach(conn => {
            connQueue.push({ conn: conn.targetNode!, value: `x_${counter++}` });
        });
        while (connQueue.length > 0) {
            let currentConn = connQueue.shift()!;
            if (currentConn.conn.ownerNode instanceof Repeater && !currentConn.conn.ownerNode.isInput) {
                connQueue.concat(currentConn.conn.ownerNode.OutConnections.map(x => { return { conn: x.targetNode!, value: currentConn.value } }));
            }
            else if (currentConn.conn.ownerNode instanceof Repeater && currentConn.conn.ownerNode.isInput) {
                connQueue.concat(currentConn.conn.ownerNode.OutConnections.map(x => { return { conn: x.targetNode!, value: currentConn.value } }));
            }
            if (currentConn.conn.ownerNode.InConnections.length == 1) {
                result += `\n${currentConn.conn.ownerNode.compileToCpp([currentConn.value])}`
                connQueue.concat(currentConn.conn.ownerNode.OutConnections.map(x => { return { conn: x.targetNode!, value: currentConn.value } }));
            }
            else {
                const index = currentConn.conn.ownerNode.InConnections.indexOf(currentConn.conn);
                const currentValueList = waitingDict.get(currentConn.conn.ownerNode);
                if (currentValueList) {
                    if (currentValueList[0][index] != "") {
                        currentValueList.concat(currentValueList);
                        for (let i = currentValueList.length / 2; i < currentValueList.length; i++) {
                            currentValueList[i][index] = currentConn.value;
                        }
                        const offset = offsetDict.get(currentConn.conn.ownerNode);
                        if (offset) {
                            connQueue.concat(waitingDict.get(currentConn.conn.ownerNode)!.slice(offset).flat().map(x => {return {conn:  }}))
                        }
                    }
                    else {
                        for (let i = 0; i < currentValueList.length; i++) {
                            currentValueList[i][index] = currentConn.value;
                        }
                    }
                } else {
                    const newCurrentValueList = [];
                    newCurrentValueList.push(new Array<string>(currentConn.conn.ownerNode.InConnections.length).fill(""));
                    newCurrentValueList[0][index] = currentConn.value;
                }
            }
        }

    }

    return result;
}

