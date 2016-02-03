import {CameraLens} from "./../core/CameraLens";
import {ParameterList} from "../core/ParameterList";
import {GlobalIlluminationAPI} from "../GlobalIlluminatiionAPI";
import {Ray} from "../core/Ray";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class FisheyeLens implements CameraLens {

    constructor(){}

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        return true;
    }

    getRay(x:float, y:float, imageWidth:int, imageHeight:int, lensX:double, lensY:double, time:double):Ray {
        var cx:float = 2.0 * x / imageWidth - 1.0;
        var cy:float = 2.0 * y / imageHeight - 1.0;
        var r2:float = cx * cx + cy * cy;
        if (r2 > 1)
            return null; // outside the fisheye
        return new Ray(0, 0, 0, cx, cy, -Math.sqrt(1 - r2));
    }
}