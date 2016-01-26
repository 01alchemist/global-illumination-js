/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class XYZColor {

    constructor(private X:float = 0, private Y:float = 0, private Z:float = 0) {
    }

    getX():float {
        return this.X;
    }

    getY():float {
        return this.Y;
    }

    getZ():float {
        return this.Z;
    }

    mul(s:float):XYZColor {
        this.X *= s;
        this.Y *= s;
        this.Z *= s;
        return this;
    }

    normalize() {
        let XYZ:float = this.X + this.Y + this.Z;
        if (XYZ < 1E-06) {
            return;
        }
        let s:float = 1 / XYZ;
        this.X *= s;
        this.Y *= s;
        this.Z *= s;
    }

    toString():string {
        return "(" + this.X + ", " + this.Y + ", " + this.Z + ")";
    }
}