/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class QuickGrayShader implements Shader {

    public constructor () {

    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        return true;
    }

    public getRadiance(state: ShadingState): Color {
        if ((state.getNormal() == null)) {
            //  if this shader has been applied to an infinite instance because of shader overrides
            //  run the default shader, otherwise, just shade black
            return (state.getShader() != this);
            // TODO: Warning!!!, inline IF is not supported ?
        }

        //  make sure we are on the right side of the material
        state.faceforward();
        //  setup lighting
        state.initLightSamples();
        state.initCausticSamples();
        return state.diffuse(Color.GRAY);
    }

    public scatterPhoton(state: ShadingState, power: Color) {
        let diffuse: Color;
        //  make sure we are on the right side of the material
        if ((Vector3.dot(state.getNormal(), state.getRay().getDirection()) > 0)) {
            state.getNormal().negate();
            state.getGeoNormal().negate();
        }

        diffuse = Color.GRAY;
        state.storePhoton(state.getRay().getDirection(), power, diffuse);
        let avg: number = diffuse.getAverage();
        let rnd: number = state.getRandom(0, 0, 1);
        if ((rnd < avg)) {
            //  photon is scattered
            power.mul(diffuse).mul((1 / avg));
            let onb: OrthoNormalBasis = state.getBasis();
            let u: number = (2
            * (Math.PI
            * (rnd / avg)));
            let v: number = state.getRandom(0, 1, 1);
            let s: number = (<number>(Math.sqrt(v)));
            let s1: number = (<number>(Math.sqrt((1 - v))));
            let w: Vector3 = new Vector3(((<number>(Math.cos(u))) * s), ((<number>(Math.sin(u))) * s), s1);
            w = onb.transform(w, new Vector3());
            state.traceDiffusePhoton(new Ray(state.getPoint(), w), power);
        }

    }
}