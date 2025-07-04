import { ClickType } from "./ClickType";

import { Connector } from "./primitives/Connector";
import { ClickResponse, DrawUnit } from "./primitives/DrawUnit";

export class Constant extends DrawUnit  {
    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
        this._position = value;

        this._outConnector.position = { y: this._position.y, x: this._position.x + 75 };

    }

    get isSelected(): boolean {
        return this._isSelected;
    };

    set isSelected(value: boolean) {
        this._isSelected = value;
    }

    private _outConnector: Connector;

    constant: number = 0;

    type: string = "int";

    constructor(position: Position) {
        super();
        this._position = position;
        this._outConnector = new Connector({ x: this._position.x + 75, y: this._position.y }, false, this);
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

        ctx.fillRect(this.position.x - 75, this.position.y - 20, 150, 40);
        ctx.strokeRect(this.position.x - 75, this.position.y - 20, 150, 40);

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.fillText(`Константа`, this._position.x - 60, this._position.y - 20 + 14);
        ctx.fillText(this.constant.toString(), this._position.x - 60, this._position.y - 20 + 28);


        this._outConnector.draw(ctx);
    }

    checkIsClicked(clickPosition: Position): ClickResponse {
        let connectorClickResponse = this._outConnector.checkIsClicked(clickPosition);
        if (connectorClickResponse.clickType) return connectorClickResponse;

        const isClicked = (clickPosition.x >= this._position.x - 75) && (clickPosition.x <= this._position.x + 75) && (clickPosition.y >= this._position.y - 20) && (clickPosition.y <= this._position.y + 20);

        if (isClicked) return { clickedUnit: this, clickType: ClickType.Selectable };
        return { clickedUnit: this, clickType: null }
    }

    updateConstantType(type: string) {
        this._outConnector.type = type;
    }

    get OutConnections(): Connector[] {
        return [this._outConnector];
    }

    get InConnections(): Connector[] {
        return [];
    }

    compileToCpp(descripter: string[]): string {
        if (descripter.length != 0) {
            throw new Error(`Ошибка в размерности дескриптора для компиляции на С++ класса ${typeof (this)}`);
        }

        return `${this.constant}`
    }

    convertToSafeRecord(): string {
        const data = {
            nodeType: "Constant",
            positionX: this.position.x,
            positionY: this.position.y,
            constant: this.constant,
            type: this.type,
        }

        return JSON.stringify(data);
    }
}