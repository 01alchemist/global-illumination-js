/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ViewIrradianceShader implements Shader {

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        return true;
    }

    public getRadiance(state: ShadingState): Color {
        state.faceforward();
        return (new Color() + set(state.getIrradiance(Color.WHITE)).mul((1 / (<number>(Math.PI)))));
    }

    public scatterPhoton(state: ShadingState, power: Color) {

    }
}