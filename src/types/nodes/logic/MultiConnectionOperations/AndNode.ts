
import { BasicMultiConnectionOperation } from "../BasicNodes/BasicMultiConnectionOperation";

export class AndNode extends BasicMultiConnectionOperation  {
    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);
        ctx.font = "16px Arial";
        ctx.fillText(`AND`, this._position.x - 15, this._position.y - this._height / 2 + 26);
    }

    compileToCpp(descripter: string[]): string {
        if (descripter.length < 2) {
            throw new Error(`Ошибка в размерности дескриптора для компиляции на С++ класса ${typeof(this)}`);
        }

        return descripter.join(" && ");
    }
}