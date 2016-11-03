import interact = require('interact.js');


var pixelSize = 10, placeSize = pixelSize + 2;
var placesCount = {
    x : 0,
    y : 0,
    allPlaces : function(): number {
        return this.x * this.y;
    }
};

var places = {
    begin :  {x: 0, y: 0},
    end:  {x: 0, y: 0}
};


var dragStart:InteractEvent, dragEnd:InteractEvent;
var canvas = <HTMLCanvasElement> document.getElementById('canvas');
canvas.width = document.body.clientWidth;
canvas.height = window.innerHeight * 0.7;

var context = canvas.getContext('2d');

interact('#canvas')
    .draggable({
        snap: {
            targets: [ interact.createSnapGrid({
                x: placeSize, y: placeSize
            }) ]
        },
        maxPerElement: Infinity
    })
    .on('dragstart', function (event: InteractEvent) {
        dragStart = event;
        context.fillRect(dragStart.pageX - pixelSize / 2, dragStart.pageY - pixelSize / 2, pixelSize, pixelSize);
    })
    .on('dragmove', function (event: InteractEvent) {
        dragEnd = event;
        placesCount.x = (dragStart.pageX - dragEnd.pageX)/ (placeSize);
        placesCount.y = (dragStart.pageY - dragEnd.pageY)/ (placeSize);


        console.log(dragStart.pageX, dragStart.pageY, dragEnd.pageX, dragEnd.pageY);


        places.begin.x = Math.min(dragStart.pageX, dragEnd.pageX);
        places.begin.y = Math.min(dragStart.pageY, dragEnd.pageY);
        places.end.x = Math.max(dragStart.pageX, dragEnd.pageX);
        places.end.y = Math.max(dragStart.pageY, dragEnd.pageY);

        console.log(places.begin.x, places.begin.y, places.end.x, places.end.y);

        drawSquares();
    })
    .on('doubletap', function (event: InteractEvent) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    });

function drawSquares() : void{
    context.fillRect(dragEnd.pageX - pixelSize / 2, dragEnd.pageY - pixelSize / 2,
                 pixelSize, pixelSize);
}
