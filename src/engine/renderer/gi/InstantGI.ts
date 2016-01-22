/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class InstantGI implements GIEngine {

    private numPhotons: number;

    private numSets: number;

    private c: number;

    private numBias: number;

    private virtualLights: PointLight[,];

    public constructor (options: Options) {
        this.numPhotons = options.getInt("gi.igi.samples", 64);
        this.numSets = options.getInt("gi.igi.sets", 1);
        this.c = options.getFloat("gi.igi.c", 3E-05);
        this.numBias = options.getInt("gi.igi.bias_samples", 0);
        this.virtualLights = null;
    }

    public getGlobalRadiance(state: ShadingState): Color {
        let p: Point3 = state.getPoint();
        let n: Vector3 = state.getNormal();
        let set: number = (<number>((state.getRandom(0, 1, 1) * this.numSets)));
        let maxAvgPow: number = 0;
        let minDist: number = 1;
        let pow: Color = null;
        for (let vpl: PointLight in this.virtualLights[set]) {
            maxAvgPow = Math.max(maxAvgPow, vpl.power.getAverage());
            if ((Vector3.dot(n, vpl.n) > 0.9)) {
                let d: number = vpl.p.distanceToSquared(p);
                if ((d < minDist)) {
                    pow = vpl.power;
                    minDist = d;
                }

            }

        }

        return (pow == null);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    public init(scene: Scene): boolean {
        if ((this.numSets < 1)) {
            this.numSets = 1;
        }

        UI.printInfo(Module.LIGHT, "Instant Global Illumination settings:");
        UI.printInfo(Module.LIGHT, "  * Samples:     %d", this.numPhotons);
        UI.printInfo(Module.LIGHT, "  * Sets:        %d", this.numSets);
        UI.printInfo(Module.LIGHT, "  * Bias bound:  %f", this.c);
        UI.printInfo(Module.LIGHT, "  * Bias rays:   %d", this.numBias);
        this.virtualLights = new Array(this.numSets);
        if ((this.numPhotons > 0)) {
            for (let seed: number = 0; (i < this.virtualLights.length); i++) {
            }

            let i: number = 0;
            seed = (seed + this.numPhotons);
            let map: PointLightStore = new PointLightStore();
            if (!scene.calculatePhotons(map, "virtual", seed)) {
                return false;
            }

            this.virtualLights[i] = map.virtualLights.toArray(new Array(map.virtualLights.size()));
            UI.printInfo(Module.LIGHT, "Stored %d virtual point lights for set %d of %d", this.virtualLights[i].length, (i + 1), this.numSets);
        }
        else {
            //  create an empty array
            for (let i: number = 0; (i < this.virtualLights.length); i++) {
                this.virtualLights[i] = new Array(0);
            }

        }

        return true;
    }

    public getIrradiance(state: ShadingState, diffuseReflectance: Color): Color {
        let b: number = ((<number>(Math.PI))
        * (this.c / diffuseReflectance.getMax()));
        let irr: Color = Color.black();
        let p: Point3 = state.getPoint();
        let n: Vector3 = state.getNormal();
        let set: number = (<number>((state.getRandom(0, 1, 1) * this.numSets)));
        for (let vpl: PointLight in this.virtualLights[set]) {
            let r: Ray = new Ray(p, vpl.p);
            let dotNlD: number = (((r.dx * vpl.n.x)
            + ((r.dy * vpl.n.y)
            + (r.dz * vpl.n.z)))
            * -1);
            let dotND: number = ((r.dx * n.x)
            + ((r.dy * n.y)
            + (r.dz * n.z)));
            if (((dotNlD > 0)
                && (dotND > 0))) {
                let r2: number = (r.getMax() * r.getMax());
                let opacity: Color = state.traceShadow(r);
                let power: Color = Color.blend(vpl.power, Color.BLACK, opacity);
                let g: number = ((dotND * dotNlD)
                / r2);
                irr.madd((0.25 * Math.min(g, b)), power);
            }

        }

        //  bias compensation
        let nb: number = ((state.getDiffuseDepth() == 0)
        || (this.numBias <= 0));
        // TODO: Warning!!!, inline IF is not supported ?
        if ((nb <= 0)) {
            return irr;
        }

        let onb: OrthoNormalBasis = state.getBasis();
        let w: Vector3 = new Vector3();
        let scale: number = ((<number>(Math.PI)) / nb);
        for (let i: number = 0; (i < nb); i++) {
            let xi: number = (<number>(state.getRandom(i, 0, nb)));
            let xj: number = (<number>(state.getRandom(i, 1, nb)));
            let phi: number = (<number>((xi * (2 * Math.PI))));
            let cosPhi: number = (<number>(Math.cos(phi)));
            let sinPhi: number = (<number>(Math.sin(phi)));
            let sinTheta: number = (<number>(Math.sqrt(xj)));
            let cosTheta: number = (<number>(Math.sqrt((1 - xj))));
            w.x = (cosPhi * sinTheta);
            w.y = (sinPhi * sinTheta);
            w.z = cosTheta;
            onb.transform(w);
            let r: Ray = new Ray(state.getPoint(), w);
            r.setMax((<number>(Math.sqrt((cosTheta / b)))));
            let temp: ShadingState = state.traceFinalGather(r, i);
            if ((temp != null)) {
                temp.getInstance().prepareShadingState(temp);
                if ((temp.getShader() != null)) {
                    let dist: number = temp.getRay().getMax();
                    let r2: number = (dist * dist);
                    let cosThetaY: number = (Vector3.dot(w, temp.getNormal()) * -1);
                    if ((cosThetaY > 0)) {
                        let g: number = ((cosTheta * cosThetaY)
                        / r2);
                        //  was this path accounted for yet?
                        if ((g > b)) {
                            irr.madd((scale
                            * ((g - b)
                            / g)), temp.getShader().getRadiance(temp));
                        }

                    }

                }

            }

        }

        return irr;
    }

    class PointLight {

    p: Point3;

    n: Vector3;

    power: Color;
}

class PointLightStore implements PhotonStore {

    virtualLights: ArrayList<PointLight> = new ArrayList<PointLight>();

    public numEmit(): number {
        return numPhotons;
    }

    public prepare(sceneBounds: BoundingBox) {

    }

    public store(state: ShadingState, dir: Vector3, power: Color, diffuse: Color) {
        state.faceforward();
        let vpl: PointLight = new PointLight();
        vpl.p = state.getPoint();
        vpl.n = state.getNormal();
        vpl.power = power;
        this;
        this.virtualLights.add(vpl);
    }

    public init() {

    }

    public allowDiffuseBounced(): boolean {
        return true;
    }

    public allowReflectionBounced(): boolean {
        return true;
    }

    public allowRefractionBounced(): boolean {
        return true;
    }
}
}