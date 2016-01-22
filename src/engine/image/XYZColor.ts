/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class XYZColor {

    private X: number;

    private Y: number;

    private Z: number;

    public constructor () {

    }

    public constructor (X: number, Y: number, Z: number) {
        this.X = this.X;
        this.Y = this.Y;
        this.Z = this.Z;
    }

    public getX(): number {
        return this.X;
    }

    public getY(): number {
        return this.Y;
    }

    public getZ(): number {
        return this.Z;
    }

    public mul(s: number): XYZColor {
        this.X = (this.X * s);
        this.Y = (this.Y * s);
        this.Z = (this.Z * s);
        return this;
    }

    public normalize() {
        let XYZ: number = (this.X
        + (this.Y + this.Z));
        if ((XYZ < 1E-06)) {
            return;
        }

        let s: number = (1 / XYZ);
        this.X = (this.X * s);
        this.Y = (this.Y * s);
        this.Z = (this.Z * s);
    }

    public toString(): String {
        return String.format("(%.3f, %.3f, %.3f)", this.X, this.Y, this.Z);
    }
}