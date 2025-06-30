import { ClickType } from "../../ClickType";
import { Connector } from "../../primitives/Connector";
import { ClickResponse, DrawUnit } from "../../primitives/DrawUnit";

export abstract class BasicMultiConnectionOperation extends DrawUnit {
    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
        this._position = value;

        let height = 100;

        if (this._inConnectors.length > 2) {
            height = this._inConnectors.length * 2 * 20;
        }

        for (let i = 0; i < this._inConnectors.length; i++) {
            this._inConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - height / 2, x: this._position.x - 30 };
        }

        this._outConnector.position = { x: this._position.x + 30, y: this._position.y };
    }

    protected _height: number = 100;

    get isSelected(): boolean {
        return this._isSelected;
    };

    set isSelected(value: boolean) {
        this._isSelected = value;
    }

    private _inConnectors: Connector[] = [];
    private _outConnector: Connector;

    get inConnectorsLength(): number {
        return this._inConnectors.length;
    }

    constructor(position: Position) {
        super();
        this._position = position;
        this._inConnectors.push(new Connector({ x: this._position.x - 30, y: this._position.y - 30 }, true, this));
        this._inConnectors[0].type = "bool";
        this._inConnectors.push(new Connector({ x: this._position.x - 30, y: this._position.y + 10 }, true, this));
        this._inConnectors[1].type = "bool";
        this._outConnector = new Connector({ x: this._position.x + 30, y: this._position.y }, false, this);
        this._outConnector.type = "bool";
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "yellow";
        if (this.isSelected) {
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2.5;
        } else {
            ctx.strokeStyle = "#444";
            ctx.lineWidth = 1.5;
        }

        ctx.fillRect(this.position.x - 30, this.position.y - this._height / 2, 60, this._height);
        ctx.strokeRect(this.position.x - 30, this.position.y - this._height / 2, 60, this._height);

        for (let inConnector of this._inConnectors) {
            inConnector.draw(ctx);
        }
        this._outConnector.draw(ctx);
    }

    checkIsClicked(clickPosition: Position): ClickResponse {
        for (let inConnector of this._inConnectors) {
            let connectorClickResponse = inConnector.checkIsClicked(clickPosition);
            if (connectorClickResponse.clickType) return connectorClickResponse;
        }

        let connectorClickResponse = this._outConnector.checkIsClicked(clickPosition);
        if (connectorClickResponse.clickType) return connectorClickResponse;

        const isClicked = (clickPosition.x >= this._position.x - 30) && (clickPosition.x <= this._position.x + 30) && (clickPosition.y >= this._position.y - this._height / 2) && (clickPosition.y <= this._position.y + this._height / 2);

        if (isClicked) return { clickedUnit: this, clickType: ClickType.Selectable };
        return { clickedUnit: this, clickType: null }
    }

    addInConnector() {
        let connector = new Connector({ x: this._position.x - 30, y: 20 + this.position.y + this._inConnectors.length * 2 * 20 }, true, this);
        connector.type = "bool";
        this._inConnectors.push(connector);

        this._height = this._inConnectors.length * 2 * 20;
        for (let i = 0; i < this._inConnectors.length; i++) {
            this._inConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x - 30 };
        }
    }

    removeInConnector() {
        if (this._inConnectors.length == 2) return;
        let removedConnector = this._inConnectors.pop();
        if (removedConnector?.sourceNode) removedConnector.sourceNode.targetNode = null;

        let height = 100;

        if (this._inConnectors.length > 2) {
            height = this._inConnectors.length * 2 * 20;
        }

        this._height = height;
        for (let i = 0; i < this._inConnectors.length; i++) {
            this._inConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - height / 2, x: this._position.x - 30 };
        }

    }

    get OutConnections(): Connector[] {
        return [this._outConnector];
    }

    get InConnections(): Connector[] {
        return [...this._inConnectors];
    }
}