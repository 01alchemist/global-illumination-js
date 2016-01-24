import {Ray} from "./Ray";
import {Shape} from "../scene/shapes/Shape";
import {Vector3} from "./Vector3";
import {Color} from "./Color";
import {Material} from "../scene/materials/Material";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export class HitInfo{


    /**
     *
     * @param shape
     * @param position
     * @param normal
     * @param ray
     * @param color
     * @param material
     * @param inside
     */
    constructor(shape:Shape,
                position:Vector3,
                normal:Vector3,
                ray:Ray,
                color:Color,
                material:Material,
                inside:boolean){

    }
}
