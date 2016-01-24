/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class XYZColor {

    private X:number;

    private Y:number;

    private Z:number;

    constructor () {

    }

    constructor (X:number, Y:number, Z:number) {
        this.X = this.X;
        this.Y = this.Y;
        this.Z = this.Z;
    }

    getX():number {
        return this.X;
    }

    getY():number {
        return this.Y;
    }

    getZ():number {
        return this.Z;
    }

    mul(s:number):XYZColor {
        this.X = (this.X * s);
        this.Y = (this.Y * s);
        this.Z = (this.Z * s);
        return this;
    }

    normalize() {
        let XYZ:number = (this.X
        + (this.Y + this.Z));
        if ((XYZ < 1E-06)) {
            return;
        }

        let s:number = (1 / XYZ);
        this.X = (this.X * s);
        this.Y = (this.Y * s);
        this.Z = (this.Z * s);
    }

    toString():string {
        return String.format("(%.3f, %.3f, %.3f)", this.X, this.Y, this.Z);
    }
}