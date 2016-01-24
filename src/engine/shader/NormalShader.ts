/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class NormalShader implements Shader {

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        return true;
    }

    getRadiance(state:ShadingState):Color {
        let n:Vector3 = state.getNormal();
        if ((n == null)) {
            return Color.BLACK;
        }

        let r:number = ((n.x + 1)
        * 0.5);
        let g:number = ((n.y + 1)
        * 0.5);
        let b:number = ((n.z + 1)
        * 0.5);
        return new Color(r, g, b);
    }

    scatterPhoton(state:ShadingState, power:Color) {

    }
}