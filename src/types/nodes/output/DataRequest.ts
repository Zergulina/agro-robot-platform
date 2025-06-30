import { ClickType } from "../ClickType";

import { Connector } from "../primitives/Connector";
import { ClickResponse, DrawUnit } from "../primitives/DrawUnit";

export class DataRequest extends DrawUnit {
    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
        this._position = value;

        this._inConnector.position = { x: this._position.x - 75, y: this._position.y };
    }

    private _height: number = 40;

    get isSelected(): boolean {
        return this._isSelected;
    };

    set isSelected(value: boolean) {
        this._isSelected = value;
    }

    private _inConnector: Connector;

    dataRequestName: string = "";
    programDataRequestName: string = "";

    get type(): string {
        return this._inConnector.type;
    }

    constructor(position: Position) {
        super();
        this._position = position;
        this._inConnector = new Connector({ x: this._position.x - 75, y: this._position.y }, true, this);
        this._inConnector.type = "int";
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
        ctx.fillText(`Запрос данных`, this._position.x - 60, this._position.y - this._height / 2 + 14);
        ctx.fillText(this.dataRequestName, this._position.x - 60, this._position.y - this._height / 2 + 28);

        this._inConnector.draw(ctx);

    }

    checkIsClicked(clickPosition: Position): ClickResponse {
        let connectorClickResponse = this._inConnector.checkIsClicked(clickPosition);
        if (connectorClickResponse.clickType) return connectorClickResponse;


        const isClicked = (clickPosition.x >= this._position.x - 75) && (clickPosition.x <= this._position.x + 75) && (clickPosition.y >= this._position.y - this._height / 2) && (clickPosition.y <= this._position.y + this._height / 2);

        if (isClicked) return { clickedUnit: this, clickType: ClickType.Selectable };
        return { clickedUnit: this, clickType: null }
    }

    updateRequestType(type: string) {
        this._inConnector.type = type;
    }

    get OutConnections(): Connector[] {
        return [];
    }

    get InConnections(): Connector[] {
        return [this._inConnector];
    }

    compileToCpp(descripter: string[]): string {
        if (descripter.length != 1) {
            throw new Error(`Ошибка в размерности дескриптора для компиляции на С++ класса ${typeof (this)}`);
        }

        let result = `uint8_t *p = (uint8_t*)&${descripter[0]};\nWire.write(p, sizeof(${descripter[0]}))\n`

        return result
    }
}