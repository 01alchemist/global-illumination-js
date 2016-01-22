/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ViewGlobalPhotonsShader implements Shader {

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        return true;
    }

    public getRadiance(state: ShadingState): Color {
        state.faceforward();
        return state.getGlobalRadiance();
    }

    public scatterPhoton(state: ShadingState, power: Color) {

    }
}