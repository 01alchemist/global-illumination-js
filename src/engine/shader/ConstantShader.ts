/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ConstantShader implements Shader {

    private c: Color;

    public constructor () {
        this.c = Color.WHITE;
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        this.c = pl.getColor("color", this.c);
        return true;
    }

    public getRadiance(state: ShadingState): Color {
        return this.c;
    }

    public scatterPhoton(state: ShadingState, power: Color) {

    }
}