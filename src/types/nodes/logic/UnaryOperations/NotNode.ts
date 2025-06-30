import { BasicUnaryOperation } from "../BasicNodes/BasicUnaryOperation";

export class NotNode extends BasicUnaryOperation {
    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);
        ctx.font = "16px Arial";
        ctx.fillText(`NOT`, this._position.x - 15, this._position.y - 26);
    }

    compileToCpp(descripter: string[]): string {
        if (descripter.length != 1) {
            throw new Error(`Ошибка в размерности дескриптора для компиляции на С++ класса ${typeof (this)}`);
        }

        return `!${descripter[0]}`
    }
}0