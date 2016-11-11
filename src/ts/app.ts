import interact = require('interact.js');

class Rect {
    private _id : number;
    private x : number;
    private y : number;
    private width : number;
    private height : number;
    private fill : string;
    private ctx : CanvasRenderingContext2D;

    constructor(id : number, x : number, y : number, width : number, height : number, fill : string, ctx : CanvasRenderingContext2D) {
        this._id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.fill = fill;
        this.ctx = ctx;
        this.draw();
    }
    public draw() : void {
        this.ctx.fillStyle = this.fill;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.restore();
    }
    public isPointInside(x : number, y : number) : boolean {
        return (x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height);
    }
    public isInsideArea(area : Area) : boolean {
        if(this.x >= area.begin.x && this.x <= area.end.x && this.y >= area.begin.y && this.y <= area.end.y)
            if(this.x + this.width >= area.begin.x && this.x + this.width <= area.end.x && this.y + this.height >= area.begin.y && this.y + this.height <= area.end.y) return true;
        return false;
    }

    public setColor(fill : string) : void {
        this.fill = fill;
        this.draw();
    }
    get id() {
        return this._id;
    }
};


interface Coords {
    x : number;
    y : number;
}
interface Area {
    begin : Coords;
    end : Coords;
}
class SeatSelector {
    private pixelSize : number;
    private placeSize : number;
    private canv : HTMLCanvasElement;
    private canvOffset : Coords;
    private ctx : CanvasRenderingContext2D;
    //Seatings array
    private seats : Rect[];
    private selectedArea : Area;
    private dragStartEvent : InteractEvent;
    private dragEndEvent : InteractEvent;
    private placesCount = {
        x : 0,
        y : 0,
        allPlaces : function(this : any) : number {
            return this.x * this.y;
        }
    };
    private grid : SnapFunction;

    private mode : number;

    constructor(canvas : HTMLCanvasElement, pixelSize : number, placeSize : number) {
        const self = this;
        self.mode = 1;
        //Temporary mode selector
        document.addEventListener("keypress", function(event) {
          self.mode = event.which - 48;
          if(self.mode == 1) {
                interact(self.canv).draggable({
                snap : {
                    targets : [ self.grid ]
                },
            });
          }
          else if(self.mode == 2) {
              interact(self.canv).draggable({
                  snap : false
              });
          }
          self.selectedArea = {
              begin : {x : 0, y : 0},
              end : {x : 0, y : 0}
          }
          self.clearCanvas();
          self.renderSeats();
          self.renderInfo();
        });

        self.pixelSize = pixelSize;
        self.placeSize = placeSize;
        self.selectedArea = {
            begin : {x : 0, y : 0},
            end : {x : 0, y : 0}
        }
        self.seats = [];
        self.canv = canvas;
        self.canvOffset = {
            x : 0,
            y : 0
        };
        self.grid = interact.createSnapGrid({
            x : self.placeSize, y : self.placeSize
        });
        self.canvOffset.x = canvas.getBoundingClientRect().top;
        self.canvOffset.y = canvas.getBoundingClientRect().left;
        try {
            self.ctx = <CanvasRenderingContext2D> canv.getContext('2d');
            if(self.ctx == null) throw Error;
            this.renderInfo();

            interact(self.canv)
                .draggable({
                    snap : {
                        targets : [ self.grid ]
                    },
                    maxPerElement : Infinity
                })
                .on('dragstart', function (event : InteractEvent) {
                    self.dragStart(event);
                })
                .on('dragmove', function (event : InteractEvent) {
                    self.dragMove(event);
                })
                .on('dragend', function () {
                    self.dragEnd();
                })
                .on('doubletap', function () {
                    self.seats = [];
                    self.clearCanvas();
                })
                .on('tap', function (event : InteractEvent) {
                    if(self.mode == 2) {
                        const mouseX = event.clientX - self.canvOffset.x;
                        const mouseY = event.clientY - self.canvOffset.y;
                        for (let i = 0; i < self.seats.length; i++) {
                            if (self.seats[i].isPointInside(mouseX, mouseY)) {
                                self.seats[i].setColor('#66ff99');
                            }
                        }
                    }
                });
            } catch(error) {
                console.log("Wrong context type");
          }
    }
    private renderSeats() : void {
        for(let seat of this.seats)
            seat.draw();
    }
    private createSeats() : void {
        this.clearCanvas();
        this.seats = [];
        for(let i = this.selectedArea.begin.x, id = 1; i < this.selectedArea.end.x; i += this.placeSize)
            for(let j = this.selectedArea.begin.y; j < this.selectedArea.end.y; j += this.placeSize) {
                this.seats.push(new Rect(id++, i, j, this.pixelSize, this.pixelSize, 'green', this.ctx));
            }
    }
    private renderInfo() : void {
        let mode = '';
        switch (this.mode) {
            case 1 :
                mode = "Draw";
                break;
            case 2 :
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
    private dragStart(event : InteractEvent) : void {
        this.dragStartEvent = event;
    }
    private dragMove(event : InteractEvent) : void {
        this.dragEndEvent = event;

        this.selectedArea.begin.x = Math.min(this.dragStartEvent.pageX, this.dragEndEvent.pageX) - this.canvOffset.x;
        this.selectedArea.begin.y = Math.min(this.dragStartEvent.pageY, this.dragEndEvent.pageY) - this.canvOffset.y;
        this.selectedArea.end.x = Math.max(this.dragStartEvent.pageX, this.dragEndEvent.pageX) - this.canvOffset.x;
        this.selectedArea.end.y = Math.max(this.dragStartEvent.pageY, this.dragEndEvent.pageY) - this.canvOffset.y;

        if(this.mode == 1) {
            this.placesCount.x = Math.abs( (this.dragStartEvent.pageX - this.dragEndEvent.pageX) / (this.placeSize) );
            this.placesCount.y = Math.abs( (this.dragStartEvent.pageY - this.dragEndEvent.pageY) / (this.placeSize) );

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
    private dragEnd() : void {
        this.clearCanvas();
        this.renderSeats();
        this.renderInfo();
    }
    private log() : void {
        console.log(this.selectedArea.begin, this.selectedArea.end);
        console.log('x:', this.placesCount.x, 'y:',  this.placesCount.y, 'all:', this.placesCount.allPlaces());
        console.log(this.seats);
    }
}

const canv = document.createElement("canvas");
document.body.appendChild(canv);
canv.width = document.body.clientWidth;
canv.height = window.innerHeight * 0.7;
canv.style.margin = "20px";

/*const auditorium = */ new SeatSelector(canv, 30, 45);
