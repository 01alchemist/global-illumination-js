/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export interface PrimitiveList extends RenderObject {

    getWorldBounds(o2w: Matrix4): BoundingBox;

    getNumPrimitives(): number;

    getPrimitiveBound(primID: number, i: number): number;

    intersectPrimitive(r: Ray, primID: number, state: IntersectionState);

    prepareShadingState(state: ShadingState);

    getBakingPrimitives(): PrimitiveList;
}