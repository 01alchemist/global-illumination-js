/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class AmbientOcclusionShader implements Shader {

    private bright: Color;

    private dark: Color;

    private samples: number;

    private maxDist: number;

    public constructor () {
        this.bright = Color.WHITE;
        this.dark = Color.BLACK;
        this.samples = 32;
        this.maxDist = Float.POSITIVE_INFINITY;
    }

    public constructor (c: Color, d: number) :
    this() {
    this.();
    this.bright = c;
    this.maxDist = d;
}

public update(pl: ParameterList, api: SunflowAPI): boolean {
    this.bright = pl.getColor("bright", this.bright);
    this.dark = pl.getColor("dark", this.dark);
    this.samples = pl.getInt("samples", this.samples);
    this.maxDist = pl.getFloat("maxdist", this.maxDist);
    if ((this.maxDist <= 0)) {
        this.maxDist = Float.POSITIVE_INFINITY;
    }

    return true;
}

public getBrightColor(state: ShadingState): Color {
    return this.bright;
}

public getRadiance(state: ShadingState): Color {
    return state.occlusion(this.samples, this.maxDist, this.getBrightColor(state), this.dark);
}

public scatterPhoton(state: ShadingState, power: Color) {

}
}