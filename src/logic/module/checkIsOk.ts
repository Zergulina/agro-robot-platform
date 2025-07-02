import { Command } from "../../types/nodes/input/Command";
import { MicroController } from "../../types/nodes/MicroController";
import { DataRequest } from "../../types/nodes/output/DataRequest";
import { Connector } from "../../types/nodes/primitives/Connector";
import { DrawUnit } from "../../types/nodes/primitives/DrawUnit";
import { Repeater } from "../../types/nodes/Repeater";

enum VertexColor {
    White,
    Grey,
    Black
}


export const CheckIsOk = (nodes: DrawUnit[]) => {

    let dict = new Map<DrawUnit, VertexColor>();

    const microController = nodes.filter(node =>
        node instanceof MicroController
    )[0];

    for (let i = 0; i < microController.sketchParams.length; i++) {
        if (microController.sketchParamValues[i].length == 0) {
            throw new Error("Ошибка в параметрах скетча");
        }
        if (microController.sketchParams[i].regex.length > 0) {
            const pattern = microController.sketchParams[i].regex.slice(1, -1);
            const regex = new RegExp(pattern);
            if (!regex.test(microController.sketchParamValues[i])) {
                throw new Error("Ошибка в параметрах скетча");
            };
        }
    }

    const commands = nodes.filter(node => node instanceof Command);

    for (let command of commands) {
        let commandArgs = command.commandArgs;
        const commandArgNames = commandArgs.map(x => x.name);
        if (new Set(commandArgNames).size !== commandArgNames.length) {
            throw new Error("Ошибка в названиях аргументов команд");
        }

        const commandArgProgramNames = commandArgs.map(x => x.arg_name);
        if (new Set(commandArgProgramNames).size !== commandArgProgramNames.length) {
            throw new Error("Ошибка в программных названиях команд");
        }

        // for (let commanArgName of commandArgNames) {
        //     if (!/[^[a-zA-Z_][a-zA-Z_0-9]*$/.test(commanArgName)) {
        //         throw new Error("Ошибка в программных названиях аргументов команд");
        //     }
        // }
    }

    const programCommandNames = commands.map(x => x.programCommandName);
    if (new Set(programCommandNames).size !== programCommandNames.length) {
        throw new Error("Ошибка в программных названиях команд");
    }

    const commandNames = commands.map(x => x.commandName);
    if (new Set(commandNames).size !== commandNames.length) {
        throw new Error("Ошибка в названиях команд");
    }

    // for (let commandName of programCommandNames) {
    //     if (!/[^[a-zA-Z_][a-zA-Z_0-9]*$/.test(commandName)) {
    //         throw new Error("Ошибка в программных названиях команд");
    //     }
    // }

    if (microController.sketchCode.length == 0) {
        throw new Error("Ошибка в коде скетча");
    }

    const dataRequests = nodes.filter(node => node instanceof DataRequest);

    const dataRequestNames = dataRequests.map(x => x.dataRequestName);
    if (new Set(dataRequestNames).size !== dataRequestNames.length) {
        throw new Error("Ошибка в названиях запросов");
    }

    const dataRequestProgramNames = dataRequests.map(x => x.programDataRequestName);
    if (new Set(dataRequestProgramNames).size !== dataRequestProgramNames.length) {
        throw new Error("Ошибка в программных названиях запросов");
    }

    // for (let dataRequestProgramName of dataRequestProgramNames) {
    //     if (!/[^[a-zA-Z_][a-zA-Z_\d]*$/.test(dataRequestProgramName)) {
    //         throw new Error("Ошибка в программных названиях запросов");
    //     }
    // }

    let cycles: DrawUnit[][] = [];

    for (let node of nodes) {
        dict.set(node, VertexColor.White);
    }

    for (let node of nodes) {
        if (dict.get(node) == VertexColor.White) {
            cycles = cycles.concat(DFS(node, null, new Array<DrawUnit>(), dict));
        }
    }

    if (cycles.length > 0) {
        throw new Error("Ошибка на циклах");
    }

    for (let node of nodes) {
        if (!(node instanceof MicroController) && node.InConnections.map(x => x.sourceNode).includes(null)) {
            throw new Error("Ошибка на входах");
        }
    }

    for (let node of nodes) {
        if (!(node instanceof MicroController) && node.OutConnections.map(x => x.targetNode).includes(null)) {
            throw new Error("Ошибка на выходах");
        }
    }

    if (!arePathsDisjointWithAllowedOverlap(nodes)) {
        throw new Error("Ошибка на пересечении");
    }

    if (!checkAreGroupsFullConnectedToCommands(microController)) {
        throw new Error("Ошибка на процедурах");
    }

    for (const command of commands) {
        const visited = new Set<DrawUnit>();
        if (!isPathValid(command, visited)) {
            throw new Error("Ошибка: команда напрямую соединена с запросом данных без микроконтроллера");
        }
    }
}

const DFS = (current: DrawUnit, parent: DrawUnit | null, path: DrawUnit[], dict: Map<DrawUnit, VertexColor>): DrawUnit[][] => {
    dict.set(current, VertexColor.Grey);
    path.push(current);

    let cycles: DrawUnit[][] = [];

    for (let neighbor of current.OutConnections.map(x => x.targetNode?.ownerNode).filter(x => x != undefined)) {
        if (dict.get(neighbor) == VertexColor.White) {
            cycles = cycles.concat(DFS(neighbor, current, path, dict));
        }
        else if (dict.get(neighbor) == VertexColor.Grey && neighbor != parent) {
            var cycle: DrawUnit[] = [];
            for (let i = path.indexOf(neighbor); i < path.length; i++) {
                cycle.push(path[i]);
            }
            cycles.push(cycle);
        }
    }

    dict.set(current, VertexColor.Black);
    path.pop();

    return cycles;
}

const arePathsDisjointWithAllowedOverlap = (allNodes: DrawUnit[]): boolean => {
    const visitedBy = new Map<DrawUnit, DrawUnit>();

    const roots = allNodes.filter(node =>
        node instanceof Command
    );

    const dfs = (current: DrawUnit, root: DrawUnit): boolean => {
        if (visitedBy.has(current)) {
            const firstRoot = visitedBy.get(current)!;

            if (current instanceof Repeater) {
                return true;
            }
            else if (current instanceof MicroController) {
                return true
            }

            return firstRoot === root;
        }

        visitedBy.set(current, root);

        for (const conn of current.OutConnections) {
            const neighbor = conn.targetNode?.ownerNode;
            if (neighbor && !dfs(neighbor, root)) {
                return false;
            }
        }

        return true;
    };

    for (const root of roots) {
        if (!dfs(root, root)) return false;
    }

    return true;
};

const getCommandsReachingConnector = (
    target: Connector
): Set<Command> => {
    const visited = new Set<DrawUnit>();
    const stack: (DrawUnit | null)[] = target.sourceNode ? [target.sourceNode.ownerNode] : [];
    const result = new Set<Command>();

    while (stack.length) {
        const node = stack.pop()!;
        if (visited.has(node)) continue;
        visited.add(node);

        if (node instanceof Command) {
            result.add(node);
        }

        for (const nextNode of node.InConnections.map(x => x.ownerNode).filter(x => x != null) ?? []) {

            if (nextNode instanceof Command) {
                result.add(nextNode);
            }

            stack.push(nextNode);
        }
    }

    return result;
}

const checkAreGroupsFullConnectedToCommands = (
    microController: MicroController
): boolean => {
    let groups: Connector[][] = [];
    let counter = 0;
    for (let i = 0; i < microController.sketchProcedures.length; i++) {
        if (microController.sketchProcedures[i].args.length <= 1) {
            counter++;
            continue;
        }
        let group: Connector[] = [];
        for (let j = 0; j < microController.sketchProcedures[i].args.length; j++) {
            group.push(microController.InConnections[counter]);
            counter++;
        }
        groups.push(group);
    }

    let isOk = true;

    for (let group of groups) {
        let reachableCommandSets = new Array<Set<Command>>();
        for (let connector of group) {
            reachableCommandSets.push(getCommandsReachingConnector(connector));
        }
        for (let i = 0; i < reachableCommandSets.length; i++) {
            console.log(reachableCommandSets[i]);
        }

        if (!reachableCommandSets.every(set => set.size == reachableCommandSets[0].size)) isOk = false;
    }

    return isOk;
}


const isPathValid = (start: DrawUnit, visited: Set<DrawUnit>): boolean => {
    if (visited.has(start)) return true;
    visited.add(start);

    for (const conn of start.OutConnections) {
        const neighbor = conn.targetNode?.ownerNode;
        if (!neighbor) continue;

        if (neighbor instanceof DataRequest) {
            return false;
        }

        if (neighbor instanceof MicroController) {
            continue;
        }

        if (!isPathValid(neighbor, visited)) {
            return false;
        }
    }

    return true;
};