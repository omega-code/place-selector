import { Area, Coords } from './Coords';

export class Rect {
    constructor
        ( readonly id: number
        , private x: number
        , private y: number
        , private width: number
        , private height: number
        , readonly defaultColor: string
        , readonly selectionColor: string
        , private selected: boolean
        , private ctx: CanvasRenderingContext2D
    ) {}

    draw(): void {
        this.ctx.fillStyle = this.selected ? this.selectionColor : this.defaultColor ;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.restore();
    }
    isPointInside(point: Coords): boolean {
        return this.leftTop.isBeforeOrEqual(point) && this.rightBottom.isAfterOrEqual(point);
    }
    isInsideArea(area: Area): boolean {
        return(
            this.leftTop.isAfterOrEqual(area.begin) && this.rightBottom.isBeforeOrEqual(area.end)
        );
    }
    toggleSelect(): void {
        this.selected = this.selected ?  false : true;
    }

    get leftTop(): Coords {
        return new Coords(this.x, this.y);
    }
    get rightBottom(): Coords {
        return new Coords (
            this.x + this.width,
            this.y + this.height
        )
    }
};
