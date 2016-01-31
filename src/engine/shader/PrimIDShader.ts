import {Color} from "../math/Color";
import {Shader} from "../core/Shader";
import {GlobalIlluminationAPI} from "../GlobalIlluminatiionAPI";
import {ParameterList} from "../core/ParameterList";
import {ShadingState} from "../core/ShadingState";
import {Vector3} from "../math/Vector3";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class PrimIDShader implements Shader {

    private static BORDERS:Color[] = [
        Color.GREEN,
        Color.BLUE,
        Color.YELLOW,
        Color.CYAN,
        Color.MAGENTA,
    ];

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        return true;
    }

    getRadiance(state:ShadingState):Color {
        let n:Vector3 = state.getNormal();
        let f:float = n == null ? 1.0 : Math.abs(state.getRay().dot(n));
        return PrimIDShader.BORDERS[(state.getPrimitiveID() % PrimIDShader.BORDERS.length)].clone().mul(f);
    }

    scatterPhoton(state:ShadingState, power:Color) {

    }
}