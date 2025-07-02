import { ClickType } from "./ClickType";

import { Connector } from "./primitives/Connector";
import { ClickResponse, DrawUnit } from "./primitives/DrawUnit";

export class Repeater extends DrawUnit  {
    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
        this._position = value;

        for (let i = 0; i < this._inConnectors.length; i++) {
            this._inConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x - 30 };
        }

        for (let i = 0; i < this._outConnectors.length; i++) {
            this._outConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x + 30 };
        }
    }

    private _height: number = 40;

    get isSelected(): boolean {
        return this._isSelected;
    };

    set isSelected(value: boolean) {
        this._isSelected = value;
    }

    private _inConnectors: Connector[] = [];
    private _outConnectors: Connector[] = [];
    private _isInput: boolean = false;
    get isInput(): boolean {
        return this._isInput;
    }
    set isInput(value: boolean) {
        this._isInput = value;

        if (this._isInput) {
            for (let i = 1; i < this._outConnectors.length; i++) {
                let connector = new Connector({ x: this._position.x - 30, y: 20 + this.position.y + this._inConnectors.length * 2 * 20 }, true, this);
                this._inConnectors.push(connector);
            }
            let prevLength =  this._outConnectors.length;
            for (let i = 1; i < prevLength; i++) {
                let removedConnector = this._outConnectors.pop();
                if (removedConnector?.targetNode) removedConnector.targetNode.sourceNode = null;
            }
            for (let i = 0; i < this._inConnectors.length; i++) {
                this._inConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x - 30 };
            }
        }
        else {
            for (let i = 1; i < this._inConnectors.length; i++) {
                let connector = new Connector({ x: this._position.x + 30, y: 20 + this.position.y + this._outConnectors.length * 2 * 20 }, false, this);
                this._outConnectors.push(connector);
            }
            let prevLength =  this._inConnectors.length;
            for (let i = 1; i < prevLength; i++) {
                let removedConnector = this._inConnectors.pop();
                if (removedConnector?.sourceNode) removedConnector.sourceNode.targetNode = null;
            }
            for (let i = 0; i < this._outConnectors.length; i++) {
                this._outConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x + 30 };
            }
        }
    }

    get connectorsLength(): number {
        return this._isInput ? this._inConnectors.length : this._outConnectors.length;
    }

    constructor(position: Position) {
        super();
        this._position = position;
        let inConnector = new Connector({ x: this._position.x - 30, y: this._position.y }, true, this);
        inConnector.type = "any";
        this._inConnectors.push(inConnector);
        let outConnector = new Connector({ x: this._position.x + 30, y: this._position.y }, false, this)
        outConnector.type = "any";
        this._outConnectors.push(outConnector);
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

        ctx.fillRect(this.position.x - 30, this.position.y - this._height / 2, 60, this._height);
        ctx.strokeRect(this.position.x - 30, this.position.y - this._height / 2, 60, this._height);

        for (let inConnector of this._inConnectors) {
            inConnector.draw(ctx);
        }
        for (let outConnector of this._outConnectors) {
            outConnector.draw(ctx);
        }
    }

    checkIsClicked(clickPosition: Position): ClickResponse {
        for (let inConnector of this._inConnectors) {
            let connectorClickResponse = inConnector.checkIsClicked(clickPosition);
            if (connectorClickResponse.clickType) return connectorClickResponse;
        }

        for (let outConnector of this._outConnectors) {
            let connectorClickResponse = outConnector.checkIsClicked(clickPosition);
            if (connectorClickResponse.clickType) return connectorClickResponse;
        }

        const isClicked = (clickPosition.x >= this._position.x - 30) && (clickPosition.x <= this._position.x + 30) && (clickPosition.y >= this._position.y - this._height / 2) && (clickPosition.y <= this._position.y + this._height / 2);

        if (isClicked) return { clickedUnit: this, clickType: ClickType.Selectable };
        return { clickedUnit: this, clickType: null }
    }

    addConnector() {
        if (this._isInput) {
            let connector = new Connector({ x: this._position.x - 30, y: 20 + this.position.y + this._inConnectors.length * 2 * 20 }, true, this);
            this._inConnectors.push(connector);

            const maxConnectorsLength = Math.max(this._inConnectors.length, this._outConnectors.length);
            this._height = maxConnectorsLength * 2 * 20;

            for (let i = 0; i < this._inConnectors.length; i++) {
                this._inConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x - 30 };
            }

            for (let i = 0; i < this._outConnectors.length; i++) {
                this._outConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x + 30 };
            }
        }
        else {
            let connector = new Connector({ x: this._position.x + 30, y: 20 + this.position.y + this._outConnectors.length * 2 * 20 }, false, this);
            this._outConnectors.push(connector);

            const maxConnectorsLength = Math.max(this._inConnectors.length, this._outConnectors.length);
            this._height = maxConnectorsLength * 2 * 20;

            for (let i = 0; i < this._inConnectors.length; i++) {
                this._inConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x - 30 };
            }

            for (let i = 0; i < this._outConnectors.length; i++) {
                this._outConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x + 30 };
            }
        }
    }

    removeConnector() {
        if (this._isInput) {
            if (this._inConnectors.length == 1) return;
            let removedConnector = this._inConnectors.pop();
            if (removedConnector?.sourceNode) removedConnector.sourceNode.targetNode = null;

            const maxConnectorsLength = Math.max(this._inConnectors.length, this._outConnectors.length);
            this._height = maxConnectorsLength * 2 * 20;

            for (let i = 0; i < this._inConnectors.length; i++) {
                this._inConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x - 30 };
            }

            for (let i = 0; i < this._outConnectors.length; i++) {
                this._outConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x + 30 };
            }
        } else {
            if (this._outConnectors.length == 1) return;
            let removedConnector = this._outConnectors.pop();
            if (removedConnector?.targetNode) removedConnector.targetNode.sourceNode = null;

            const maxConnectorsLength = Math.max(this._inConnectors.length, this._outConnectors.length);
            this._height = maxConnectorsLength * 2 * 20;

            for (let i = 0; i < this._inConnectors.length; i++) {
                this._inConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x - 30 };
            }

            for (let i = 0; i < this._outConnectors.length; i++) {
                this._outConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - this._height / 2, x: this._position.x + 30 };
            }
        }
    }

    get OutConnections(): Connector[] {
        return [...this._outConnectors];
    }

    get InConnections(): Connector[] {
        return [...this._inConnectors];
    }

    compileToCpp(descripter: string[]): string {
        if (descripter.length != this._inConnectors.length) {
            throw new Error(`Ошибка в размерности дескриптора для компиляции на С++ класса ${typeof (this)}`);
        }

        return "";
    }

    convertToSafeRecord(): string {
        const data = {
            nodeType: "Repeater",
            positionX: this.position.x,
            positionY: this.position.y,
            isInput: this._isInput,
            inConnectionsLength: this.InConnections.length,
            outConnectionsLength: this.OutConnections.length,
        }

        return JSON.stringify(data);
    }
}