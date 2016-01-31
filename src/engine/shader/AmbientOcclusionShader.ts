import {Shader} from "../core/Shader";
import {Color} from "../math/Color";
import {Float} from "../../utils/BrowserPlatform";
import {ParameterList} from "../core/ParameterList";
import {GlobalIlluminationAPI} from "../GlobalIlluminatiionAPI";
import {ShadingState} from "../core/ShadingState";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class AmbientOcclusionShader implements Shader {

    private bright:Color;
    private dark:Color;
    private samples:int;
    private maxDist:float;

    constructor(c:Color = Color.WHITE, d:float = Float.POSITIVE_INFINITY) {
        this.bright = c;
        this.dark = Color.BLACK;
        this.samples = 32;
        this.maxDist = d;
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        this.bright = pl.getColor("bright", this.bright);
        this.dark = pl.getColor("dark", this.dark);
        this.samples = pl.getInt("samples", this.samples);
        this.maxDist = pl.getFloat("maxdist", this.maxDist);
        if ((this.maxDist <= 0)) {
            this.maxDist = Float.POSITIVE_INFINITY;
        }

        return true;
    }

    getBrightColor(state:ShadingState):Color {
        return this.bright;
    }

    getRadiance(state:ShadingState):Color {
        return state.occlusion(this.samples, this.maxDist, this.getBrightColor(state), this.dark);
    }

    scatterPhoton(state:ShadingState, power:Color) {

    }
}