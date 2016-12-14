import interact = require('interact.js');

import { Area, Coords } from './Coords';
import { Seat, IPlace } from './Seat';



interface ISeatSelector {
  seats: IPlace[];
}

export const enum Mode {
    draw = 1,
    select,
    drag,
    delete
};

export class SeatSelector {
    private pixelSize: number;
    private placeSize: number;
    private canv: HTMLCanvasElement;
    private canvOffset: Coords;
    private ctx: CanvasRenderingContext2D;
    //Seatings array
    private allSeats = [] as Seat[];
    private newSeats = [] as Seat[];
    private selectedArea: Area;
    private dragStartCoords: Coords;
    private dragEndCoords: Coords;
    private grid: SnapFunction;
    private nextId = 1;

    private mode: Mode;

    constructor(canvas: HTMLCanvasElement, pixelSize: number, placeSize: number) {
        const self = this;

        self.pixelSize = pixelSize;
        self.placeSize = placeSize;
        self.selectedArea = {
            begin: Coords.empty,
            end: Coords.empty
        }
        self.dragStartCoords = Coords.empty;
        self.dragEndCoords = Coords.empty;
        self.canv = canvas;
        self.canvOffset = new Coords(
            canvas.getBoundingClientRect().left,
            canvas.getBoundingClientRect().top
        );
        self.grid = interact.createSnapGrid({
            x: self.placeSize, y: self.placeSize
        });

        self.ctx = <CanvasRenderingContext2D> this.canv.getContext('2d');
        if (self.ctx === null) throw Error;
        this.initInteract();
    }
    private initInteract() {
        const self = this;
        interact(self.canv)
            .draggable({
                snap: {
                    targets: [ self.grid ]
                },
                maxPerElement: Infinity
            })
            .on('dragstart', function (event: InteractEvent) {
                self.dragStart(event);
            })
            .on('dragmove', function (event: InteractEvent) {
                self.dragMove(event);
            })
            .on('dragend', function () {
                self.dragEnd();
            })
            .on('tap', function (event: InteractEvent) {
                if (self.mode === Mode.select) {
                    const mouseClick = new Coords (
                        event.clientX - self.canvOffset.x,
                        event.clientY - self.canvOffset.y
                    );
                    for (const seat of self.allSeats) {
                        if (seat.rect.isPointInside(mouseClick)) {
                            seat.toggleSelect();
                            self.renderSeats();
                        }
                    }
                }
            });
    }
    private renderSeats(): void {
        for (const seat of this.allSeats)
            seat.draw();
        for (const seat of this.newSeats)
            seat.draw();
    }
    private renderUnselectedSeats(): void {
        for (const seat of this.allSeats)
            if (!seat.isSelected)
                seat.draw();
    }
    private createSeats(): void {
        this.clearCanvas();
        let isBusy = false;
        this.newSeats = [];
        for (let i = this.selectedArea.begin.x; i < this.selectedArea.end.x; i += this.placeSize)
            for (let j = this.selectedArea.begin.y; j < this.selectedArea.end.y; j += this.placeSize) {
                for (const seat of this.allSeats)
                    if (seat.rect.leftTop.isEqual( new Coords(i, j) )) {
                        isBusy = true;
                        break;
                    }
                if (!isBusy) this.newSeats.push(new Seat(this.nextId++, i, j, this.pixelSize, this.ctx));
                isBusy = false;
            }
        this.renderSeats();
    }
    public changeMode(mode: Mode): void {
        this.mode = mode;

        if (this.mode === Mode.draw) {
              interact(this.canv).draggable({
              snap: {
                  targets: [ this.grid ]
              },
          });
        }
        else if (this.mode === Mode.select || this.mode === Mode.delete) {
            interact(this.canv).draggable({
                snap: false
            });
        }

        this.selectedArea.begin = this.selectedArea.end = Coords.empty;
        this.clearCanvas();
        this.renderSeats();
    }
    private selectionFrameRender() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.selectedArea.begin.x,this.selectedArea.begin.y);
        this.ctx.lineTo(this.selectedArea.end.x,this.selectedArea.begin.y);
        this.ctx.lineTo(this.selectedArea.end.x,this.selectedArea.end.y);
        this.ctx.lineTo(this.selectedArea.begin.x,this.selectedArea.end.y);
        this.ctx.closePath();
        this.ctx.restore();
        this.ctx.strokeStyle = 'yellow';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    private clearCanvas() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    private dragStart(event: InteractEvent): void {

        if(this.mode === Mode.select) {
            const mouseClick = new Coords (
                event.clientX - this.canvOffset.x,
                event.clientY - this.canvOffset.y
            );
            for (const seat of this.allSeats) {
                if (seat.rect.isPointInside(mouseClick))
                    if (seat.isSelected) {
                        this.mode = Mode.drag;
                        break;
                    }
            }
        }

        if(this.mode === Mode.drag) {
            interact(this.canv).draggable({
                snap: {
                    targets: [ this.grid ]
                },
            });
        } else {
            if(!event.shiftKey) for (const seat of this.allSeats) seat.unselect();
        }
        this.dragStartCoords = new Coords(event.pageX, event.pageY);
    }
    private dragMove(event: InteractEvent): void {
        this.dragEndCoords = new Coords(event.pageX, event.pageY);

        this.calculateSelectedArea();
        this.clearCanvas();

        if (this.mode === Mode.draw) {
            this.createSeats();
        } else if (this.mode === Mode.select || this.mode === Mode.delete) {
            this.renderSeats();
            this.selectionFrameRender();
        }
        else if (this.mode === Mode.drag) {
            let movedOn = new Coords(this.dragEndCoords.x - this.dragStartCoords.x,
                this.dragEndCoords.y - this.dragStartCoords.y).roundToScale(this.placeSize);
            this.renderUnselectedSeats();
            for (let seat of this.allSeats) {
                if(seat.isSelected)
                    seat.rect.moveOn( new Coords(movedOn.x, movedOn.y) )
            }
        }
    }
    private dragEnd(): void {
        if(this.mode === Mode.draw) {
            this.allSeats = this.allSeats.concat(this.newSeats);
            this.newSeats = [];
        }
        if (this.mode === Mode.select) this.checkSelectedSeats();
        if (this.mode === Mode.delete) this.deleteSeatsInArea(this.selectedArea);
        if (this.mode === Mode.drag) {
            let movedOn = new Coords(this.dragEndCoords.x - this.dragStartCoords.x,
                this.dragEndCoords.y - this.dragStartCoords.y).roundToScale(this.placeSize);
            let save = (!this.isOverlaped(movedOn));

            this.renderUnselectedSeats();
            for (let seat of this.allSeats) {
                if(seat.isSelected)
                    seat.rect.moveOn( new Coords(movedOn.x, movedOn.y), save )
            }

            this.mode = Mode.select;
            interact(this.canv).draggable({
                snap: false
            });
        }
        this.clearCanvas();
        this.renderSeats();
    }
    private calculateSelectedArea(): void {
        this.selectedArea.begin = this.findLeftTopCoord(this.dragStartCoords, this.dragEndCoords);
        this.selectedArea.end = this.findRightBottomCoord(this.dragStartCoords, this.dragEndCoords);
    }
    private findLeftTopCoord(point1: Coords, point2: Coords): Coords {
        const leftTop = new Coords (
            Math.min(point1.x, point2.x) - this.canvOffset.x,
            Math.min(point1.y, point2.y) - this.canvOffset.y
        );
        return leftTop;
    }
    private findRightBottomCoord(point1: Coords, point2: Coords): Coords {
        const rightBottom = new Coords (
            Math.max(point1.x, point2.x) - this.canvOffset.x,
            Math.max(point1.y, point2.y) - this.canvOffset.y
        );
        return rightBottom;
    }
    private isOverlaped(movedOn: Coords): boolean {
        let x = 0;
        let y = 0;

        for (let seat of this.allSeats)
            if(seat.isSelected) {
                x = seat.rect.leftTop.x + movedOn.x;
                y = seat.rect.leftTop.y + movedOn.y;
                for (let seat of this.allSeats) {
                    if (!seat.isSelected)
                        if (seat.rect.leftTop.x === x && seat.rect.leftTop.y === y) return true;
                }
            }
        return false;
    }
    private checkSelectedSeats() {
        for (const seat of this.allSeats)
            if (seat.rect.isInsideArea(this.selectedArea))
                seat.toggleSelect()
    }
    public deleteSelected() {
        let oldSeats = this.allSeats
        this.allSeats = [];
        for (const seat of oldSeats) {
            if (!seat.isSelected)
                this.allSeats.push(seat);
        }
        oldSeats = [];

        this.clearCanvas();
        this.renderSeats();
    }
    public deleteSeatsInArea(area: Area) {
        let oldSeats = this.allSeats
        this.allSeats = [];
        for (const seat of oldSeats) {
            if (!seat.rect.isInsideArea(area))
                this.allSeats.push(seat);
        }
        oldSeats = [];

        this.clearCanvas();
        this.renderSeats();
    }
    public toJSON(): ISeatSelector {
        return { seats: this.allSeats.map(seat => seat.toJSON()) };
    }
}
