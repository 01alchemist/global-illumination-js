import {Point3} from "./Point3";
import {Float} from "../../utils/BrowserPlatform";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class BoundingBox {

    private minimum:Point3;

    private maximum:Point3;

    constructor(b:BoundingBox)
    constructor(p:Point3)
    constructor(size:number)
    constructor(x:number, y:number, z:number)
    constructor() {
        let arg1 = arguments[0];
        let x:float;
        let y:float;
        let z:float;
        if (arg1 instanceof BoundingBox) {
            this.minimum = new Point3(arg1.minimum);
            this.maximum = new Point3(arg1.maximum);
            return;
        } else if (arg1 instanceof Point3) {
            x = arg1.x;
            y = arg1.y;
            z = arg1.z;
        } else if (arguments.length == 3) {
            x = arguments[0];
            y = arguments[1];
            z = arguments[2];
        } else if (arguments.length == 1) {
            minimum = new Point3(-arg1, -arg1, -arg1);
            maximum = new Point3(arg1, arg1, arg1);
            return;
        } else {
            this.minimum = new Point3(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY);
            this.maximum = new Point3(Float.NEGATIVE_INFINITY, Float.NEGATIVE_INFINITY, Float.NEGATIVE_INFINITY);
            return;
        }

        this.minimum = new Point3(x, y, z);
        this.maximum = new Point3(x, y, z);
    }

    getMinimum():Point3 {
        return this.minimum;
    }

    getMaximum():Point3 {
        return this.maximum;
    }

    getCenter():Point3 {
        return Point3.mid(this.minimum, this.maximum, new Point3());
    }

    getCorner(i:number):Point3 {
        let x:number = ((i & 1) == 0);
        // TODO:Warning!!!, inline IF is not supported ?
        let y:number = ((i & 2) == 0);
        // TODO:Warning!!!, inline IF is not supported ?
        let z:number = ((i & 4) == 0);
        // TODO:Warning!!!, inline IF is not supported ?
        return new Point3(x, y, z);
    }

    getBound(i:number):number {
        switch (i) {
            case 0:
                return this.minimum.x;
                break;
            case 1:
                return this.maximum.x;
                break;
            case 2:
                return this.minimum.y;
                break;
            case 3:
                return this.maximum.y;
                break;
            case 4:
                return this.minimum.z;
                break;
            case 5:
                return this.maximum.z;
                break;
            default:
                return 0;
                break;
        }

    }

    getExtents():Vector3 {
        return Point3.sub(this.maximum, this.minimum, new Vector3());
    }

    getArea():number {
        let w:Vector3 = this.getExtents();
        let ax:number = Math.max(w.x, 0);
        let ay:number = Math.max(w.y, 0);
        let az:number = Math.max(w.z, 0);
        return (2
        * ((ax * ay)
        + ((ay * az)
        + (az * ax))));
    }

    getVolume():number {
        let w:Vector3 = this.getExtents();
        let ax:number = Math.max(w.x, 0);
        let ay:number = Math.max(w.y, 0);
        let az:number = Math.max(w.z, 0);
        return (ax
        * (ay * az));
    }

    enlargeUlps() {
        let eps:number = 0.0001;
        this.minimum.x = (this.minimum.x - Math.max(eps, Math.ulp(this.minimum.x)));
        this.minimum.y = (this.minimum.y - Math.max(eps, Math.ulp(this.minimum.y)));
        this.minimum.z = (this.minimum.z - Math.max(eps, Math.ulp(this.minimum.z)));
        this.maximum.x = (this.maximum.x + Math.max(eps, Math.ulp(this.maximum.x)));
        this.maximum.y = (this.maximum.y + Math.max(eps, Math.ulp(this.maximum.y)));
        this.maximum.z = (this.maximum.z + Math.max(eps, Math.ulp(this.maximum.z)));
    }

    isEmpty():boolean {
        return ((this.maximum.x < this.minimum.x)
        || ((this.maximum.y < this.minimum.y)
        || (this.maximum.z < this.minimum.z)));
    }

    intersects(b:BoundingBox):boolean {
        return ((b != null)
        && ((this.minimum.x <= b.maximum.x)
        && ((this.maximum.x >= b.minimum.x)
        && ((this.minimum.y <= b.maximum.y)
        && ((this.maximum.y >= b.minimum.y)
        && ((this.minimum.z <= b.maximum.z)
        && (this.maximum.z >= b.minimum.z)))))));
    }

    contains(p:Point3):boolean {
        return ((p != null)
        && ((p.x >= this.minimum.x)
        && ((p.x <= this.maximum.x)
        && ((p.y >= this.minimum.y)
        && ((p.y <= this.maximum.y)
        && ((p.z >= this.minimum.z)
        && (p.z <= this.maximum.z)))))));
    }

    contains(x:number, y:number, z:number):boolean {
        return ((x >= this.minimum.x)
        && ((x <= this.maximum.x)
        && ((y >= this.minimum.y)
        && ((y <= this.maximum.y)
        && ((z >= this.minimum.z)
        && (z <= this.maximum.z))))));
    }

    include(p:Point3) {
        if ((p != null)) {
            if ((p.x < this.minimum.x)) {
                this.minimum.x = p.x;
            }

            if ((p.x > this.maximum.x)) {
                this.maximum.x = p.x;
            }

            if ((p.y < this.minimum.y)) {
                this.minimum.y = p.y;
            }

            if ((p.y > this.maximum.y)) {
                this.maximum.y = p.y;
            }

            if ((p.z < this.minimum.z)) {
                this.minimum.z = p.z;
            }

            if ((p.z > this.maximum.z)) {
                this.maximum.z = p.z;
            }

        }

    }

    include(x:number, y:number, z:number) {
        if ((x < this.minimum.x)) {
            this.minimum.x = x;
        }

        if ((x > this.maximum.x)) {
            this.maximum.x = x;
        }

        if ((y < this.minimum.y)) {
            this.minimum.y = y;
        }

        if ((y > this.maximum.y)) {
            this.maximum.y = y;
        }

        if ((z < this.minimum.z)) {
            this.minimum.z = z;
        }

        if ((z > this.maximum.z)) {
            this.maximum.z = z;
        }

    }

    include(b:BoundingBox) {
        if ((b != null)) {
            if ((b.minimum.x < this.minimum.x)) {
                this.minimum.x = b.minimum.x;
            }

            if ((b.maximum.x > this.maximum.x)) {
                this.maximum.x = b.maximum.x;
            }

            if ((b.minimum.y < this.minimum.y)) {
                this.minimum.y = b.minimum.y;
            }

            if ((b.maximum.y > this.maximum.y)) {
                this.maximum.y = b.maximum.y;
            }

            if ((b.minimum.z < this.minimum.z)) {
                this.minimum.z = b.minimum.z;
            }

            if ((b.maximum.z > this.maximum.z)) {
                this.maximum.z = b.maximum.z;
            }

        }

    }

    toString():string {
        return String.format("(%.2f, %.2f, %.2f) to (%.2f, %.2f, %.2f)", this.minimum.x, this.minimum.y, this.minimum.z, this.maximum.x, this.maximum.y, this.maximum.z);
    }
}