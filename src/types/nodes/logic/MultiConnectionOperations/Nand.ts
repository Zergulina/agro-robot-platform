
import { BasicMultiConnectionOperation } from "../BasicNodes/BasicMultiConnectionOperation";

export class NandNode extends BasicMultiConnectionOperation  {
    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);
        ctx.font = "16px Arial";
        ctx.fillText(`NAND`, this._position.x - 15, this._position.y - this._height / 2 + 26);
    }

    compileToCpp(descripter: string[]): string {
        if (descripter.length != this.InConnections.length) {
            throw new Error(`Ошибка в размерности дескриптора для компиляции на С++ класса ${typeof(this)}`);
        }

        return `!(${descripter.join(" && ")})`
    }

    convertToSafeRecord(): string {
        const data = {
            nodeType: "NandNode",
            positionX: this.position.x,
            positionY: this.position.y,
            inConnectionsLength: this.InConnections.length,
        }

        return JSON.stringify(data);
    }
}