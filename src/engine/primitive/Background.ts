/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Background implements PrimitiveList {

    public constructor () {

    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        return true;
    }

    public prepareShadingState(state: ShadingState) {
        if ((state.getDepth() == 0)) {
            state.setShader(state.getInstance().getShader(0));
        }

    }

    public getNumPrimitives(): number {
        return 1;
    }

    public getPrimitiveBound(primID: number, i: number): number {
        return 0;
    }

    public getWorldBounds(o2w: Matrix4): BoundingBox {
        return null;
    }

    public intersectPrimitive(r: Ray, primID: number, state: IntersectionState) {
        if ((r.getMax() == Float.POSITIVE_INFINITY)) {
            state.setIntersection(0, 0, 0);
        }

    }

    public getBakingPrimitives(): PrimitiveList {
        return null;
    }
}