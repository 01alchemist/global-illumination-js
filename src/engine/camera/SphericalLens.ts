import {CameraLens} from "./../core/CameraLens";
import {Ray} from "../math/Ray";
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
        //  Generate environment camera ray direction
        let theta:number = ((2
        * (Math.PI
        * (x / imageWidth)))
        + (Math.PI / 2));
        let phi:number = (Math.PI
        * ((imageHeight - (1 - y))
        / imageHeight));
        return new Ray(0, 0, 0, (<number>((Math.cos(theta) * Math.sin(phi)))), (<number>(Math.cos(phi))), (<number>((Math.sin(theta) * Math.sin(phi)))));
    }
}