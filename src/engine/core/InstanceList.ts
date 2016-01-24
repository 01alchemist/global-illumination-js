/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class InstanceList implements PrimitiveList {

    private instances:Instance[];

    constructor () {
        this.instances = new Array(0);
    }

    constructor (instances:Instance[]) {
        this.instances = this.instances;
    }

    getPrimitiveBound(primID:number, i:number):number {
        return this.instances[primID].getBounds().getBound(i);
    }

    getWorldBounds(o2w:Matrix4):BoundingBox {
        let bounds:BoundingBox = new BoundingBox();
        for (let i:Instance in this.instances) {
            bounds.include(i.getBounds());
        }

        return bounds;
    }

    intersectPrimitive(r:Ray, primID:number, state:IntersectionState) {
        this.instances[primID].intersect(r, state);
    }

    getNumPrimitives():number {
        return this.instances.length;
    }

    getNumPrimitives(primID:number):number {
        return this.instances[primID].getNumPrimitives();
    }

    prepareShadingState(state:ShadingState) {
        state.getInstance().prepareShadingState(state);
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        //  TODO:build accelstructure into this (?)
        return true;
    }

    getBakingPrimitives():PrimitiveList {
        return null;
    }
}