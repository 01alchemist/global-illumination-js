import {CameraLens} from "./../core/CameraLens";
import {Ray} from "../math/Ray";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class PinholeLens implements CameraLens {

    private au:float;

    private av:float;

    private aspect:float;

    private fov:float;

    constructor() {
        this.fov = 90;
        this.aspect = 1;
        this.update();
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        //  get parameters
        this.fov = pl.getFloat("fov", this.fov);
        this.aspect = pl.getFloat("aspect", this.aspect);
        this.update();
        return true;
    }

    private update() {
        this.au = (<float>(Math.tan(Math.toRadians((this.fov * 0.5)))));
        this.av = (this.au / this.aspect);
    }

    getRay(x:float, y:float, imageWidth:int, imageHeight:int, lensX:double, lensY:double, time:double):Ray {
        let du:float = ((this.au * -1) + ((2 * (this.au * x)) / (imageWidth - 1)));
        let dv:float = ((this.av * -1) + ((2 * (this.av * y)) / (imageHeight - 1)));
        return new Ray(0, 0, 0, du, dv, -1);
    }
}