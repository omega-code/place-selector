import { Rect } from './Rect';

export interface IPlace {
  id: string;
  graphicalPosition: { x: number; y: number };
  rowNumber: number;
  placeInRowNumber: number;
  isReserved: boolean;
  reservedBy: string;
}

export class Seat {
    readonly id: number;
    readonly rowNumber = 0;
    readonly placeInRowNumber = 0;
    readonly isReserved = false;
    readonly reservedBy = '';
    private selected: boolean;
    readonly rect: Rect;

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
    get isSelected() {
        return this.selected;
    }
    toJSON(): IPlace {
        return {
            id: this.id.toString(),
            graphicalPosition: this.rect.leftTop,
            rowNumber: this.rowNumber,
            placeInRowNumber: this.placeInRowNumber,
            isReserved: this.isReserved,
            reservedBy: this.reservedBy,
        }
    }
};
