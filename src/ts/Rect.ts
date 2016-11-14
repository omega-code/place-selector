export class Rect {

    constructor(private _id: number, private x: number, private y: number, private width: number, private height: number, private fill: string, private ctx: CanvasRenderingContext2D) {}
    public draw(): void {
        this.ctx.fillStyle = this.fill;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.restore();
    }
    public isPointInside(point: Coords): boolean {
        return (point.x >= this.x && point.x <= this.x + this.width && point.y >= this.y && point.y <= this.y + this.height);
    }
    public isInsideArea(area: Area): boolean {
        if(this.x >= area.begin.x && this.x <= area.end.x && this.y >= area.begin.y && this.y <= area.end.y)
            if(this.x + this.width >= area.begin.x && this.x + this.width <= area.end.x && this.y + this.height >= area.begin.y && this.y + this.height <= area.end.y) return true;
        return false;
    }

    public setColor(fill: string): void {
        this.fill = fill;
        this.draw();
    }
    get id() {
        return this._id;
    }
};
