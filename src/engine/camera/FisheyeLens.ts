import {Ray} from "../math/Ray";
import {CameraLens} from "./../core/CameraLens";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class FisheyeLens implements CameraLens {

    constructor(){}

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        return true;
    }

    public getRay(x:float, y:float, imageWidth:int, imageHeight:int, lensX:double, lensY:double, time:double): Ray {
        let cx:float = ((2
        * (x / imageWidth))
        - 1);
        let cy:float = ((2
        * (y / imageHeight))
        - 1);
        let r2:float = ((cx * cx)
        + (cy * cy));
        if ((r2 > 1)) {
            return null;
        }

        //  outside the fisheye
        return new Ray(0, 0, 0, cx, cy, -Math.sqrt(1 - r2));
    }
}