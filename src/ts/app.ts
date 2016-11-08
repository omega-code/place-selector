import interact = require('interact.js');

interface Coords {
    x : number;
    y : number;
}
interface SelectedPlaces {
    begin : Coords;
    end : Coords;
}
class SeatSelector {
    private pixelSize : number;
    private placeSize : number;
    private canv : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;
    private places : SelectedPlaces;
    private dragStartEvent : InteractEvent;
    private dragEndEvent : InteractEvent;
    private placesCount = {
        x : 0,
        y : 0,
        allPlaces : function(this : any) : number {
            return this.x * this.y;
        }
    };

    constructor(canvas : HTMLCanvasElement, pixelSize : number, placeSize : number) {
        const self = this;
        self.pixelSize = pixelSize;
        self.placeSize = placeSize;
        self.places = {
            begin : {x : 0, y : 0},
            end : {x : 0, y : 0}
        }
        self.canv = canvas;
        try {
            self.ctx = <CanvasRenderingContext2D> canv.getContext('2d');
            if(self.ctx == null) throw Error;
            interact(self.canv)
                .draggable({
                    snap : {
                        targets : [ interact.createSnapGrid({
                            x : placeSize, y : placeSize
                        }) ]
                    },
                    maxPerElement : Infinity
                })
                .on('dragstart', function (event : InteractEvent) {
                    self.dragStart(event);
                })
                .on('dragmove', function (event : InteractEvent) {
                    self.dragMove(event);
                })
                .on('doubletap', function () {
                    self.ctx.clearRect(0, 0, self.ctx.canvas.width, self.ctx.canvas.height);
                });
            } catch(error) {
                console.log("Wrong context type");
          }
    }
    private drawSquares() : void {
        this.ctx.fillRect(this.dragEndEvent.pageX - this.pixelSize / 2, this.dragEndEvent.pageY -
            this.pixelSize / 2, this.pixelSize, this.pixelSize);
    }
    private dragStart(event : InteractEvent) : void {
        this.dragStartEvent = event;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillRect(this.dragStartEvent.pageX - this.pixelSize / 2, this.dragStartEvent.pageY - this.pixelSize / 2, this.pixelSize, this.pixelSize);
    }
    private dragMove(event : InteractEvent) : void {
        this.dragEndEvent = event;

        this.placesCount.x = Math.abs( (this.dragStartEvent.pageX - this.dragEndEvent.pageX) / (this.placeSize) ) + 1;
        this.placesCount.y = Math.abs( (this.dragStartEvent.pageY - this.dragEndEvent.pageY) / (this.placeSize) ) + 1;

        this.places.begin.x = Math.min(this.dragStartEvent.pageX, this.dragEndEvent.pageX);
        this.places.begin.y = Math.min(this.dragStartEvent.pageY, this.dragEndEvent.pageY);
        this.places.end.x = Math.max(this.dragStartEvent.pageX, this.dragEndEvent.pageX);
        this.places.end.y = Math.max(this.dragStartEvent.pageY, this.dragEndEvent.pageY);

        this.log();

        this.drawSquares();
    }
    private log() : void {
        console.log(this.places.begin, this.places.end);
        console.log('x:', this.placesCount.x, 'y:',  this.placesCount.y, 'all:', this.placesCount.allPlaces());
    }
}

const canv = document.createElement("canvas");
document.body.appendChild(canv);
canv.width = document.body.clientWidth;
canv.height = window.innerHeight * 0.7;

/*const auditorium = */ new SeatSelector(canv, 10, 15);
