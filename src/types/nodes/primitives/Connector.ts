import { ClickType } from "../ClickType";
import { ClickResponse, DrawUnit } from "./DrawUnit";

export class Connector extends DrawUnit {
    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
        this._position = value;
    }

    get isSelected(): boolean {
        return this._isSelected;
    }

    set isSelected(value: boolean) {
        this._isSelected = value;
    }

    private _isInput: boolean;

    get isInput(): boolean {
        return this._isInput;
    }

    private _type: string;

    constructor(position: Position, isInput: boolean) {
        super();
        this.position = position;
        this._isInput = isInput;
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
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.font = '10px Arial';
        ctx.fillStyle = 'black';
        if (this._isInput) ctx.fillText('In', this._position.x-4, this._position.y+4);
        else ctx.fillText('Out', this._position.x-9, this._position.y+4);
    }

    checkIsClicked(clickPosition: Position): ClickResponse {
        const dx = clickPosition.x - this.position.x;
        const dy = clickPosition.y - this.position.y;
        return {clickedUnit: this, clickType: dx * dx + dy * dy <= 100 ? ClickType.Connector : null}
    }
}