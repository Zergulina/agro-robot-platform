import { MicroControllerSketch, SketchData, SketchParam, SketchProcedure } from "../api/sketch";
import { ClickType } from "./ClickType";
import { Connector } from "./primitives/Connector";
import { ClickResponse, DrawUnit } from "./primitives/DrawUnit";

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
            this._inConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - height / 2, x: this._position.x - 100 };
        }

        for (let i = 0; i < this._outConnectors.length; i++) {
            this._outConnectors[i].position = { y: 20 + this.position.y + i * 2 * 20 - height / 2, x: this._position.x + 100 };
        }
    }

    private _height: number = 240;

    get isSelected(): boolean {
        return this._isSelected;
    }

    set isSelected(value: boolean) {
        this._isSelected = value;
    }

    private _inConnectors: Connector[] = [];
    private _outConnectors: Connector[] = [];

    private _sketchName: String = "";
    get sketchName(): String {
        return this._sketchName;
    }
    private _sketchCode: String = "";

    private _sketchParams: SketchParam[] = [];
    sketchParamValues: String[] = [];
    private _sketchProcedures: SketchProcedure[] = [];
    private _sketchDatas: SketchData[] = [];

    get sketchParams(): SketchParam[] {
        return [...this._sketchParams];
    }
    get sketchProcedures(): SketchProcedure[] {
        return [...this._sketchProcedures];
    }
    get sketchDatas(): SketchData[] {
        return [...this._sketchDatas];
    }

    setSketch(sketch: MicroControllerSketch) {
        this._sketchName = sketch.name;
        this._sketchCode = sketch.code

        this._sketchParams = sketch.params;
        this._sketchProcedures = sketch.procedures;
        this._sketchDatas = sketch.datas;

        let height = 240;

        const maxConnectorsLength = Math.max(this._sketchProcedures.map(procedure => procedure.args).length, this._sketchDatas.length);
        if (maxConnectorsLength > 6) {
            height = maxConnectorsLength * 2 * 20;
        }

        this._inConnectors = [];

        let counter = 0;

        for (let i = 0; i < this._sketchProcedures.length; i++) {
            if (this._sketchProcedures[i].args.length == 0) {
                let inConnector = new Connector({ y: 20 + this.position.y + counter * 2 * 20 - height / 2, x: this._position.x - 100 }, true, this);
                inConnector.type = "void";
                this._inConnectors.push(inConnector);
                counter++;
                continue;
            }
            for (let j = 0; j < this._sketchProcedures[i].args.length; j++) {
                let inConnector = new Connector({ y: 20 + this.position.y + counter * 2 * 20 - height / 2, x: this._position.x - 100 }, true, this);
                inConnector.type = this.sketchProcedures[i].args[j].arg_type;
                this._inConnectors.push(inConnector);
                counter++;
            }
        }

        this._outConnectors = [];

        for (let i = 0; i < this._sketchDatas.length; i++) {
            let outConnector = new Connector({ y: 20 + this.position.y + i * 2 * 20 - height / 2, x: this._position.x + 100 }, false, this);
            outConnector.type = this._sketchDatas[i].data_type;
            this._outConnectors.push(outConnector);
        }

        this._height = height;
    }

    constructor(position: Position) {
        super();
        this.position = position;
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

        ctx.fillRect(this.position.x - 100, this.position.y - this._height / 2, 200, this._height);
        ctx.strokeRect(this.position.x - 100, this.position.y - this._height / 2, 200, this._height);

        let counter = 0;
        for (let i = 0; i < this._sketchProcedures.length; i++) {
            if (this._sketchProcedures[i].args.length == 0) {
                ctx.fillStyle = "white";
                ctx.fillText(`${i + 1}`, this._inConnectors[counter].position.x + 32, this._inConnectors[counter].position.y + 4);
                counter++;
                continue;
            }

            for (let j = 0; j < this._sketchProcedures[i].args.length; j++) {
                ctx.font = '10px Arial';
                ctx.fillStyle = 'white';
                ctx.fillText(`${j + 1}`, this._inConnectors[counter].position.x + 15, this._inConnectors[counter].position.y + 4);
                counter++;
            }
            let start = this._inConnectors[counter - this._sketchProcedures[i].args.length].position;
            let end = this._inConnectors[counter - 1].position;

            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(start.x, start.y - 10);
            ctx.lineTo(start.x + 35, start.y - 10);
            ctx.lineTo(end.x + 35, end.y + 10);
            ctx.lineTo(end.x, end.y + 10);
            ctx.stroke();

            ctx.fillStyle = "blue";
            ctx.fillRect(start.x + 25, (start.y + end.y) / 2 - 6, 20, 12);

            ctx.fillStyle = "white";
            ctx.fillText(`${i + 1}`, start.x + 32, (start.y + end.y) / 2 + 4);
        }

        for (let inConnector of this._inConnectors) {
            inConnector.draw(ctx);
        }

        for (let i = 0; i < this._outConnectors.length; i++) {
            this._outConnectors[i].draw(ctx);
            ctx.font = '10px Arial';
            ctx.fillStyle = "white";
            ctx.textAlign = "right";
            ctx.fillText(`${i + 1}`, this._outConnectors[i].position.x - 15, this._outConnectors[i].position.y + 4);
        }

        ctx.textAlign = "left";

        ctx.strokeStyle = "#000";
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(this.position.x - 60, this.position.y - this._height / 2 + 15);
        ctx.lineTo(this.position.x + 60, this.position.y - this._height / 2 + 15);
        ctx.lineTo(this.position.x, this.position.y - this._height / 2 + 75);
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
        const isClicked = clickPosition.x >= this.position.x - 100 && clickPosition.x <= this.position.x + 100 && clickPosition.y >= this.position.y - this._height / 2 && clickPosition.y <= this.position.y + this._height / 2;
        if (isClicked) return { clickedUnit: this, clickType: ClickType.Selectable };
        return { clickedUnit: this, clickType: null }
    }

    get OutConnections(): Connector[] {
        return [...this._outConnectors];
    }

    get InConnections(): Connector[] {
        return [...this._inConnectors];
    }

    compileToCpp(descripter: string[]): string {
        return ""
    }
}