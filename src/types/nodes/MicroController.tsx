import { SketchData, SketchFullInfo, SketchInfo, SketchParam, SketchProcedure } from "../api/sketch";
import { ClickType } from "./ClickType";
import { Connector } from "./primitives/Connector";
import { ClickResponse, DrawUnit } from "./primitives/DrawUnit";

type CodeParam = {
    macrosName: string
    value: string,
    name: string,
    regex: RegExp | null,
    valueList: string[]
}

export class MicroController extends DrawUnit {
    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
        this._position = value;

        let height = 240;

        const maxConnectorsLength = Math.max(this._inConnectors.length, this._outConnectors.length);

        if (maxConnectorsLength > 6) {
            height = maxConnectorsLength * 2 * 20;
        }

        for (let i = 0; i < this._inConnectors.length; i++) {
            this._inConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - height / 2, x: this._position.x - 100};
        }

        for (let i = 0; i < this._outConnectors.length; i++) {
            this._outConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - height / 2, x: this._position.x + 100};
        }
    }

    private _height: number;

    get isSelected(): boolean {
        return this._isSelected;
    }

    set isSelected(value: boolean) {
        this._isSelected = value;
    }

    private _inConnectors: Connector[] = [];
    private _outConnectors: Connector[] = [];

    private _sketchName: String = "";
    private _sketchCode: String = "";

    private _sketchParams: SketchParam[] = [];
    private _sketchProcedures: SketchProcedure[] = [];
    private _sketchDatas: SketchData[] = [];

    // setSketch(sketch: ) {
    //     this._sketchName = sketch.name;
    //     this._sketchCode = sketch.code
    // }

    constructor(position: Position) {
        super();
        this.position = position;
        this._inConnectors.push(new Connector({ x: 0, y: 0 }, true));
        this._inConnectors.push(new Connector({ x: 0, y: 0 }, true));
        this._inConnectors.push(new Connector({ x: 0, y: 0 }, true));
        this._inConnectors.push(new Connector({ x: 0, y: 0 }, true));
        this._inConnectors.push(new Connector({ x: 0, y: 0 }, true));
        this._inConnectors.push(new Connector({ x: 0, y: 0 }, true));
        this._inConnectors.push(new Connector({ x: 0, y: 0 }, true));
        this._inConnectors.push(new Connector({ x: 0, y: 0 }, true));
        this._inConnectors.push(new Connector({ x: 0, y: 0 }, true));
        this._inConnectors.push(new Connector({ x: 0, y: 0 }, true));
        this._inConnectors.push(new Connector({ x: 0, y: 0 }, true));
        this._inConnectors.push(new Connector({ x: 0, y: 0 }, true));

        this._outConnectors.push(new Connector({ x: 0, y: 0 }, false));
        this._outConnectors.push(new Connector({ x: 0, y: 0 }, false));
        this._outConnectors.push(new Connector({ x: 0, y: 0 }, false));
        this._outConnectors.push(new Connector({ x: 0, y: 0 }, false));
        this._outConnectors.push(new Connector({ x: 0, y: 0 }, false));
        this._outConnectors.push(new Connector({ x: 0, y: 0 }, false));
        this._outConnectors.push(new Connector({ x: 0, y: 0 }, false));
        this._outConnectors.push(new Connector({ x: 0, y: 0 }, false));
        this._outConnectors.push(new Connector({ x: 0, y: 0 }, false));

    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "blue";
        if (this.isSelected) {
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2.5;
        } else {
            ctx.strokeStyle = "#444";
            ctx.lineWidth = 1.5;
        }

        let height = 240;

        const maxConnectorsLength = Math.max(this._inConnectors.length, this._outConnectors.length);

        if (maxConnectorsLength > 6) {
            height = maxConnectorsLength * 2 * 20;
        }

        ctx.fillRect(this.position.x - 100, this.position.y - height / 2, 200, height);
        ctx.strokeRect(this.position.x - 100, this.position.y - height / 2, 200, height);

        for (let inConnector of this._inConnectors) {
            inConnector.draw(ctx);
        }

        for (let outConnector of this._outConnectors) {
            outConnector.draw(ctx);
        }

        
        ctx.strokeStyle = "000";
        ctx.fillStyle = "000";
        ctx.beginPath();
        ctx.moveTo(this.position.x - 65, this.position.y - height / 2 + 15);
        ctx.lineTo(this.position.x + 65, this.position.y - height / 2 + 15);
        ctx.lineTo(this.position.x, this.position.y - height / 2 + 75);
        ctx.closePath();
        ctx.fill();
    }

    checkIsClicked(clickPosition: Position): ClickResponse {
        for (let inConnector of this._inConnectors) {
            const clickResponse = inConnector.checkIsClicked(clickPosition);
            if (clickResponse.clickType) return clickResponse;
        }

        for (let outConnector of this._outConnectors) {
            const clickResponse = outConnector.checkIsClicked(clickPosition);
            if (clickResponse.clickType) return clickResponse;
        }
        const isClicked = clickPosition.x >= this.position.x - 100 && clickPosition.x <= this.position.x + 100 && clickPosition.y >= this.position.y - 200 && clickPosition.y <= this.position.y + 200;
        if (isClicked) return {clickedUnit: this, clickType: ClickType.Selectable};
        return {clickedUnit: this, clickType: null}
    }
}