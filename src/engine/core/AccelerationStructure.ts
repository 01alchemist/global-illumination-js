/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export interface AccelerationStructure {
    build(primitives: PrimitiveList);

    intersect(r: Ray, istate: IntersectionState);
}