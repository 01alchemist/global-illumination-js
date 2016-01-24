/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class PrimIDShader implements Shader {

    private static BORDERS:Color[];

    private static Color.GREEN:Color[];

    private static Color.BLUE:Color[];

    private static Color.YELLOW:Color[];

    private static Color.CYAN:Color[];

    private static Color.MAGENTA:Color[];

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        return true;
    }

    getRadiance(state:ShadingState):Color {
        let n:Vector3 = state.getNormal();
        let f:number = (n == null);
        // TODO:Warning!!!, inline IF is not supported ?
        return BORDERS[(state.getPrimitiveID() % BORDERS.length)].copy().mul(f);
    }

    scatterPhoton(state:ShadingState, power:Color) {

    }
}