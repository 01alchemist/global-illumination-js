import {ShadingState} from "./ShadingState";
import {IntersectionState} from "./IntersectionState";
import {Ray} from "../math/Ray";
import {BoundingBox} from "../math/BoundingBox";
import {Matrix4} from "../math/Matrix4";
import {RenderObject} from "./RenderObject";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export interface PrimitiveList extends RenderObject {

    getWorldBounds(o2w:Matrix4):BoundingBox;

    getNumPrimitives():number;

    getPrimitiveBound(primID:number, i:number):number;

    intersectPrimitive(r:Ray, primID:number, state:IntersectionState);

    prepareShadingState(state:ShadingState);

    getBakingPrimitives():PrimitiveList;
}