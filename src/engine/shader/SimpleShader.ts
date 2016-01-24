/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class SimpleShader implements Shader {

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        return true;
    }

    getRadiance(state:ShadingState):Color {
        return new Color(Math.abs(state.getRay().dot(state.getNormal())));
    }

    scatterPhoton(state:ShadingState, power:Color) {

    }
}