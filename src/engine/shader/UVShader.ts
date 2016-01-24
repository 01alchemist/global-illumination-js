/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class UVShader implements Shader {

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        return true;
    }

    getRadiance(state:ShadingState):Color {
        if ((state.getUV() == null)) {
            return Color.BLACK;
        }

        return new Color(state.getUV().x, state.getUV().y, 0);
    }

    scatterPhoton(state:ShadingState, power:Color) {

    }
}