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
    private draw() : void {
        this.ctx.fillStyle = this.fill;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.restore();
    }
    public isPointInside(x : number, y : number) : boolean {
        return (x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height);
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
interface SelectedPlaces {
    begin : Coords;
    end : Coords;
}
class SeatSelector {
    private pixelSize : number;
    private placeSize : number;
    private canv : HTMLCanvasElement;
    private canvPosition : Coords;
    private ctx : CanvasRenderingContext2D;
    //Seatings array
    private seats : Rect[];
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

    private mode : number;

    constructor(canvas : HTMLCanvasElement, pixelSize : number, placeSize : number) {
        const self = this;
        self.mode = 1;
        //Temporary mode selector
        document.addEventListener("keypress", function(event) {
          self.mode = event.which - 48;
          self.drawSquares();
          self.drawInfo();
        });

        self.pixelSize = pixelSize;
        self.placeSize = placeSize;
        self.places = {
            begin : {x : 0, y : 0},
            end : {x : 0, y : 0}
        }
        self.seats = [];
        self.canv = canvas;
        self.canvPosition = {
            x : 0,
            y : 0
        };

        self.canvPosition.x = canvas.getBoundingClientRect().top;
        self.canvPosition.y = canvas.getBoundingClientRect().left;
        try {
            self.ctx = <CanvasRenderingContext2D> canv.getContext('2d');
            if(self.ctx == null) throw Error;
            self.ctx.fillStyle = "green";
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
                    if(self.mode == 1)
                        self.dragStart(event);
                })
                .on('dragmove', function (event : InteractEvent) {
                    if(self.mode == 1)
                        self.dragMove(event)
                })
                .on('doubletap', function () {
                    self.seats = [];
                    self.ctx.clearRect(0, 0, self.ctx.canvas.width, self.ctx.canvas.height);
                })
                .on('tap', function (event : InteractEvent) {
                    if(self.mode == 2){
                        const mouseX = event.clientX - self.canvPosition.x;
                        const mouseY = event.clientY - self.canvPosition.y;
                        for (let i = 0; i < self.seats.length; i++) {
                            if (self.seats[i].isPointInside(mouseX, mouseY)) {
                                self.seats[i].setColor('yellow');
                            }
                        }
                    }
                });
            } catch(error) {
                console.log("Wrong context type");
          }
    }
    private drawSquares() : void {
        let id = 1;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.seats = [];
        for(let i = this.places.begin.x; i <= this.places.end.x; i += this.placeSize)
            for(let j = this.places.begin.y; j <= this.places.end.y; j += this.placeSize) {
                this.seats.push(new Rect(id++, i, j, this.pixelSize, this.pixelSize, 'green', this.ctx));
            }
    }
    private drawInfo() : void {
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
        this.ctx.fillText("Mode: " + mode, 20 + this.canvPosition.x, 30 + this.canvPosition.y);

}

    private dragStart(event : InteractEvent) : void {
        this.dragStartEvent = event;
    }
    private dragMove(event : InteractEvent) : void {
        this.dragEndEvent = event;

        this.placesCount.x = Math.abs( (this.dragStartEvent.pageX - this.dragEndEvent.pageX) / (this.placeSize) ) + 1;
        this.placesCount.y = Math.abs( (this.dragStartEvent.pageY - this.dragEndEvent.pageY) / (this.placeSize) ) + 1;

        this.places.begin.x = Math.min(this.dragStartEvent.pageX, this.dragEndEvent.pageX) - this.canvPosition.x;
        this.places.begin.y = Math.min(this.dragStartEvent.pageY, this.dragEndEvent.pageY) - this.canvPosition.y;
        this.places.end.x = Math.max(this.dragStartEvent.pageX, this.dragEndEvent.pageX) - this.canvPosition.x;
        this.places.end.y = Math.max(this.dragStartEvent.pageY, this.dragEndEvent.pageY) - this.canvPosition.y;

        this.drawSquares();
        this.drawInfo();
        this.log();
    }
    private log() : void {
        console.log(this.places.begin, this.places.end);
        console.log('x:', this.placesCount.x, 'y:',  this.placesCount.y, 'all:', this.placesCount.allPlaces());
        console.log(this.seats);
    }
}

const canv = document.createElement("canvas");
document.body.appendChild(canv);
canv.width = document.body.clientWidth;
canv.height = window.innerHeight * 0.7;

/*const auditorium = */ new SeatSelector(canv, 30, 45);
