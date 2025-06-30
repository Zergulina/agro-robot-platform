import { Command } from "../../types/nodes/input/Command";
import { MicroController } from "../../types/nodes/MicroController";
import { Connector } from "../../types/nodes/primitives/Connector";
import { DrawUnit } from "../../types/nodes/primitives/DrawUnit";
import { Repeater } from "../../types/nodes/Repeater";

enum VertexColor {
    White,
    Grey,
    Black
}

export const CheckIsOk = (nodes: DrawUnit[]) => {
    let isOk = true;

    let dict = new Map<DrawUnit, VertexColor>();

    let cycles: DrawUnit[][] = [];

    for (let node of nodes) {
        dict.set(node, VertexColor.White);
    }

    for (let node of nodes) {
        if (dict.get(node) == VertexColor.White) {
            cycles.concat(DFS(node, null, new Array<DrawUnit>(), dict));
        }
    }

    if (cycles.length > 0) {
        isOk = false;
        console.log("Проебались на циклах");
    }

    for (let node of nodes) {
        if (!(node instanceof MicroController) && node.InConnections.map(x => x.sourceNode).includes(null)) {
            isOk = false;
            console.log("Проебались на входах");
        }
    }

    for (let node of nodes) {
        if (!(node instanceof MicroController) && node.OutConnections.map(x => x.targetNode).includes(null)) {
            isOk = false;
            console.log("Проебались на выходах");
        }
    }

    if (!arePathsDisjointWithAllowedOverlap(nodes)) {
        isOk = false;
        console.log("Проебались на пересечении");
    }

    const microController = nodes.filter(node =>
        node instanceof MicroController
    )[0];

    if (!checkAreGroupsFullConnectedToCommands(microController)) {
        isOk = false;
        console.log("Проебались на процедурах");
    }

    console.log("В итоге норм?", isOk);
}

const DFS = (current: DrawUnit, parent: DrawUnit | null, path: DrawUnit[], dict: Map<DrawUnit, VertexColor>): DrawUnit[][] => {
    dict.set(current, VertexColor.Grey);
    path.push(current);

    let cycles: DrawUnit[][] = [];

    for (let neighbor of current.OutConnections.map(x => x.targetNode?.ownerNode).filter(x => x != undefined)) {
        if (dict.get(neighbor) == VertexColor.White) {
            cycles.concat(DFS(neighbor, current, path, dict));
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
    const visitedBy = new Map<DrawUnit, DrawUnit>(); // key: node, value: root it was reached from

    // Шаг 2: Найдём корни — это вершины типа Command без входящих связей
    const roots = allNodes.filter(node =>
        node instanceof Command
    );

    // Шаг 3: DFS с проверкой пересечений
    const dfs = (current: DrawUnit, root: DrawUnit): boolean => {
        if (visitedBy.has(current)) {
            const firstRoot = visitedBy.get(current)!;

            // Пересечение разрешено только если Repeator или MicroController
            if (current instanceof Repeater) {
                return true;
            }
            else if (current instanceof MicroController) {

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
    const stack: DrawUnit[] = target.sourceNode ? [target.sourceNode.ownerNode] : [];
    const result = new Set<Command>();

    while (stack.length) {
        const node = stack.pop()!;
        if (visited.has(node)) continue;
        visited.add(node);

        if (node instanceof Command) {
            console.log("-1")
            result.add(node);
        }

        console.log("0")

        // идём “назад” по всем соединениям, где этот коннектор — targetNode
        for (const nextNode of node.InConnections.map(x => x.ownerNode).filter(x => x != null) ?? []) {

            console.log("1")
            // если это выход командного узла — запомним команду
            if (nextNode instanceof Command) {
                console.log("2")
                result.add(nextNode);
            }

            // и продолжим обход от исходного коннектора
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
        // for (let i = 1; i < reachableCommandSets.length; i++) {
        //     const difference = new Set([...reachableCommandSets[i - 1]].filter(x => !reachableCommandSets[i].has(x)));
        //     console.log("difference:", difference.size)
        //     if (difference.size > 0) {
        //         isOk = false;
        //     }
        // }
        if (!reachableCommandSets.every(set => set.size == reachableCommandSets[0].size)) isOk = false;
    }

    return isOk;
}