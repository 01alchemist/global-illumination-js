/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class PathTracingGIEngine implements GIEngine {

    private samples: number;

    public constructor (options: Options) {
        this.samples = options.getInt("gi.path.samples", 16);
    }

    public requiresPhotons(): boolean {
        return false;
    }

    public init(scene: Scene): boolean {
        this.samples = Math.max(0, this.samples);
        UI.printInfo(Module.LIGHT, "Path tracer settings:");
        UI.printInfo(Module.LIGHT, "  * Samples: %d", this.samples);
        return true;
    }

    public getIrradiance(state: ShadingState, diffuseReflectance: Color): Color {
        if ((this.samples <= 0)) {
            return Color.BLACK;
        }

        //  compute new sample
        let irr: Color = Color.black();
        let onb: OrthoNormalBasis = state.getBasis();
        let w: Vector3 = new Vector3();
        let n: number = (state.getDiffuseDepth() == 0);
        // TODO: Warning!!!, inline IF is not supported ?
        for (let i: number = 0; (i < n); i++) {
            let xi: number = (<number>(state.getRandom(i, 0, n)));
            let xj: number = (<number>(state.getRandom(i, 1, n)));
            let phi: number = (<number>((xi * (2 * Math.PI))));
            let cosPhi: number = (<number>(Math.cos(phi)));
            let sinPhi: number = (<number>(Math.sin(phi)));
            let sinTheta: number = (<number>(Math.sqrt(xj)));
            let cosTheta: number = (<number>(Math.sqrt((1 - xj))));
            w.x = (cosPhi * sinTheta);
            w.y = (sinPhi * sinTheta);
            w.z = cosTheta;
            onb.transform(w);
            let temp: ShadingState = state.traceFinalGather(new Ray(state.getPoint(), w), i);
            if ((temp != null)) {
                temp.getInstance().prepareShadingState(temp);
                if ((temp.getShader() != null)) {
                    irr.add(temp.getShader().getRadiance(temp));
                }

            }

        }

        irr.mul(((<number>(Math.PI)) / n));
        return irr;
    }

    public getGlobalRadiance(state: ShadingState): Color {
        return Color.BLACK;
    }
}