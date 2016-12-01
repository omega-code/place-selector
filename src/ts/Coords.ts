class Coords {
    static empty = new Coords(0, 0);
    constructor(readonly x: number, readonly y: number) {}
    isAfterOrEqual(point: Coords): boolean {
        return ( this.x >= point.x && this.y >= point.y );
    }
    isBeforeOrEqual(point: Coords): boolean {
        return( this.x <= point.x && this.y <= point.y );
    }
    isEqual(point: Coords): boolean {
        return( this.x === point.x && this.y === point.y );
    }
    roundToScale(scale: number): Coords {
        return new Coords(
            Math.round(this.x / scale) * scale,
            Math.round(this.y / scale) * scale
        );
    }
}
interface Area {
    begin: Coords;
    end: Coords;
}
export { Coords, Area }
