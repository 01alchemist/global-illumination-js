/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Point3 {

    x:number;
    y:number;
    z:number;

    constructor (p:Point3)
    constructor (x:number=0, y:number=0, z:number=0) {

        if(arguments[0] instanceof Point3){
            this.x = arguments[0].x;
            this.y = arguments[1].y;
            this.z = arguments[2].z;
        }else{
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }

    get(i:number):number {
        switch (i) {
            case 0:
                return this.x;
                break;
            case 1:
                return this.y;
                break;
            default:
                return this.z;
                break;
        }

    }

    distanceTo(p:Point3):number {
        let dx:number = (this.x - p.x);
        let dy:number = (this.y - p.y);
        let dz:number = (this.z - p.z);
        return (<number>(Math.sqrt(((dx * dx)
        + ((dy * dy)
        + (dz * dz))))));
    }

    distanceTo(px:number, py:number, pz:number):number {
        let dx:number = (this.x - px);
        let dy:number = (this.y - py);
        let dz:number = (this.z - pz);
        return (<number>(Math.sqrt(((dx * dx)
        + ((dy * dy)
        + (dz * dz))))));
    }

    distanceToSquared(p:Point3):number {
        let dx:number = (this.x - p.x);
        let dy:number = (this.y - p.y);
        let dz:number = (this.z - p.z);
        return ((dx * dx)
        + ((dy * dy)
        + (dz * dz)));
    }

    distanceToSquared(px:number, py:number, pz:number):number {
        let dx:number = (this.x - px);
        let dy:number = (this.y - py);
        let dz:number = (this.z - pz);
        return ((dx * dx)
        + ((dy * dy)
        + (dz * dz)));
    }

    set(x:number, y:number, z:number):Point3 {
        this.x = this.x;
        this.y = this.y;
        this.z = this.z;
        return this;
    }

    set(p:Point3):Point3 {
        this.x = p.x;
        this.y = p.y;
        this.z = p.z;
        return this;
    }

    static add(p:Point3, v:Vector3, dest:Point3):Point3 {
        dest.x = (p.x + v.x);
        dest.y = (p.y + v.y);
        dest.z = (p.z + v.z);
        return dest;
    }

    static sub(p1:Point3, p2:Point3, dest:Vector3):Vector3 {
        dest.x = (p1.x - p2.x);
        dest.y = (p1.y - p2.y);
        dest.z = (p1.z - p2.z);
        return dest;
    }

    static mid(p1:Point3, p2:Point3, dest:Point3):Point3 {
        dest.x = (0.5
        * (p1.x + p2.x));
        dest.y = (0.5
        * (p1.y + p2.y));
        dest.z = (0.5
        * (p1.z + p2.z));
        return dest;
    }

    static normal(p0:Point3, p1:Point3, p2:Point3):Vector3 {
        let edge1x:number = (p1.x - p0.x);
        let edge1y:number = (p1.y - p0.y);
        let edge1z:number = (p1.z - p0.z);
        let edge2x:number = (p2.x - p0.x);
        let edge2y:number = (p2.y - p0.y);
        let edge2z:number = (p2.z - p0.z);
        let nx:number = ((edge1y * edge2z)
        - (edge1z * edge2y));
        let ny:number = ((edge1z * edge2x)
        - (edge1x * edge2z));
        let nz:number = ((edge1x * edge2y)
        - (edge1y * edge2x));
        return new Vector3(nx, ny, nz);
    }

    static normal(p0:Point3, p1:Point3, p2:Point3, dest:Vector3):Vector3 {
        let edge1x:number = (p1.x - p0.x);
        let edge1y:number = (p1.y - p0.y);
        let edge1z:number = (p1.z - p0.z);
        let edge2x:number = (p2.x - p0.x);
        let edge2y:number = (p2.y - p0.y);
        let edge2z:number = (p2.z - p0.z);
        dest.x = ((edge1y * edge2z)
        - (edge1z * edge2y));
        dest.y = ((edge1z * edge2x)
        - (edge1x * edge2z));
        dest.z = ((edge1x * edge2y)
        - (edge1y * edge2x));
        return dest;
    }

    @Override()
    toString():string {
        return String.format("(%.2f, %.2f, %.2f)", this.x, this.y, this.z);
    }
}