import { ClickType } from "../../ClickType";
import { Connector } from "../../primitives/Connector";
import { ClickResponse, DrawUnit } from "../../primitives/DrawUnit";

export abstract class BasicBinaryOperation extends DrawUnit {
    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
        this._position = value;

        this._inAConnector.position = { x: this._position.x - 30, y: this._position.y - 30 };
        this._inBConnector.position = { x: this._position.x - 30, y: this._position.y + 30 };
        this._outConnector.position = { x: this._position.x + 30, y: this._position.y };
    }

    get isSelected(): boolean {
        return this._isSelected;
    };

    set isSelected(value: boolean) {
        this._isSelected = value;
    }

    private _inAConnector: Connector;
    private _inBConnector: Connector;
    private _outConnector: Connector;

    constructor(position: Position) {
        super();
        this._position = position;
        this._inAConnector = new Connector({ x: this._position.x - 30, y: this._position.y - 30 }, true, this)
        this._inBConnector = new Connector({ x: this._position.x - 30, y: this._position.y + 30 }, true, this)
        this._outConnector = new Connector({ x: this._position.x + 30, y: this._position.y }, false, this);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "orange";
        if (this.isSelected) {
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2.5;
        } else {
            ctx.strokeStyle = "#444";
            ctx.lineWidth = 1.5;
        }

        ctx.fillRect(this.position.x - 30, this.position.y - 50, 60, 100);
        ctx.strokeRect(this.position.x - 30, this.position.y - 50, 60, 100);

        ctx.font = '30px Arial';
        ctx.fillStyle = 'black';

        this._inAConnector.draw(ctx);
        this._inBConnector.draw(ctx);
        this._outConnector.draw(ctx);
    }

    checkIsClicked(clickPosition: Position): ClickResponse {
        let connectorClickResponse = this._inAConnector.checkIsClicked(clickPosition);
        if (connectorClickResponse.clickType) return connectorClickResponse;

        connectorClickResponse = this._inBConnector.checkIsClicked(clickPosition);
        if (connectorClickResponse.clickType) return connectorClickResponse;

        connectorClickResponse = this._outConnector.checkIsClicked(clickPosition);
        if (connectorClickResponse.clickType) return connectorClickResponse;

        const isClicked = (clickPosition.x >= this._position.x - 30) && (clickPosition.x <= this._position.x + 30) && (clickPosition.y >= this._position.y - 50) && (clickPosition.y <= this._position.y + 50);

        if (isClicked) return { clickedUnit: this, clickType: ClickType.Selectable };
        return { clickedUnit: this, clickType: null }
    }

    get OutConnections(): Connector[] {
        return [this._outConnector];
    }

    get InConnections(): Connector[] {
        return [this._inAConnector, this._inBConnector];
    }
}