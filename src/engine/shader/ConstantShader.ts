/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ConstantShader implements Shader {

    private c:Color;

    constructor () {
        this.c = Color.WHITE;
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        this.c = pl.getColor("color", this.c);
        return true;
    }

    getRadiance(state:ShadingState):Color {
        return this.c;
    }

    scatterPhoton(state:ShadingState, power:Color) {

    }
}