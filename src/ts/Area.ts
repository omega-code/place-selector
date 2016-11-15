class Coords {
    constructor(public x = 0, public y = 0) {}

    isAfterOrEqual(point: Coords): boolean {
        return ( this.x >= point.x && this.y >= point.y );
    }
    isBeforeOrEqual(point: Coords): boolean {
        return(this.x <= point.x &&  this.y <= point.y);
    }
    reset(): void {
        this.x = this.y = 0;
    }
}
interface Area {
    begin: Coords;
    end: Coords;
}
export { Coords, Area }
