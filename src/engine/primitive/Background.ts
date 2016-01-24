/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Background implements PrimitiveList {

    constructor () {

    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        return true;
    }

    prepareShadingState(state:ShadingState) {
        if ((state.getDepth() == 0)) {
            state.setShader(state.getInstance().getShader(0));
        }

    }

    getNumPrimitives():number {
        return 1;
    }

    getPrimitiveBound(primID:number, i:number):number {
        return 0;
    }

    getWorldBounds(o2w:Matrix4):BoundingBox {
        return null;
    }

    intersectPrimitive(r:Ray, primID:number, state:IntersectionState) {
        if ((r.getMax() == Float.POSITIVE_INFINITY)) {
            state.setIntersection(0, 0, 0);
        }

    }

    getBakingPrimitives():PrimitiveList {
        return null;
    }
}