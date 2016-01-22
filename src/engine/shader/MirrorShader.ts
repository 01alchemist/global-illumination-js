/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class MirrorShader implements Shader {

    private color: Color;

    public constructor () {
        this.color = Color.WHITE;
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        this.color = pl.getColor("color", this.color);
        return true;
    }

    public getRadiance(state: ShadingState): Color {
        if (!state.includeSpecular()) {
            return Color.BLACK;
        }

        state.faceforward();
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
        ret.sub(this.color);
        ret.mul(cos5);
        ret.add(this.color);
        return ret.mul(state.traceReflection(refRay, 0));
    }

    public scatterPhoton(state: ShadingState, power: Color) {
        let avg: number = this.color.getAverage();
        let rnd: number = state.getRandom(0, 0, 1);
        if ((rnd >= avg)) {
            return;
        }

        state.faceforward();
        let cos: number = state.getCosND();
        power.mul(this.color).mul((1 / avg));
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