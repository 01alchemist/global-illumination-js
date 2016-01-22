/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class NullAccelerator implements AccelerationStructure {

    private primitives: PrimitiveList;

    private n: number;

    public constructor () {
        this.primitives = null;
        this.n = 0;
    }

    public build(primitives: PrimitiveList) {
        this.primitives = this.primitives;
        this.n = this.primitives.getNumPrimitives();
    }

    public intersect(r: Ray, state: IntersectionState) {
        for (let i: number = 0; (i < this.n); i++) {
            this.primitives.intersectPrimitive(r, i, state);
        }

    }
}