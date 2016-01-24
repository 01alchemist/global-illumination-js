/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class PerlinVector {

    private static P1x:number = 0.34;

    private static P1y:number = 0.66;

    private static P1z:number = 0.237;

    private static P2x:number = 0.011;

    private static P2y:number = 0.845;

    private static P2z:number = 0.037;

    private static P3x:number = 0.34;

    private static P3y:number = 0.12;

    private static P3z:number = 0.9;

    static snoise(x:number):Vector3 {
        return new Vector3(PerlinScalar.snoise((x + P1x)), PerlinScalar.snoise((x + P2x)), PerlinScalar.snoise((x + P3x)));
    }

    static snoise(x:number, y:number):Vector3 {
        return new Vector3(PerlinScalar.snoise((x + P1x), (y + P1y)), PerlinScalar.snoise((x + P2x), (y + P2y)), PerlinScalar.snoise((x + P3x), (y + P3y)));
    }

    static snoise(x:number, y:number, z:number):Vector3 {
        return new Vector3(PerlinScalar.snoise((x + P1x), (y + P1y), (z + P1z)), PerlinScalar.snoise((x + P2x), (y + P2y), (z + P2z)), PerlinScalar.snoise((x + P3x), (y + P3y), (z + P3z)));
    }

    static snoise(x:number, y:number, z:number, t:number):Vector3 {
        return new Vector3(PerlinScalar.snoise((x + P1x), (y + P1y), (z + P1z), t), PerlinScalar.snoise((x + P2x), (y + P2y), (z + P2z), t), PerlinScalar.snoise((x + P3x), (y + P3y), (z + P3z), t));
    }

    static snoise(p:Point2):Vector3 {
        return PerlinVector.snoise(p.x, p.y);
    }

    static snoise(p:Point3):Vector3 {
        return PerlinVector.snoise(p.x, p.y, p.z);
    }

    static snoise(p:Point3, t:number):Vector3 {
        return PerlinVector.snoise(p.x, p.y, p.z, t);
    }

    static noise(x:number):Vector3 {
        return new Vector3(PerlinScalar.noise((x + P1x)), PerlinScalar.noise((x + P2x)), PerlinScalar.noise((x + P3x)));
    }

    static noise(x:number, y:number):Vector3 {
        return new Vector3(PerlinScalar.noise((x + P1x), (y + P1y)), PerlinScalar.noise((x + P2x), (y + P2y)), PerlinScalar.noise((x + P3x), (y + P3y)));
    }

    static noise(x:number, y:number, z:number):Vector3 {
        return new Vector3(PerlinScalar.noise((x + P1x), (y + P1y), (z + P1z)), PerlinScalar.noise((x + P2x), (y + P2y), (z + P2z)), PerlinScalar.noise((x + P3x), (y + P3y), (z + P3z)));
    }

    static noise(x:number, y:number, z:number, t:number):Vector3 {
        return new Vector3(PerlinScalar.noise((x + P1x), (y + P1y), (z + P1z), t), PerlinScalar.noise((x + P2x), (y + P2y), (z + P2z), t), PerlinScalar.noise((x + P3x), (y + P3y), (z + P3z), t));
    }

    static noise(p:Point2):Vector3 {
        return PerlinVector.noise(p.x, p.y);
    }

    static noise(p:Point3):Vector3 {
        return PerlinVector.noise(p.x, p.y, p.z);
    }

    static noise(p:Point3, t:number):Vector3 {
        return PerlinVector.noise(p.x, p.y, p.z, t);
    }

    static pnoise(x:number, period:number):Vector3 {
        return new Vector3(PerlinScalar.pnoise((x + P1x), period), PerlinScalar.pnoise((x + P2x), period), PerlinScalar.pnoise((x + P3x), period));
    }

    static pnoise(x:number, y:number, w:number, h:number):Vector3 {
        return new Vector3(PerlinScalar.pnoise((x + P1x), (y + P1y), w, h), PerlinScalar.pnoise((x + P2x), (y + P2y), w, h), PerlinScalar.pnoise((x + P3x), (y + P3y), w, h));
    }

    static pnoise(x:number, y:number, z:number, w:number, h:number, d:number):Vector3 {
        return new Vector3(PerlinScalar.pnoise((x + P1x), (y + P1y), (z + P1z), w, h, d), PerlinScalar.pnoise((x + P2x), (y + P2y), (z + P2z), w, h, d), PerlinScalar.pnoise((x + P3x), (y + P3y), (z + P3z), w, h, d));
    }

    static pnoise(x:number, y:number, z:number, t:number, w:number, h:number, d:number, p:number):Vector3 {
        return new Vector3(PerlinScalar.pnoise((x + P1x), (y + P1y), (z + P1z), t, w, h, d, p), PerlinScalar.pnoise((x + P2x), (y + P2y), (z + P2z), t, w, h, d, p), PerlinScalar.pnoise((x + P3x), (y + P3y), (z + P3z), t, w, h, d, p));
    }

    static pnoise(p:Point2, periodx:number, periody:number):Vector3 {
        return PerlinVector.pnoise(p.x, p.y, periodx, periody);
    }

    static pnoise(p:Point3, period:Vector3):Vector3 {
        return PerlinVector.pnoise(p.x, p.y, p.z, period.x, period.y, period.z);
    }

    static pnoise(p:Point3, t:number, pperiod:Vector3, tperiod:number):Vector3 {
        return PerlinVector.pnoise(p.x, p.y, p.z, t, pperiod.x, pperiod.y, pperiod.z, tperiod);
    }

    static spnoise(x:number, period:number):Vector3 {
        return new Vector3(PerlinScalar.spnoise((x + P1x), period), PerlinScalar.spnoise((x + P2x), period), PerlinScalar.spnoise((x + P3x), period));
    }

    static spnoise(x:number, y:number, w:number, h:number):Vector3 {
        return new Vector3(PerlinScalar.spnoise((x + P1x), (y + P1y), w, h), PerlinScalar.spnoise((x + P2x), (y + P2y), w, h), PerlinScalar.spnoise((x + P3x), (y + P3y), w, h));
    }

    static spnoise(x:number, y:number, z:number, w:number, h:number, d:number):Vector3 {
        return new Vector3(PerlinScalar.spnoise((x + P1x), (y + P1y), (z + P1z), w, h, d), PerlinScalar.spnoise((x + P2x), (y + P2y), (z + P2z), w, h, d), PerlinScalar.spnoise((x + P3x), (y + P3y), (z + P3z), w, h, d));
    }

    static spnoise(x:number, y:number, z:number, t:number, w:number, h:number, d:number, p:number):Vector3 {
        return new Vector3(PerlinScalar.spnoise((x + P1x), (y + P1y), (z + P1z), t, w, h, d, p), PerlinScalar.spnoise((x + P2x), (y + P2y), (z + P2z), t, w, h, d, p), PerlinScalar.spnoise((x + P3x), (y + P3y), (z + P3z), t, w, h, d, p));
    }

    static spnoise(p:Point2, periodx:number, periody:number):Vector3 {
        return PerlinVector.spnoise(p.x, p.y, periodx, periody);
    }

    static spnoise(p:Point3, period:Vector3):Vector3 {
        return PerlinVector.spnoise(p.x, p.y, p.z, period.x, period.y, period.z);
    }

    static spnoise(p:Point3, t:number, pperiod:Vector3, tperiod:number):Vector3 {
        return PerlinVector.spnoise(p.x, p.y, p.z, t, pperiod.x, pperiod.y, pperiod.z, tperiod);
    }
}