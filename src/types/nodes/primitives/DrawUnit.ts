import { ClickType } from "../ClickType";
import { Connector } from "./Connector";
import { v4 as uuidv4 } from 'uuid';

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

    private _uuid: String;
    get uuid(): String {
        return this._uuid;
    }

    constructor() {
        this._uuid = uuidv4();
    }

    protected _isSelected: boolean = false;
    abstract get isSelected(): boolean;
    abstract set isSelected(value: boolean);

    abstract draw(ctx: CanvasRenderingContext2D): void;
    abstract checkIsClicked(clickPosition: Position): ClickResponse;
    abstract compileToCpp(descripter: string[]): string;
    abstract convertToSafeRecord(): string;

    abstract get OutConnections(): Connector[];
    abstract get InConnections(): Connector[];
} 