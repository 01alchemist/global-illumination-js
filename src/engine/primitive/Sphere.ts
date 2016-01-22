/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Sphere implements PrimitiveList {

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        return true;
    }

    public getWorldBounds(o2w: Matrix4): BoundingBox {
        let bounds: BoundingBox = new BoundingBox(1);
        if ((o2w != null)) {
            bounds = o2w.transform(bounds);
        }

        return bounds;
    }

    public getPrimitiveBound(primID: number, i: number): number {
        return ((i & 1)
        == 0);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    public getNumPrimitives(): number {
        return 1;
    }

    public prepareShadingState(state: ShadingState) {
        state.init();
        state.getRay().getPoint(state.getPoint());
        let parent: Instance = state.getInstance();
        let localPoint: Point3 = parent.transformWorldToObject(state.getPoint());
        state.getNormal().set(localPoint.x, localPoint.y, localPoint.z);
        state.getNormal().normalize();
        let phi: number = (<number>(Math.atan2(state.getNormal().y, state.getNormal().x)));
        if ((phi < 0)) {
            phi = (phi + (2 * Math.PI));
        }

        let theta: number = (<number>(Math.acos(state.getNormal().z)));
        state.getUV().y = (theta / (<number>(Math.PI)));
        state.getUV().x = (phi / (<number>((2 * Math.PI))));
        let v: Vector3 = new Vector3();
        v.x = ((2
        * ((<number>(Math.PI)) * state.getNormal().y))
        * -1);
        v.y = (2
        * ((<number>(Math.PI)) * state.getNormal().x));
        v.z = 0;
        state.setShader(parent.getShader(0));
        state.setModifier(parent.getModifier(0));
        //  into world space
        let worldNormal: Vector3 = parent.transformNormalObjectToWorld(state.getNormal());
        v = parent.transformVectorObjectToWorld(v);
        state.getNormal().set(worldNormal);
        state.getNormal().normalize();
        state.getGeoNormal().set(state.getNormal());
        //  compute basis in world space
        state.setBasis(OrthoNormalBasis.makeFromWV(state.getNormal(), v));
    }

    public intersectPrimitive(r: Ray, primID: number, state: IntersectionState) {
        //  intersect in local space
        let qa: number = ((r.dx * r.dx)
        + ((r.dy * r.dy)
        + (r.dz * r.dz)));
        let qb: number = (2
        * ((r.dx * r.ox)
        + ((r.dy * r.oy)
        + (r.dz * r.oz))));
        let qc: number = (((r.ox * r.ox)
        + ((r.oy * r.oy)
        + (r.oz * r.oz)))
        - 1);
        let t: number[] = Solvers.solveQuadric(qa, qb, qc);
        if ((t != null)) {
            //  early rejection
            if (((t[0] >= r.getMax())
                || (t[1] <= r.getMin()))) {
                return;
            }

            if ((t[0] > r.getMin())) {
                r.setMax((<number>(t[0])));
            }
            else {
                r.setMax((<number>(t[1])));
            }

            state.setIntersection(0, 0, 0);
        }

    }

    public getBakingPrimitives(): PrimitiveList {
        return null;
    }
}