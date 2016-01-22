/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class PhongShader implements Shader {

    private diff: Color;

    private spec: Color;

    private power: number;

    private numRays: number;

    public constructor () {
        this.diff = Color.GRAY;
        this.spec = Color.GRAY;
        this.power = 20;
        this.numRays = 4;
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        this.diff = pl.getColor("diffuse", this.diff);
        this.spec = pl.getColor("specular", this.spec);
        this.power = pl.getFloat("power", this.power);
        this.numRays = pl.getInt("samples", this.numRays);
        return true;
    }

    protected getDiffuse(state: ShadingState): Color {
        return this.diff;
    }

    public getRadiance(state: ShadingState): Color {
        //  make sure we are on the right side of the material
        state.faceforward();
        //  setup lighting
        state.initLightSamples();
        state.initCausticSamples();
        //  execute shader
        return state.diffuse(this.getDiffuse(state)).add(state.specularPhong(this.spec, this.power, this.numRays));
    }

    public scatterPhoton(state: ShadingState, power: Color) {
        //  make sure we are on the right side of the material
        state.faceforward();
        let d: Color = this.getDiffuse(state);
        state.storePhoton(state.getRay().getDirection(), this.power, d);
        let avgD: number = d.getAverage();
        let avgS: number = this.spec.getAverage();
        let rnd: number = state.getRandom(0, 0, 1);
        if ((rnd < avgD)) {
            //  photon is scattered diffusely
            this.power.mul(d).mul((1 / avgD));
            let onb: OrthoNormalBasis = state.getBasis();
            let u: number = (2
            * (Math.PI
            * (rnd / avgD)));
            let v: number = state.getRandom(0, 1, 1);
            let s: number = (<number>(Math.sqrt(v)));
            let s1: number = (<number>(Math.sqrt((1 - v))));
            let w: Vector3 = new Vector3(((<number>(Math.cos(u))) * s), ((<number>(Math.sin(u))) * s), s1);
            w = onb.transform(w, new Vector3());
            state.traceDiffusePhoton(new Ray(state.getPoint(), w), this.power);
        }
        else if ((rnd
            < (avgD + avgS))) {
            //  photon is scattered specularly
            let dn: number = (2 * state.getCosND());
            //  reflected direction
            let refDir: Vector3 = new Vector3();
            refDir.x = ((dn * state.getNormal().x)
            + state.getRay().dx);
            refDir.y = ((dn * state.getNormal().y)
            + state.getRay().dy);
            refDir.z = ((dn * state.getNormal().z)
            + state.getRay().dz);
            this.power.mul(this.spec).mul((1 / avgS));
            let onb: OrthoNormalBasis = state.getBasis();
            let u: number = (2
            * (Math.PI
            * ((rnd - avgD)
            / avgS)));
            let v: number = state.getRandom(0, 1, 1);
            let s: number = (<number>(Math.pow(v, (1
            / (this.power + 1)))));
            let s1: number = (<number>(Math.sqrt((1
            - (s * s)))));
            let w: Vector3 = new Vector3(((<number>(Math.cos(u))) * s1), ((<number>(Math.sin(u))) * s1), s);
            w = onb.transform(w, new Vector3());
            state.traceReflectionPhoton(new Ray(state.getPoint(), w), this.power);
        }

    }
}