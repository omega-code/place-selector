import { Rect } from './Rect';

export class Seat {
    readonly id: number;
    readonly rect: Rect;
    private selected: boolean;
    constructor(id: number, x: number, y: number, size: number, ctx: CanvasRenderingContext2D) {
        this.id = id;
        this.selected = false;
        this.rect = new Rect(x, y, size, size, 'green', '#66ff99', ctx);
    }
    draw(): void {
        this.rect.draw(this.selected);
    }
    toggleSelect(): void {
        this.selected = this.selected ?  false : true;
    }
    isSelected() {
        return this.selected;
    }
};
