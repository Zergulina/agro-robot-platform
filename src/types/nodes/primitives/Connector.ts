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

    arrowIsSelected: boolean = false;

    private _isInput: boolean;

    get isInput(): boolean {
        return this._isInput;
    }

    type: string = "";

    private _ownerNode: DrawUnit;
    get ownerNode(): DrawUnit {
        return this._ownerNode;
    }

    targetNode: Connector | null = null;
    sourceNode: Connector | null = null;

    constructor(position: Position, isInput: boolean, ownerNode: DrawUnit) {
        super();
        this.position = position;
        this._isInput = isInput;
        this._ownerNode = ownerNode;
    }

    private drawArrow(
        ctx: CanvasRenderingContext2D,
        fromPosition: Position,
        toPosition: Position,
        shortenEndBy: number = 10,
        arrowHeadLength: number = 10
    ): void {
        const dx = toPosition.x - fromPosition.x;
        const dy = toPosition.y - fromPosition.y;
        const angle = Math.atan2(dy, dx);

        const endX = toPosition.x - shortenEndBy * Math.cos(angle);
        const endY = toPosition.y - shortenEndBy * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(fromPosition.x, fromPosition.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
            endY - arrowHeadLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
            endY - arrowHeadLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.lineTo(endX, endY);
        ctx.fill();
    }

    private checkIsArrowClicked(
        fromArrowPosition: Position,
        toArrowPosition: Position,
        clickPosition: Position,
        shortenEndBy: number = 10,
        tolerance: number = 5
    ): boolean {
        const dxAngle = toArrowPosition.x - fromArrowPosition.x;
        const dyAngle = toArrowPosition.y - fromArrowPosition.y;
        const angle = Math.atan2(dyAngle, dxAngle);

        const endX = toArrowPosition.x - shortenEndBy * Math.cos(angle);
        const endY = toArrowPosition.y - shortenEndBy * Math.sin(angle);

        const A = clickPosition.x - fromArrowPosition.x;
        const B = clickPosition.y - fromArrowPosition.y;
        const C = endX - fromArrowPosition.x;
        const D = endY - fromArrowPosition.y;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        const param = len_sq !== 0 ? dot / len_sq : -1;

        let nearestX, nearestY;

        if (param < 0) {
            nearestX = fromArrowPosition.x;
            nearestY = fromArrowPosition.y;
        } else if (param > 1) {
            nearestX = endX;
            nearestY = endY;
        } else {
            nearestX = fromArrowPosition.x + param * C;
            nearestY = fromArrowPosition.y + param * D;
        }

        const dx = clickPosition.x - nearestX;
        const dy = clickPosition.y - nearestY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= tolerance;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.arrowIsSelected ? 'green' : 'black';
        ctx.strokeStyle = this.arrowIsSelected ? 'green' : 'black';
        if (this.targetNode) this.drawArrow(ctx, this._position, this.targetNode?.position);

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

        ctx.textAlign = "left";
        ctx.font = '10px Arial';
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        if (this._isInput) ctx.fillText('In', this._position.x - 4, this._position.y + 4);
        else ctx.fillText('Out', this._position.x - 9, this._position.y + 4);
    }

    checkIsClicked(clickPosition: Position): ClickResponse {
        const dx = clickPosition.x - this.position.x;
        const dy = clickPosition.y - this.position.y;

        if (dx * dx + dy * dy <= 100)
            return { clickedUnit: this, clickType: ClickType.Connector };
        if (this.targetNode && this.checkIsArrowClicked(this.position, this.targetNode.position, clickPosition))
            return { clickedUnit: this, clickType: ClickType.Arrow };
        return { clickedUnit: this, clickType: null };
    }

    checkCanBeConnected(source: Connector): boolean {
        console.log(source.type, this.type);
        return this._ownerNode != source._ownerNode && this.isInput && !this.sourceNode;
    }

    get OutConnections(): Connector[] {
        return [];
    }
    get InConnections(): Connector[] {
        return [];
    }

    compileToCpp(descripter: string[]): string{
        return "";
    }
}