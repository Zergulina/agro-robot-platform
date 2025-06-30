import { ClickType } from "../ClickType";

import { Connector } from "../primitives/Connector";
import { ClickResponse, DrawUnit } from "../primitives/DrawUnit";

export type CommandArgument = {
    name: string;
    arg_name: string;
    type: string;
}

export class Command extends DrawUnit  {
    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
        this._position = value;

        for (let i = 0; i < this._outConnectors.length; i++) {
            this._outConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x + 75 };
        }
    }

    private _height: number = 40;

    get isSelected(): boolean {
        return this._isSelected;
    };

    set isSelected(value: boolean) {
        this._isSelected = value;
    }

    private _outConnectors: Connector[] = [];

    private _commandArgs: CommandArgument[] = [];

    get commandArgs(): CommandArgument[] {
        return [...this._commandArgs];
    }

    get outConnectorsLength(): number {
        return this._outConnectors.length;
    }

    commandName: string = "";
    programCommandName: string = "";

    constructor(position: Position) {
        super();
        this._position = position;
        this._outConnectors.push(new Connector({ x: this._position.x + 75, y: this._position.y }, false, this));
        this._outConnectors[0].type = "void";
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "white";
        if (this.isSelected) {
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2.5;
        } else {
            ctx.strokeStyle = "#444";
            ctx.lineWidth = 1.5;
        }

        ctx.fillRect(this.position.x - 75, this.position.y - this._height / 2, 150, this._height);
        ctx.strokeRect(this.position.x - 75, this.position.y - this._height / 2, 150, this._height);

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.fillText(`Команда`, this._position.x - 70, this._position.y - this._height / 2 + 14);
        ctx.fillText(this.commandName, this._position.x - 70, this._position.y - this._height / 2 + 28);

        for (let outConnector of this._outConnectors) {
            outConnector.draw(ctx);
        }
    }

    checkIsClicked(clickPosition: Position): ClickResponse {


        for (let outConnector of this._outConnectors) {
            let connectorClickResponse = outConnector.checkIsClicked(clickPosition);
            if (connectorClickResponse.clickType) return connectorClickResponse;
        }

        const isClicked = (clickPosition.x >= this._position.x - 75) && (clickPosition.x <= this._position.x + 75) && (clickPosition.y >= this._position.y - this._height / 2) && (clickPosition.y <= this._position.y + this._height / 2);

        if (isClicked) return { clickedUnit: this, clickType: ClickType.Selectable };
        return { clickedUnit: this, clickType: null }
    }


    addCommandArg() {
        if (this._commandArgs.length > 0) {
            let connector = new Connector({ x: this._position.x + 75, y: 20 + this.position.y + this._outConnectors.length * 2 * 20 }, false, this);
            connector.type = "int";
            this._outConnectors.push(connector);
            this._height = this._outConnectors.length * 2 * 20;
            this._commandArgs.push({ name: "Новый агрумент", arg_name: "new_arg", type: "int" })
        }
        else {
            this._commandArgs.push({ name: "Новый агрумент", arg_name: "new_arg", type: "int" })
            this._outConnectors[0].type = "int";
        }
        for (let i = 0; i < this._outConnectors.length; i++) {
            this._outConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x + 75 };
        }
    }

    updateCommandArg(index: number, arg: CommandArgument) {
        if (index >= this._commandArgs.length) return;
        this._commandArgs[index] = arg;
        this._outConnectors[index].type = arg.type;
    }

    removeCommandArg() {
        if (this._commandArgs.length == 0) return;

        if (this._commandArgs.length > 1) {
            let removedConnector = this._outConnectors.pop();
            if (removedConnector?.targetNode) removedConnector.targetNode.sourceNode = null;
            this._height = this._outConnectors.length * 2 * 20;
        }
        else {
            this._outConnectors[0].type = "void";
        }
        for (let i = 0; i < this._outConnectors.length; i++) {
            this._outConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x + 75 };
        }
        this._commandArgs.pop();
    }

    get OutConnections(): Connector[] {
        return [...this._outConnectors];
    }

    get InConnections(): Connector[] {
        return [];
    }

    compileToCpp(descripter: string[]): string {
        if (descripter.length != 0) {
            throw new Error(`Ошибка в размерности дескриптора для компиляции на С++ класса ${typeof(this)}`);
        }

        return `${this.programCommandName}(${this._commandArgs.map(arg => arg.arg_name).join(", ")}) {\n`
    }
}