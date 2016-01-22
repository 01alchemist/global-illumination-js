/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class SphereLight implements LightSource, Shader {

    private radiance: Color;

    private numSamples: number;

    private center: Point3;

    private radius: number;

    private r2: number;

    public constructor () {
        this.radiance = Color.WHITE;
        this.numSamples = 4;
        this.center = new Point3();
        this.r2 = 1;
        this.radius = 1;
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        this.radiance = pl.getColor("radiance", this.radiance);
        this.numSamples = pl.getInt("samples", this.numSamples);
        this.radius = pl.getFloat("radius", this.radius);
        this.r2 = (this.radius * this.radius);
        this.center = pl.getPoint("center", this.center);
        return true;
    }

    public init(name: String, api: SunflowAPI) {
        api.light(name, this);
        api.geometry((name + ".geo"), new Sphere());
        api.shader((name + ".shader"), this);
        api.parameter("shaders", (name + ".shader"));
        api.parameter("transform", Matrix4.translation(this.center.x, this.center.y, this.center.z).multiply(Matrix4.scale(this.radius)));
        api.instance((name + ".instance"), (name + ".geo"));
    }

    public getNumSamples(): number {
        return this.numSamples;
    }

    public getLowSamples(): number {
        return 1;
    }

    public isVisible(state: ShadingState): boolean {
        return (state.getPoint().distanceToSquared(this.center) > this.r2);
    }

    public getSamples(state: ShadingState) {
        if ((this.getNumSamples() <= 0)) {
            return;
        }

        let wc: Vector3 = Point3.sub(this.center, state.getPoint(), new Vector3());
        let l2: number = wc.lengthSquared();
        if ((l2 <= this.r2)) {
            return;
        }

        //  inside the sphere?
        //  top of the sphere as viewed from the current shading point
        let topX: number = (wc.x
        + (state.getNormal().x * this.radius));
        let topY: number = (wc.y
        + (state.getNormal().y * this.radius));
        let topZ: number = (wc.z
        + (state.getNormal().z * this.radius));
        if ((state.getNormal().dot(topX, topY, topZ) <= 0)) {
            return;
        }

        //  top of the sphere is below the horizon
        let cosThetaMax: number = (<number>(Math.sqrt(Math.max(0, (1
        - (this.r2 / Vector3.dot(wc, wc)))))));
        let basis: OrthoNormalBasis = OrthoNormalBasis.makeFromW(wc);
        let samples: number = (state.getDiffuseDepth() > 0);
        // TODO: Warning!!!, inline IF is not supported ?
        let scale: number = (<number>((2
        * (Math.PI * (1 - cosThetaMax)))));
        let c: Color = Color.mul((scale / samples), this.radiance);
        for (let i: number = 0; (i < samples); i++) {
            //  random offset on unit square
            let randX: number = state.getRandom(i, 0, samples);
            let randY: number = state.getRandom(i, 1, samples);
            //  cone sampling
            let cosTheta: number = (((1 - randX)
            * cosThetaMax)
            + randX);
            let sinTheta: number = Math.sqrt((1
            - (cosTheta * cosTheta)));
            let phi: number = (randY * (2 * Math.PI));
            let dir: Vector3 = new Vector3((<number>((Math.cos(phi) * sinTheta))), (<number>((Math.sin(phi) * sinTheta))), (<number>(cosTheta)));
            basis.transform(dir);
            //  check that the direction of the sample is the same as the
            //  normal
            let cosNx: number = Vector3.dot(dir, state.getNormal());
            if ((cosNx <= 0)) {
                // TODO: Warning!!! continue If
            }

            let ocx: number = (state.getPoint().x - this.center.x);
            let ocy: number = (state.getPoint().y - this.center.y);
            let ocz: number = (state.getPoint().z - this.center.z);
            let qa: number = Vector3.dot(dir, dir);
            let qb: number = (2
            * ((dir.x * ocx)
            + ((dir.y * ocy)
            + (dir.z * ocz))));
            let qc: number = (((ocx * ocx)
            + ((ocy * ocy)
            + (ocz * ocz)))
            - this.r2);
            let t: number[] = Solvers.solveQuadric(qa, qb, qc);
            if ((t == null)) {
                // TODO: Warning!!! continue If
            }

            let dest: LightSample = new LightSample();
            //  compute shadow ray to the sampled point
            dest.setShadowRay(new Ray(state.getPoint(), dir));
            //  FIXME: arbitrary bias, should handle as in other places
            dest.getShadowRay().setMax(((<number>(t[0])) - 0.001));
            //  prepare sample
            dest.setRadiance(c, c);
            dest.traceShadow(state);
            state.addSample(dest);
        }

    }

    public getPhoton(randX1: number, randY1: number, randX2: number, randY2: number, p: Point3, dir: Vector3, power: Color) {
        let z: number = (<number>((1 - (2 * randX2))));
        let r: number = (<number>(Math.sqrt(Math.max(0, (1
        - (z * z))))));
        let phi: number = (<number>((2
        * (Math.PI * randY2))));
        let x: number = (r * (<number>(Math.cos(phi))));
        let y: number = (r * (<number>(Math.sin(phi))));
        p.x = (this.center.x
        + (x * this.radius));
        p.y = (this.center.y
        + (y * this.radius));
        p.z = (this.center.z
        + (z * this.radius));
        let basis: OrthoNormalBasis = OrthoNormalBasis.makeFromW(new Vector3(x, y, z));
        phi = (<number>((2
        * (Math.PI * randX1))));
        let cosPhi: number = (<number>(Math.cos(phi)));
        let sinPhi: number = (<number>(Math.sin(phi)));
        let sinTheta: number = (<number>(Math.sqrt(randY1)));
        let cosTheta: number = (<number>(Math.sqrt((1 - randY1))));
        dir.x = (cosPhi * sinTheta);
        dir.y = (sinPhi * sinTheta);
        dir.z = cosTheta;
        basis.transform(dir);
        power.set(this.radiance);
        power.mul((<number>((Math.PI
        * (Math.PI * (4 * this.r2))))));
    }

    public getPower(): number {
        return this.radiance.copy().mul((<number>((Math.PI
        * (Math.PI * (4 * this.r2)))))).getLuminance();
    }

    public getRadiance(state: ShadingState): Color {
        if (!state.includeLights()) {
            return Color.BLACK;
        }

        state.faceforward();
        //  emit constant radiance
        return state.isBehind();
        // TODO: Warning!!!, inline IF is not supported ?
    }

    public scatterPhoton(state: ShadingState, power: Color) {
        //  do not scatter photons
    }
}