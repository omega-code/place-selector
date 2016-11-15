import { Area, Coords } from './Area';

export class Rect {
    constructor(readonly id: number, private x: number, private y: number, private width: number, private height: number, private fill: string, private ctx: CanvasRenderingContext2D) {}
    
    public draw(): void {
        this.ctx.fillStyle = this.fill;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.restore();
    }
    public isPointInside(point: Coords): boolean {
        return this.leftTop.isBeforeOrEqual(point) && this.rightBottom.isAfterOrEqual(point);
    }
    public isInsideArea(area: Area): boolean {
        return( this.leftTop.isAfterOrEqual(area.begin) && this.rightBottom.isBeforeOrEqual(area.end) );
    }
    public setColor(fill: string): void {
        this.fill = fill;
        this.draw();
    }
    private get leftTop(): Coords {
        return new Coords(this.x, this.y);
    }
    private get rightBottom(): Coords {
        return new Coords (
            this.x + this.width,
            this.y + this.height
        )

    }
};
