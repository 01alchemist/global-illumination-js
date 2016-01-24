/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class AmbientOcclusionShader implements Shader {

    private bright:Color;

    private dark:Color;

    private samples:number;

    private maxDist:number;

    constructor () {
        this.bright = Color.WHITE;
        this.dark = Color.BLACK;
        this.samples = 32;
        this.maxDist = Float.POSITIVE_INFINITY;
    }

    constructor (c:Color, d:number) :
    this() {
    this.();
    this.bright = c;
    this.maxDist = d;
}

update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
    this.bright = pl.getColor("bright", this.bright);
    this.dark = pl.getColor("dark", this.dark);
    this.samples = pl.getInt("samples", this.samples);
    this.maxDist = pl.getFloat("maxdist", this.maxDist);
    if ((this.maxDist <= 0)) {
        this.maxDist = Float.POSITIVE_INFINITY;
    }

    return true;
}

getBrightColor(state:ShadingState):Color {
    return this.bright;
}

getRadiance(state:ShadingState):Color {
    return state.occlusion(this.samples, this.maxDist, this.getBrightColor(state), this.dark);
}

scatterPhoton(state:ShadingState, power:Color) {

}
}