import {CameraLens} from "../core/CameraLens";
import {Ray} from "../core/Ray";
import {ParameterList} from "../core/ParameterList";
import {GlobalIlluminationAPI} from "../GlobalIlluminatiionAPI";
import {MathUtils} from "../utils/MathUtils";
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
        this._update();
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        //  get parameters
        this.fov = pl.getFloat("fov", this.fov);
        this.aspect = pl.getFloat("aspect", this.aspect);
        this._update();
        return true;
    }

    private _update() {
        this.au = Math.tan(MathUtils.radians(this.fov * 0.5));
        this.av = this.au / this.aspect;
    }

    getRay(x:float, y:float, imageWidth:int, imageHeight:int, lensX:double, lensY:double, time:double):Ray {
        let du:float = (this.au * -1) + ((2 * (this.au * x)) / (imageWidth - 1));
        let dv:float = (this.av * -1) + ((2 * (this.av * y)) / (imageHeight - 1));
        return new Ray(0, 0, 0, du, dv, -1);
    }
}