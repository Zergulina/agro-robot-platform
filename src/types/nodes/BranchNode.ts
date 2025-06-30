import { ClickType } from "./ClickType";
import { Connector } from "./primitives/Connector";
import { ClickResponse, DrawUnit } from "./primitives/DrawUnit";

export class BranchNode extends DrawUnit {

    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
        this._position = value;

        this._inConditionConnector.position = { x: this._position.x - 30, y: this._position.y - 30 };
        this._inFlowConnector.position = { x: this._position.x - 30, y: this._position.y + 30 };
        this._outIfConnector.position = { x: this._position.x + 30, y: this._position.y - 30 };
        this._outElseConnector.position = { x: this._position.x + 30, y: this._position.y + 30 };
    }

    get isSelected(): boolean {
        return this._isSelected;
    };

    set isSelected(value: boolean) {
        this._isSelected = value;
    }

    private _inConditionConnector: Connector;
    private _inFlowConnector: Connector;
    private _outIfConnector: Connector;
    private _outElseConnector: Connector;

    constructor(position: Position) {
        super();
        this._position = position;
        this._inConditionConnector = new Connector({ x: this._position.x - 30, y: this._position.y - 30 }, true, this)
        this._inFlowConnector = new Connector({ x: this._position.x - 30, y: this._position.y + 30 }, true, this)
        this._outIfConnector = new Connector({ x: this._position.x + 30, y: this._position.y - 30 }, false, this);
        this._outElseConnector = new Connector({ x: this._position.x + 30, y: this._position.y + 30 }, false, this);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "aqua";
        if (this.isSelected) {
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2.5;
        } else {
            ctx.strokeStyle = "#444";
            ctx.lineWidth = 1.5;
        }

        ctx.fillRect(this.position.x - 30, this.position.y - 50, 60, 100);
        ctx.strokeRect(this.position.x - 30, this.position.y - 50, 60, 100);

        this._inConditionConnector.draw(ctx);
        this._inFlowConnector.draw(ctx);
        this._outIfConnector.draw(ctx);
        this._outElseConnector.draw(ctx);
    }

    checkIsClicked(clickPosition: Position): ClickResponse {
        let connectorClickResponse = this._inConditionConnector.checkIsClicked(clickPosition);
        if (connectorClickResponse.clickType) return connectorClickResponse;

        connectorClickResponse = this._inFlowConnector.checkIsClicked(clickPosition);
        if (connectorClickResponse.clickType) return connectorClickResponse;

        connectorClickResponse = this._outIfConnector.checkIsClicked(clickPosition);
        if (connectorClickResponse.clickType) return connectorClickResponse;

        connectorClickResponse = this._outElseConnector.checkIsClicked(clickPosition);
        if (connectorClickResponse.clickType) return connectorClickResponse;

        const isClicked = (clickPosition.x >= this._position.x - 30) && (clickPosition.x <= this._position.x + 30) && (clickPosition.y >= this._position.y - 50) && (clickPosition.y <= this._position.y + 50);

        if (isClicked) return { clickedUnit: this, clickType: ClickType.Selectable };
        return { clickedUnit: this, clickType: null }
    }
}
