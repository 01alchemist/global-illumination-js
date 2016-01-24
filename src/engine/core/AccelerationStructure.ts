import {IntersectionState} from "./IntersectionState";
import {PrimitiveList} from "./PrimitiveList";
import {Ray} from "./Ray";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export interface AccelerationStructure {
    build(primitives:PrimitiveList);

    intersect(r:Ray, istate:IntersectionState);
}