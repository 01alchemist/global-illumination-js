/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class DirectionalSpotlight implements LightSource {

    private src: Point3;

    private dir: Vector3;

    private basis: OrthoNormalBasis;

    private r: number;

    private r2: number;

    private radiance: Color;

    public constructor () {
        this.src = new Point3(0, 0, 0);
        this.dir = new Vector3(0, 0, -1);
        this.dir.normalize();
        this.basis = OrthoNormalBasis.makeFromW(this.dir);
        this.r = 1;
        this.r2 = (this.r * this.r);
        this.radiance = Color.WHITE;
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        this.src = pl.getPoint("source", this.src);
        this.dir = pl.getVector("dir", this.dir);
        this.dir.normalize();
        this.r = pl.getFloat("radius", this.r);
        this.basis = OrthoNormalBasis.makeFromW(this.dir);
        this.r2 = (this.r * this.r);
        this.radiance = pl.getColor("radiance", this.radiance);
        return true;
    }

    public getNumSamples(): number {
        return 1;
    }

    public getLowSamples(): number {
        return 1;
    }

    public getSamples(state: ShadingState) {
        if (((Vector3.dot(this.dir, state.getGeoNormal()) < 0)
            && (Vector3.dot(this.dir, state.getNormal()) < 0))) {
            //  project point onto source plane
            let x: number = (state.getPoint().x - this.src.x);
            let y: number = (state.getPoint().y - this.src.y);
            let z: number = (state.getPoint().z - this.src.z);
            let t: number = ((x * this.dir.x)
            + ((y * this.dir.y)
            + (z * this.dir.z)));
            if ((t >= 0)) {
                x = (x
                - (t * this.dir.x));
                y = (y
                - (t * this.dir.y));
                z = (z
                - (t * this.dir.z));
                if ((((x * x)
                    + ((y * y)
                    + (z * z)))
                    <= this.r2)) {
                    let p: Point3 = new Point3();
                    p.x = (this.src.x + x);
                    p.y = (this.src.y + y);
                    p.z = (this.src.z + z);
                    let dest: LightSample = new LightSample();
                    dest.setShadowRay(new Ray(state.getPoint(), p));
                    dest.setRadiance(this.radiance, this.radiance);
                    dest.traceShadow(state);
                    state.addSample(dest);
                }

            }

        }

    }

    public getPhoton(randX1: number, randY1: number, randX2: number, randY2: number, p: Point3, dir: Vector3, power: Color) {
        let phi: number = (<number>((2
        * (Math.PI * randX1))));
        let s: number = (<number>(Math.sqrt((1 - randY1))));
        this.dir.x = (this.r
        * ((<number>(Math.cos(phi))) * s));
        this.dir.y = (this.r
        * ((<number>(Math.sin(phi))) * s));
        this.dir.z = 0;
        this.basis.transform(this.dir);
        Point3.add(this.src, this.dir, p);
        this.dir.set(this.dir);
        power.set(this.radiance).mul(((<number>(Math.PI)) * this.r2));
    }

    public getPower(): number {
        return this.radiance.copy().mul(((<number>(Math.PI)) * this.r2)).getLuminance();
    }
}