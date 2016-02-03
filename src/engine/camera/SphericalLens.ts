import {CameraLens} from "../core/CameraLens";
import {Ray} from "../core/Ray";
import {ParameterList} from "../core/ParameterList";
import {GlobalIlluminationAPI} from "../GlobalIlluminatiionAPI";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class SphericalLens implements CameraLens {

    constructor() {

    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        return true;
    }

    getRay(x:float, y:float, imageWidth:int, imageHeight:int, lensX:double, lensY:double, time:double):Ray {
        // Generate environment camera ray direction
        var theta:double = 2 * Math.PI * x / imageWidth + Math.PI / 2;
        var phi:double = Math.PI * (imageHeight - 1 - y) / imageHeight;
        return new Ray(0, 0, 0, <float> (Math.cos(theta) * Math.sin(phi)), <float> (Math.cos(phi)), <float> (Math.sin(theta) * Math.sin(phi)));
    }
}