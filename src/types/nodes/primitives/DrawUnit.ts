import { ClickType } from "../ClickType";
import { Connector } from "./Connector";

export type DrawingOptions = {
    isDrawingArrow: boolean;
    type: string;
}

export type ClickResponse = {
    clickedUnit: DrawUnit,
    clickType: ClickType | null
}

export abstract class DrawUnit {
    protected _position!: Position;
    abstract get position(): Position;
    abstract set position(value: Position);

    protected _isSelected: boolean = false;
    abstract get isSelected(): boolean;
    abstract set isSelected(value: boolean);

    abstract draw(ctx: CanvasRenderingContext2D): void;
    abstract checkIsClicked(clickPosition: Position): ClickResponse;
    abstract compileToCpp(descripter: string[]): string

    abstract get OutConnections(): Connector[]; 
    abstract get InConnections(): Connector[]; 
} 