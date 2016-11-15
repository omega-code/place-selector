import interact = require('interact.js');

import { Area, Coords } from './Area';
import { Rect } from './Rect';

export class SeatSelector {
    private pixelSize: number;
    private placeSize: number;
    private canv: HTMLCanvasElement;
    private canvOffset: Coords;
    private ctx: CanvasRenderingContext2D;
    //Seatings array
    private seats: Rect[];
    private selectedArea: Area;
    private dragStartCoords: Coords;
    private dragEndCoords: Coords;
    private placesCount = {
        x: 0,
        y: 0,
        allPlaces: function(this: any): number {
            return this.x * this.y;
        }
    };
    private grid: SnapFunction;

    private mode: number;

    constructor(canvas: HTMLCanvasElement, pixelSize: number, placeSize: number) {
        const self = this;
        self.mode = 1;
        //Temporary mode selector
        this.initMode();

        self.pixelSize = pixelSize;
        self.placeSize = placeSize;
        self.selectedArea = {
            begin: new Coords,
            end: new Coords
        }
        self.dragStartCoords = new Coords;
        self.dragEndCoords = new Coords;
        self.seats = [];
        self.canv = canvas;
        self.canvOffset = new Coords;
        self.grid = interact.createSnapGrid({
            x: self.placeSize, y: self.placeSize
        });
        self.canvOffset.x = canvas.getBoundingClientRect().top;
        self.canvOffset.y = canvas.getBoundingClientRect().left;
        try {
            self.ctx = <CanvasRenderingContext2D> this.canv.getContext('2d');
            if(self.ctx == null) throw Error;
            this.initInteract();
        } catch(error) {
            console.log("Wrong context type");
        }
    }
    private initMode() {
        const self = this;
        document.addEventListener("keypress", function(event : KeyboardEvent) {
          self.mode = event.which - 48;
          if(self.mode == 1) {
                interact(self.canv).draggable({
                snap: {
                    targets: [ self.grid ]
                },
            });
          }
          else if(self.mode == 2) {
              interact(self.canv).draggable({
                  snap: false
              });
          }
          self.selectedArea.begin.reset();
          self.selectedArea.end.reset();

          self.clearCanvas();
          self.renderSeats();
          self.renderInfo();
        });
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
            .on('doubletap', function () {
                self.seats = [];
                self.clearCanvas();
            })
            .on('tap', function (event: InteractEvent) {
                if(self.mode == 2) {
                    const mouseX = event.clientX - self.canvOffset.x;
                    const mouseY = event.clientY - self.canvOffset.y;
                    for (let i = 0; i < self.seats.length; i++) {
                        if (self.seats[i].isPointInside(new Coords(mouseX, mouseY))) {
                            self.seats[i].setColor('#66ff99');
                        }
                    }
                }
            });
    }
    private renderSeats(): void {
        for(let seat of this.seats)
            seat.draw();
    }
    private createSeats(): void {
        this.clearCanvas();
        this.seats = [];
        for(let i = this.selectedArea.begin.x, id = 1; i < this.selectedArea.end.x; i += this.placeSize)
            for(let j = this.selectedArea.begin.y; j < this.selectedArea.end.y; j += this.placeSize) {
                this.seats.push(new Rect(id++, i, j, this.pixelSize, this.pixelSize, 'green', this.ctx));
            }
        this.renderSeats();
    }
    public renderInfo(): void {
        let mode = '';
        switch (this.mode) {
            case 1:
                mode = "Draw";
                break;
            case 2:
                mode = "Select";
                break;
        }
        this.ctx.fillStyle = "#00F";
        this.ctx.font = "italic 30pt Arial";
        this.ctx.fillText("Mode: " + mode, 20 + this.canvOffset.x, 30 + this.canvOffset.y);
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
        this.dragStartCoords.x = event.pageX;
        this.dragStartCoords.y = event.pageY;
    }
    private dragMove(event: InteractEvent): void {
        this.dragEndCoords.x = event.pageX;
        this.dragEndCoords.y = event.pageY;




        this.selectedArea.begin.x = Math.min(this.dragStartCoords.x, this.dragEndCoords.x) - this.canvOffset.x;
        this.selectedArea.begin.y = Math.min(this.dragStartCoords.y, this.dragEndCoords.y) - this.canvOffset.y;
        this.selectedArea.end.x = Math.max(this.dragStartCoords.x, this.dragEndCoords.x) - this.canvOffset.x;
        this.selectedArea.end.y = Math.max(this.dragStartCoords.y, this.dragEndCoords.y) - this.canvOffset.y;

        if(this.mode == 1) {
            this.placesCount.x = Math.abs( (this.dragStartCoords.x - this.dragEndCoords.x) / (this.placeSize) );
            this.placesCount.y = Math.abs( (this.dragStartCoords.y - this.dragEndCoords.y) / (this.placeSize) );

            this.createSeats();
        } else if(this.mode == 2) {
            this.clearCanvas();

            for(let seat of this.seats)
                if(seat.isInsideArea(this.selectedArea) == true) {
                    console.log ( 'Selected seats:' + seat.id );
                    seat.setColor('#66ff99');
                } else {
                    seat.setColor('green');
                }
            this.selectionFrameRender();
        }
        this.renderInfo();
        this.log();
    }
    private dragEnd(): void {
        this.clearCanvas();
        this.renderSeats();
        this.renderInfo();
    }
    private log(): void {
        console.log(this.selectedArea.begin, this.selectedArea.end);
        console.log('x:', this.placesCount.x, 'y:',  this.placesCount.y, 'all:', this.placesCount.allPlaces());
        console.log(this.seats);
    }

}
