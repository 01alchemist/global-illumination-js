import {PrimitiveList} from "../core/PrimitiveList";
import {AccelerationStructure} from "../core/AccelerationStructure";
import {Ray} from "../core/Ray";
import {IntersectionState} from "../core/IntersectionState";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class NullAccelerator implements AccelerationStructure {

    private primitives:PrimitiveList;

    private n:number;

    constructor () {
        this.primitives = null;
        this.n = 0;
    }

    build(primitives:PrimitiveList) {
        this.primitives = primitives;
        this.n = this.primitives.getNumPrimitives();
    }

    intersect(r:Ray, state:IntersectionState) {
        for (let i:number = 0; (i < this.n); i++) {
            this.primitives.intersectPrimitive(r, i, state);
        }

    }
}