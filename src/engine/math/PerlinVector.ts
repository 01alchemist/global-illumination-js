/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class PerlinVector {

    private static P1x: number = 0.34;

    private static P1y: number = 0.66;

    private static P1z: number = 0.237;

    private static P2x: number = 0.011;

    private static P2y: number = 0.845;

    private static P2z: number = 0.037;

    private static P3x: number = 0.34;

    private static P3y: number = 0.12;

    private static P3z: number = 0.9;

    public static snoise(x: number): Vector3 {
        return new Vector3(PerlinScalar.snoise((x + P1x)), PerlinScalar.snoise((x + P2x)), PerlinScalar.snoise((x + P3x)));
    }

    public static snoise(x: number, y: number): Vector3 {
        return new Vector3(PerlinScalar.snoise((x + P1x), (y + P1y)), PerlinScalar.snoise((x + P2x), (y + P2y)), PerlinScalar.snoise((x + P3x), (y + P3y)));
    }

    public static snoise(x: number, y: number, z: number): Vector3 {
        return new Vector3(PerlinScalar.snoise((x + P1x), (y + P1y), (z + P1z)), PerlinScalar.snoise((x + P2x), (y + P2y), (z + P2z)), PerlinScalar.snoise((x + P3x), (y + P3y), (z + P3z)));
    }

    public static snoise(x: number, y: number, z: number, t: number): Vector3 {
        return new Vector3(PerlinScalar.snoise((x + P1x), (y + P1y), (z + P1z), t), PerlinScalar.snoise((x + P2x), (y + P2y), (z + P2z), t), PerlinScalar.snoise((x + P3x), (y + P3y), (z + P3z), t));
    }

    public static snoise(p: Point2): Vector3 {
        return PerlinVector.snoise(p.x, p.y);
    }

    public static snoise(p: Point3): Vector3 {
        return PerlinVector.snoise(p.x, p.y, p.z);
    }

    public static snoise(p: Point3, t: number): Vector3 {
        return PerlinVector.snoise(p.x, p.y, p.z, t);
    }

    public static noise(x: number): Vector3 {
        return new Vector3(PerlinScalar.noise((x + P1x)), PerlinScalar.noise((x + P2x)), PerlinScalar.noise((x + P3x)));
    }

    public static noise(x: number, y: number): Vector3 {
        return new Vector3(PerlinScalar.noise((x + P1x), (y + P1y)), PerlinScalar.noise((x + P2x), (y + P2y)), PerlinScalar.noise((x + P3x), (y + P3y)));
    }

    public static noise(x: number, y: number, z: number): Vector3 {
        return new Vector3(PerlinScalar.noise((x + P1x), (y + P1y), (z + P1z)), PerlinScalar.noise((x + P2x), (y + P2y), (z + P2z)), PerlinScalar.noise((x + P3x), (y + P3y), (z + P3z)));
    }

    public static noise(x: number, y: number, z: number, t: number): Vector3 {
        return new Vector3(PerlinScalar.noise((x + P1x), (y + P1y), (z + P1z), t), PerlinScalar.noise((x + P2x), (y + P2y), (z + P2z), t), PerlinScalar.noise((x + P3x), (y + P3y), (z + P3z), t));
    }

    public static noise(p: Point2): Vector3 {
        return PerlinVector.noise(p.x, p.y);
    }

    public static noise(p: Point3): Vector3 {
        return PerlinVector.noise(p.x, p.y, p.z);
    }

    public static noise(p: Point3, t: number): Vector3 {
        return PerlinVector.noise(p.x, p.y, p.z, t);
    }

    public static pnoise(x: number, period: number): Vector3 {
        return new Vector3(PerlinScalar.pnoise((x + P1x), period), PerlinScalar.pnoise((x + P2x), period), PerlinScalar.pnoise((x + P3x), period));
    }

    public static pnoise(x: number, y: number, w: number, h: number): Vector3 {
        return new Vector3(PerlinScalar.pnoise((x + P1x), (y + P1y), w, h), PerlinScalar.pnoise((x + P2x), (y + P2y), w, h), PerlinScalar.pnoise((x + P3x), (y + P3y), w, h));
    }

    public static pnoise(x: number, y: number, z: number, w: number, h: number, d: number): Vector3 {
        return new Vector3(PerlinScalar.pnoise((x + P1x), (y + P1y), (z + P1z), w, h, d), PerlinScalar.pnoise((x + P2x), (y + P2y), (z + P2z), w, h, d), PerlinScalar.pnoise((x + P3x), (y + P3y), (z + P3z), w, h, d));
    }

    public static pnoise(x: number, y: number, z: number, t: number, w: number, h: number, d: number, p: number): Vector3 {
        return new Vector3(PerlinScalar.pnoise((x + P1x), (y + P1y), (z + P1z), t, w, h, d, p), PerlinScalar.pnoise((x + P2x), (y + P2y), (z + P2z), t, w, h, d, p), PerlinScalar.pnoise((x + P3x), (y + P3y), (z + P3z), t, w, h, d, p));
    }

    public static pnoise(p: Point2, periodx: number, periody: number): Vector3 {
        return PerlinVector.pnoise(p.x, p.y, periodx, periody);
    }

    public static pnoise(p: Point3, period: Vector3): Vector3 {
        return PerlinVector.pnoise(p.x, p.y, p.z, period.x, period.y, period.z);
    }

    public static pnoise(p: Point3, t: number, pperiod: Vector3, tperiod: number): Vector3 {
        return PerlinVector.pnoise(p.x, p.y, p.z, t, pperiod.x, pperiod.y, pperiod.z, tperiod);
    }

    public static spnoise(x: number, period: number): Vector3 {
        return new Vector3(PerlinScalar.spnoise((x + P1x), period), PerlinScalar.spnoise((x + P2x), period), PerlinScalar.spnoise((x + P3x), period));
    }

    public static spnoise(x: number, y: number, w: number, h: number): Vector3 {
        return new Vector3(PerlinScalar.spnoise((x + P1x), (y + P1y), w, h), PerlinScalar.spnoise((x + P2x), (y + P2y), w, h), PerlinScalar.spnoise((x + P3x), (y + P3y), w, h));
    }

    public static spnoise(x: number, y: number, z: number, w: number, h: number, d: number): Vector3 {
        return new Vector3(PerlinScalar.spnoise((x + P1x), (y + P1y), (z + P1z), w, h, d), PerlinScalar.spnoise((x + P2x), (y + P2y), (z + P2z), w, h, d), PerlinScalar.spnoise((x + P3x), (y + P3y), (z + P3z), w, h, d));
    }

    public static spnoise(x: number, y: number, z: number, t: number, w: number, h: number, d: number, p: number): Vector3 {
        return new Vector3(PerlinScalar.spnoise((x + P1x), (y + P1y), (z + P1z), t, w, h, d, p), PerlinScalar.spnoise((x + P2x), (y + P2y), (z + P2z), t, w, h, d, p), PerlinScalar.spnoise((x + P3x), (y + P3y), (z + P3z), t, w, h, d, p));
    }

    public static spnoise(p: Point2, periodx: number, periody: number): Vector3 {
        return PerlinVector.spnoise(p.x, p.y, periodx, periody);
    }

    public static spnoise(p: Point3, period: Vector3): Vector3 {
        return PerlinVector.spnoise(p.x, p.y, p.z, period.x, period.y, period.z);
    }

    public static spnoise(p: Point3, t: number, pperiod: Vector3, tperiod: number): Vector3 {
        return PerlinVector.spnoise(p.x, p.y, p.z, t, pperiod.x, pperiod.y, pperiod.z, tperiod);
    }
}