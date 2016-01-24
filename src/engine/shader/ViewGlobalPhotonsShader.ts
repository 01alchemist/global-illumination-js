/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ViewGlobalPhotonsShader implements Shader {

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        return true;
    }

    getRadiance(state:ShadingState):Color {
        state.faceforward();
        return state.getGlobalRadiance();
    }

    scatterPhoton(state:ShadingState, power:Color) {

    }
}