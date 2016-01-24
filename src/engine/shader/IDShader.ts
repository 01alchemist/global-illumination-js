/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class IDShader implements Shader {

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        return true;
    }

    getRadiance(state:ShadingState):Color {
        let n:Vector3 = state.getNormal();
        let f:number = (n == null);
        // TODO:Warning!!!, inline IF is not supported ?
        return (new Color(state.getInstance().hashCode()) + mul(f));
    }

    scatterPhoton(state:ShadingState, power:Color) {

    }
}