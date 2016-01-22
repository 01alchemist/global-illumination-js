/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export /* sealed */ class Ray {

    public ox: number;

    public oy: number;

    public oz: number;

    public dx: number;

    public dy: number;

    public dz: number;

    private tMin: number;

    private tMax: number;

    private static EPSILON: number = 0;

    //  0.01f;
    private constructor () {

    }

    public constructor (ox: number, oy: number, oz: number, dx: number, dy: number, dz: number) {
        this.ox = this.ox;
        this.oy = this.oy;
        this.oz = this.oz;
        this.dx = this.dx;
        this.dy = this.dy;
        this.dz = this.dz;
        let in: number = (1 / (<number>(Math.sqrt(((this.dx * this.dx)
        + ((this.dy * this.dy)
        + (this.dz * this.dz)))))));
        this.dx = (this.dx * in);
        this.dy = (this.dy * in);
        this.dz = (this.dz * in);
        this.tMin = EPSILON;
        this.tMax = Float.POSITIVE_INFINITY;
    }

    public constructor (o: Point3, d: Vector3) {
        this.ox = o.x;
        this.oy = o.y;
        this.oz = o.z;
        this.dx = d.x;
        this.dy = d.y;
        this.dz = d.z;
        let in: number = (1 / (<number>(Math.sqrt(((this.dx * this.dx)
        + ((this.dy * this.dy)
        + (this.dz * this.dz)))))));
        this.dx = (this.dx * in);
        this.dy = (this.dy * in);
        this.dz = (this.dz * in);
        this.tMin = EPSILON;
        this.tMax = Float.POSITIVE_INFINITY;
    }

    public constructor (a: Point3, b: Point3) {
        this.ox = a.x;
        this.oy = a.y;
        this.oz = a.z;
        this.dx = (b.x - this.ox);
        this.dy = (b.y - this.oy);
        this.dz = (b.z - this.oz);
        this.tMin = EPSILON;
        let n: number = (<number>(Math.sqrt(((this.dx * this.dx)
        + ((this.dy * this.dy)
        + (this.dz * this.dz))))));
        let in: number = (1 / n);
        this.dx = (this.dx * in);
        this.dy = (this.dy * in);
        this.dz = (this.dz * in);
        this.tMax = (n - EPSILON);
    }

    public transform(m: Matrix4): Ray {
        if ((m == null)) {
            return this;
        }

        let r: Ray = new Ray();
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

    public normalize() {
        let in: number = (1 / (<number>(Math.sqrt(((this.dx * this.dx)
        + ((this.dy * this.dy)
        + (this.dz * this.dz)))))));
        this.dx = (this.dx * in);
        this.dy = (this.dy * in);
        this.dz = (this.dz * in);
    }

    public getMin(): number {
        return this.tMin;
    }

    public getMax(): number {
        return this.tMax;
    }

    public getDirection(): Vector3 {
        return new Vector3(this.dx, this.dy, this.dz);
    }

    public isInside(t: number): boolean {
        return ((this.tMin < t)
        && (t < this.tMax));
    }

    public getPoint(dest: Point3): Point3 {
        dest.x = (this.ox
        + (this.tMax * this.dx));
        dest.y = (this.oy
        + (this.tMax * this.dy));
        dest.z = (this.oz
        + (this.tMax * this.dz));
        return dest;
    }

    public dot(v: Vector3): number {
        return ((this.dx * v.x)
        + ((this.dy * v.y)
        + (this.dz * v.z)));
    }

    public dot(vx: number, vy: number, vz: number): number {
        return ((this.dx * vx)
        + ((this.dy * vy)
        + (this.dz * vz)));
    }

    public setMax(t: number) {
        this.tMax = t;
    }
}