
import { BasicBinaryOperation } from "../BasicNodes/BasicBinaryOperation";

export class MoreEqNode extends BasicBinaryOperation  {
    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);
        ctx.fillStyle="white"
        ctx.font = "16px Arial";
        ctx.fillText(`>=`, this._position.x - 10, this._position.y - 26);
    }

    compileToCpp(descripter: string[]): string {
        if (descripter.length != 2) {
            throw new Error(`Ошибка в размерности дескриптора для компиляции на С++ класса ${typeof(this)}`);
        }

        return `${descripter[0]} >= ${descripter[1]}`
    }

    convertToSafeRecord(): string {
        const data = {
            nodeType: "MoreEqNode",
            positionX: this.position.x,
            positionY: this.position.y,
        }

        return JSON.stringify(data);
    }
}