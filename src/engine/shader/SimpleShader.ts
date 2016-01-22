/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class SimpleShader implements Shader {

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        return true;
    }

    public getRadiance(state: ShadingState): Color {
        return new Color(Math.abs(state.getRay().dot(state.getNormal())));
    }

    public scatterPhoton(state: ShadingState, power: Color) {

    }
}