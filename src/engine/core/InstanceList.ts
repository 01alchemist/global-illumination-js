/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class InstanceList implements PrimitiveList {

    private instances: Instance[];

    constructor () {
        this.instances = new Array(0);
    }

    constructor (instances: Instance[]) {
        this.instances = this.instances;
    }

    public getPrimitiveBound(primID: number, i: number): number {
        return this.instances[primID].getBounds().getBound(i);
    }

    public getWorldBounds(o2w: Matrix4): BoundingBox {
        let bounds: BoundingBox = new BoundingBox();
        for (let i: Instance in this.instances) {
            bounds.include(i.getBounds());
        }

        return bounds;
    }

    public intersectPrimitive(r: Ray, primID: number, state: IntersectionState) {
        this.instances[primID].intersect(r, state);
    }

    public getNumPrimitives(): number {
        return this.instances.length;
    }

    public getNumPrimitives(primID: number): number {
        return this.instances[primID].getNumPrimitives();
    }

    public prepareShadingState(state: ShadingState) {
        state.getInstance().prepareShadingState(state);
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        //  TODO: build accelstructure into this (?)
        return true;
    }

    public getBakingPrimitives(): PrimitiveList {
        return null;
    }
}