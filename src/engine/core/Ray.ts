import {Vector3} from "../math/Vector3";
import {Point3} from "../math/Point3";
import {Matrix4} from "../math/Matrix4";
import {Float} from "../../utils/BrowserPlatform";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Ray {

    ox:float;
    oy:float;
    oz:float;
    dx:float;
    dy:float;
    dz:float;
    private tMin:float;
    private tMax:float;
    private static EPSILON:float = 0;//  0.01f;

    constructor (ox:float|Point3=0, oy:float|Vector3|Point3=0, oz:float=0, dx:float=0, dy:float=0, dz:float=0) {

        let arg = arguments;
        let tMax = Float.POSITIVE_INFINITY;;
        let _in:float;

        if(arg.length == 6){
            this.ox = <float>ox;
            this.oy = <float>oy;
            this.oz = oz;
            this.dx = dx;
            this.dy = dy;
            this.dz = dz;
            _in = 1 /Math.sqrt(((this.dx * this.dx) + ((this.dy * this.dy) + (this.dz * this.dz))));
        }else if(arg.length == 2){
            this.ox = arg[0].x;
            this.oy = arg[0].y;
            this.oz = arg[0].z;
            let n:float = Math.sqrt(((this.dx * this.dx) + ((this.dy * this.dy) + (this.dz * this.dz))));
            _in = 1 / n;
            if(arg[1] instanceof Point3){
                this.dx = arg[1].x - this.ox;
                this.dy = arg[1].y - this.oy;
                this.dz = arg[1].z - this.oz;
                tMax = n - Ray.EPSILON;
            }else{
                this.dx = arg[1].x;
                this.dy = arg[1].y;
                this.dz = arg[1].z;
            }
        }

        this.dx *= _in;
        this.dy *= _in;
        this.dz *= _in;
        this.tMin = Ray.EPSILON;
        this.tMax = tMax;
    }

    transform(m:Matrix4):Ray {
        if ((m == null)) {
            return this;
        }

        let r:Ray = new Ray();
        r.ox = m.transformPX(this.ox, this.oy, this.oz);
        r.oy = m.transformPY(this.ox, this.oy, this.oz);
        r.oz = m.transformPZ(this.ox, this.oy, this.oz);
        r.dx = m.transformVX(this.dx, this.dy, this.dz);
        r.dy = m.transformVY(this.dx, this.dy, this.dz);
        r.dz = m.transformVZ(this.dx, this.dy, this.dz);
        r.tMin = this.tMin;
        r.tMax = this.tMax;
        return r;
    }

    normalize() {
        let _in:number = (1 / (<number>(Math.sqrt(((this.dx * this.dx)
        + ((this.dy * this.dy)
        + (this.dz * this.dz)))))));
        this.dx = (this.dx * _in);
        this.dy = (this.dy * _in);
        this.dz = (this.dz * _in);
    }

    getMin():number {
        return this.tMin;
    }

    getMax():number {
        return this.tMax;
    }

    getDirection():Vector3 {
        return new Vector3(this.dx, this.dy, this.dz);
    }

    isInside(t:number):boolean {
        return ((this.tMin < t)
        && (t < this.tMax));
    }

    getPoint(dest:Point3):Point3 {
        dest.x = (this.ox + (this.tMax * this.dx));
        dest.y = (this.oy + (this.tMax * this.dy));
        dest.z = (this.oz + (this.tMax * this.dz));
        return dest;
    }

    dot(v:Vector3):number {
        return this.dx * v.x + this.dy * v.y + this.dz * v.z;
    }

    dot(vx:number, vy:number, vz:number):number {
        return this.dx * vx + this.dy * vy + this.dz * vz;
    }

    setMax(t:number) {
        this.tMax = t;
    }
}