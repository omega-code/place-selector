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
    readonly rowNumber: number;
    readonly placeInRowNumber: number;
    readonly isReserved: boolean;
    readonly reservedBy: string;
    private selected: boolean;
    readonly rect: Rect;

    constructor(id: number, x: number, y: number, size: number, ctx: CanvasRenderingContext2D) {
        this.id = id;
        this.selected = false;
        this.rect = new Rect(x, y, size, size, 'green', '#66ff99', ctx);
        //TODO
        this.rowNumber = 0;
        this.placeInRowNumber = 0;
        this.isReserved = false;
        this.reservedBy = '';
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
    toJSON(): IPlace {
        return {
            id: this.id.toString(),
            graphicalPosition: { x: this.rect.x, y: this.rect.y },
            rowNumber: this.rowNumber,
            placeInRowNumber: this.placeInRowNumber,
            isReserved: this.isReserved,
            reservedBy: this.reservedBy,
        }
    }
};
