import interact = require('interact.js');

import { Area, Coords } from './Coords';
import { Seat, IPlace } from './Seat';
import { TransformContext } from './TransformContext';


interface ISeatSelector {
  seats: IPlace[];
}

export const enum Mode {
    Draw = 1,
    Select,
    DragSeats,
    Delete,
    DragCanvas
};

export class SeatSelector {
    private pixelSize: number;
    private placeSize: number;
    private canv: HTMLCanvasElement;
    private canvOffset: Coords;
    private ctx: CanvasRenderingContext2D;
    private transformContext: TransformContext;
    //Seatings array
    private allSeats = [] as Seat[];
    private newSeats = [] as Seat[];
    private selectedArea: Area;
    private dragStartCoords: Coords;
    private dragEndCoords: Coords;
    private grid: SnapFunction;
    private nextId = 1;
    private readonly scaleFactor = 1.1;
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


        self.transformContext = new TransformContext(self.ctx);
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
                if (self.mode === Mode.Select) {
                    const clickCoords = self.transformContext.transformedPointCoords(
                        event.pageX - self.canvOffset.x,
                        event.pageY - self.canvOffset.y
                    );
                    for (const seat of self.allSeats) {
                        if (seat.rect.isPointInside(clickCoords)) {
                            seat.toggleSelect();
                            self.renderSeats();
                        }
                    }
                }
            });
    }
    private renderSeats(): void {
        this.clearCanvas();
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

    public scaleUp(): void {
        const width = this.canv.width / 2;
        const height = this.canv.height / 2;
        this.transformContext.zoom(this.scaleFactor, new Coords(width, height));
        this.renderSeats();
    }

    public scaleDown(): void {
        const width = this.canv.width / 2;
        const height = this.canv.height / 2;
        this.transformContext.zoom(1 / this.scaleFactor, new Coords(width, height));
        this.renderSeats();
    }

    private createSeats(): void {
        this.clearCanvas();
        let isBusy = false;
        this.newSeats = [];

        this.selectedArea.begin = this.roundToPlaces(this.selectedArea.begin);
        this.selectedArea.end = this.roundToPlaces(this.selectedArea.end);

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

        if (this.mode === Mode.Draw) {
              interact(this.canv).draggable({
              snap: {
                  targets: [ this.grid ]
              },
          });
        }
        else if (this.mode === Mode.Select || this.mode === Mode.Delete) {
            interact(this.canv).draggable({
                snap: false
            });
        }

        this.selectedArea.begin = this.selectedArea.end = Coords.empty;
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
        this.ctx.clearRect(0, 0, this.canv.width, this.canv.height);
        this.transformContext.restore();
    }

    private dragStart(event: InteractEvent): void {

        if(this.mode === Mode.Select) {
            const clickCoords = this.transformContext.transformedPointCoords(
                event.pageX - this.canvOffset.x,
                event.pageY - this.canvOffset.y
            );

            for (const seat of this.allSeats) {
                if (seat.rect.isPointInside(clickCoords))
                    if (seat.isSelected) {
                        this.mode = Mode.DragSeats;
                        break;
                    }
            }
        }

        if(this.mode === Mode.DragSeats) {
            interact(this.canv).draggable({
                snap: {
                    targets: [ this.grid ]
                },
            });
        } else {
            if(!event.shiftKey) for (const seat of this.allSeats) seat.unselect();
        }

        this.dragStartCoords = this.transformContext.transformedPointCoords(
            event.pageX - this.canvOffset.x,
            event.pageY - this.canvOffset.y
        );
    }

    private dragMove(event: InteractEvent): void {
        this.dragEndCoords = this.transformContext.transformedPointCoords(
            event.pageX - this.canvOffset.x,
            event.pageY - this.canvOffset.y
        );

        this.calculateSelectedArea();
        this.clearCanvas();

        if (this.mode === Mode.Draw) {
            this.createSeats();
        } else if (this.mode === Mode.Select || this.mode === Mode.Delete) {
            this.renderSeats();
            this.selectionFrameRender();
        } else if (this.mode === Mode.DragSeats) {
            let movedOn = new Coords(this.dragEndCoords.x - this.dragStartCoords.x,
                this.dragEndCoords.y - this.dragStartCoords.y).roundToScale(this.placeSize);
            this.renderUnselectedSeats();
            for (let seat of this.allSeats) {
                if(seat.isSelected)
                    seat.rect.moveOn( new Coords(movedOn.x, movedOn.y) )
            }
        } else if (this.mode === Mode.DragCanvas) {
            interact(this.canv).draggable({
                snap: false
            });

            this.transformContext.translate(this.dragEndCoords.x - this.dragStartCoords.x, this.dragEndCoords.y - this.dragStartCoords.y);
            this.renderSeats();
        }
    }

    private dragEnd(): void {
        if(this.mode === Mode.Draw) {
            this.allSeats = this.allSeats.concat(this.newSeats);
            this.newSeats = [];
        }
        if (this.mode === Mode.Select) this.checkSelectedSeats();
        if (this.mode === Mode.Delete) this.deleteSeatsInArea(this.selectedArea);
        if (this.mode === Mode.DragSeats) {
            let movedOn = new Coords(this.dragEndCoords.x - this.dragStartCoords.x,
                this.dragEndCoords.y - this.dragStartCoords.y).roundToScale(this.placeSize);
            let save = (!this.isOverlaped(movedOn));

            this.renderUnselectedSeats();
            for (let seat of this.allSeats) {
                if(seat.isSelected)
                    seat.rect.moveOn( new Coords(movedOn.x, movedOn.y), save )
            }

            this.mode = Mode.Select;
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
        return new Coords (
            Math.min(point1.x, point2.x),
            Math.min(point1.y, point2.y)
        );
    }

    private findRightBottomCoord(point1: Coords, point2: Coords): Coords {
        return new Coords (
            Math.max(point1.x, point2.x),
            Math.max(point1.y, point2.y)
        );
    }

    private roundToPlaces(point: Coords) {
        return new Coords (
            Math.round(point.x / this.placeSize) * this.placeSize,
            Math.round(point.y / this.placeSize) * this.placeSize)
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

        this.renderSeats();
    }

    public deleteSeatsInArea(area: Area): void {
        let oldSeats = this.allSeats
        this.allSeats = [];
        for (const seat of oldSeats) {
            if (!seat.rect.isInsideArea(area))
                this.allSeats.push(seat);
        }
        oldSeats = [];

        this.renderSeats();
    }

    public toJSON(): ISeatSelector {
        return { seats: this.allSeats.map(seat => seat.toJSON()) };
    }
}
