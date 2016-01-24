/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ViewIrradianceShader implements Shader {

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        return true;
    }

    getRadiance(state:ShadingState):Color {
        state.faceforward();
        return (new Color() + set(state.getIrradiance(Color.WHITE)).mul((1 / (<number>(Math.PI)))));
    }

    scatterPhoton(state:ShadingState, power:Color) {

    }
}