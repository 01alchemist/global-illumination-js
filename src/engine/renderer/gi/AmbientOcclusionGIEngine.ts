import {Color} from "../../math/Color";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class AmbientOcclusionGIEngine implements GIEngine {

    private bright: Color;

    private dark: Color;

    private samples: number;

    private maxDist: number;

    public constructor (options: Options) {
        this.bright = options.getColor("gi.ambocc.bright", Color.WHITE);
        this.dark = options.getColor("gi.ambocc.dark", Color.BLACK);
        this.samples = options.getInt("gi.ambocc.samples", 32);
        this.maxDist = options.getFloat("gi.ambocc.maxdist", 0);
        this.maxDist = (this.maxDist <= 0);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    public getGlobalRadiance(state: ShadingState): Color {
        return Color.BLACK;
    }

    public init(scene: Scene): boolean {
        return true;
    }

    public getIrradiance(state: ShadingState, diffuseReflectance: Color): Color {
        let onb: OrthoNormalBasis = state.getBasis();
        let w: Vector3 = new Vector3();
        let result: Color = Color.black();
        for (let i: number = 0; (i < this.samples); i++) {
            let xi: number = (<number>(state.getRandom(i, 0, this.samples)));
            let xj: number = (<number>(state.getRandom(i, 1, this.samples)));
            let phi: number = (<number>((2
            * (Math.PI * xi))));
            let cosPhi: number = (<number>(Math.cos(phi)));
            let sinPhi: number = (<number>(Math.sin(phi)));
            let sinTheta: number = (<number>(Math.sqrt(xj)));
            let cosTheta: number = (<number>(Math.sqrt((1 - xj))));
            w.x = (cosPhi * sinTheta);
            w.y = (sinPhi * sinTheta);
            w.z = cosTheta;
            onb.transform(w);
            let r: Ray = new Ray(state.getPoint(), w);
            r.setMax(this.maxDist);
            result.add(Color.blend(this.bright, this.dark, state.traceShadow(r)));
        }

        return result.mul(((<number>(Math.PI)) / this.samples));
    }
}