import { Coords } from './Coords';

export class TransformContext {
    ctx: CanvasRenderingContext2D;
    pt: SVGPoint;
    transformMatrix: SVGMatrix;
    svg: SVGSVGElement;
    savedTransforms: Array<SVGMatrix> = [];

    constructor(ctx: CanvasRenderingContext2D) {
        const self = this;
        self.ctx = ctx
        self.svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
        self.transformMatrix = self.svg.createSVGMatrix();
        self.pt  = self.svg.createSVGPoint();
    }

    private save(): void {
        this.savedTransforms.push(this.transformMatrix.translate(0,0));
        this.ctx.save();
    }

    public restore(): void {
        this.save();
        this.setTransform(1, 0, 0, 1, 0, 0);
        this.transformMatrix = <SVGMatrix> this.savedTransforms.pop();
        this.ctx.restore();
    }

    private scale(x: number, y: number): void {
      this.transformMatrix = this.transformMatrix.scaleNonUniform(x, y);
      this.ctx.scale(x, y);
    }

    public translate(x: number, y: number): void {
        this.transformMatrix = this.transformMatrix.translate(x, y);
        this.ctx.translate(x, y);
    }

    private setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void {
        this.transformMatrix.a = a;
        this.transformMatrix.b = b;
        this.transformMatrix.c = c;
        this.transformMatrix.d = d;
        this.transformMatrix.e = e;
        this.transformMatrix.f = f;
        this.ctx.setTransform(a, b, c, d, e, f);
    }

    public zoom(factor: number, point: Coords): void {
        this.pt = this.transformedPoint(point.x, point.y);
        this.translate(this.pt.x, this.pt.y);
        this.scale(factor, factor);
        this.translate(-this.pt.x, -this.pt.y);
    }

    public transformedPoint(x: number, y: number): SVGPoint {
        this.pt.x = x;
        this.pt.y = y;
        return this.pt.matrixTransform(this.transformMatrix.inverse());
    }

    public transformedPointCoords(x: number,y: number): Coords {
        this.pt.x = x;
        this.pt.y = y;
        return new Coords(this.pt.matrixTransform(this.transformMatrix.inverse()).x,
            this.pt.matrixTransform(this.transformMatrix.inverse()).y);
    }
}
