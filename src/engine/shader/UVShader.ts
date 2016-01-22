/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class UVShader implements Shader {

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        return true;
    }

    public getRadiance(state: ShadingState): Color {
        if ((state.getUV() == null)) {
            return Color.BLACK;
        }

        return new Color(state.getUV().x, state.getUV().y, 0);
    }

    public scatterPhoton(state: ShadingState, power: Color) {

    }
}