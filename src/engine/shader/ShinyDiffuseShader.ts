/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ShinyDiffuseShader implements Shader {

    private diff: Color;

    private refl: number;

    public constructor () {
        this.diff = Color.GRAY;
        this.refl = 0.5;
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        this.diff = pl.getColor("diffuse", this.diff);
        this.refl = pl.getFloat("shiny", this.refl);
        return true;
    }

    public getDiffuse(state: ShadingState): Color {
        return this.diff;
    }

    public getRadiance(state: ShadingState): Color {
        //  make sure we are on the right side of the material
        state.faceforward();
        //  direct lighting
        state.initLightSamples();
        state.initCausticSamples();
        let d: Color = this.getDiffuse(state);
        let lr: Color = state.diffuse(d);
        if (!state.includeSpecular()) {
            return lr;
        }

        let cos: number = state.getCosND();
        let dn: number = (2 * cos);
        let refDir: Vector3 = new Vector3();
        refDir.x = ((dn * state.getNormal().x)
        + state.getRay().getDirection().x);
        refDir.y = ((dn * state.getNormal().y)
        + state.getRay().getDirection().y);
        refDir.z = ((dn * state.getNormal().z)
        + state.getRay().getDirection().z);
        let refRay: Ray = new Ray(state.getPoint(), refDir);
        //  compute Fresnel term
        cos = (1 - cos);
        let cos2: number = (cos * cos);
        let cos5: number = (cos2
        * (cos2 * cos));
        let ret: Color = Color.white();
        let r: Color = d.copy().mul(this.refl);
        ret.sub(r);
        ret.mul(cos5);
        ret.add(r);
        return lr.add(ret.mul(state.traceReflection(refRay, 0)));
    }

    public scatterPhoton(state: ShadingState, power: Color) {
        let diffuse: Color;
        //  make sure we are on the right side of the material
        state.faceforward();
        diffuse = this.getDiffuse(state);
        state.storePhoton(state.getRay().getDirection(), power, diffuse);
        let d: number = diffuse.getAverage();
        let r: number = (d * this.refl);
        let rnd: number = state.getRandom(0, 0, 1);
        if ((rnd < d)) {
            //  photon is scattered
            power.mul(diffuse).mul((1 / d));
            let onb: OrthoNormalBasis = state.getBasis();
            let u: number = (2
            * (Math.PI
            * (rnd / d)));
            let v: number = state.getRandom(0, 1, 1);
            let s: number = (<number>(Math.sqrt(v)));
            let s1: number = (<number>(Math.sqrt((1 - v))));
            let w: Vector3 = new Vector3(((<number>(Math.cos(u))) * s), ((<number>(Math.sin(u))) * s), s1);
            w = onb.transform(w, new Vector3());
            state.traceDiffusePhoton(new Ray(state.getPoint(), w), power);
        }
        else if ((rnd
            < (d + r))) {
            let cos: number = (Vector3.dot(state.getNormal(), state.getRay().getDirection()) * -1);
            power.mul(diffuse).mul((1 / d));
            //  photon is reflected
            let dn: number = (2 * cos);
            let dir: Vector3 = new Vector3();
            dir.x = ((dn * state.getNormal().x)
            + state.getRay().getDirection().x);
            dir.y = ((dn * state.getNormal().y)
            + state.getRay().getDirection().y);
            dir.z = ((dn * state.getNormal().z)
            + state.getRay().getDirection().z);
            state.traceReflectionPhoton(new Ray(state.getPoint(), dir), power);
        }

    }
}