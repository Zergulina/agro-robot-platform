
import { BasicBinaryOperation } from "../BasicNodes/BasicBinaryOperation";

export class ImplNode extends BasicBinaryOperation {
    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);
        ctx.font = "16px Arial";
        ctx.fillText(`IMPL`, this._position.x - 18, this._position.y - 26);
    }

    compileToCpp(descripter: string[]): string {
        if (descripter.length != 2) {
            throw new Error(`Ошибка в размерности дескриптора для компиляции на С++ класса ${typeof(this)}`);
        }

        return `!(${descripter[0]}) || ${descripter[1]}`
    }
}