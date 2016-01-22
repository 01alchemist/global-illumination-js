/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class BanchoffSurface implements PrimitiveList {

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        return true;
    }

    public getWorldBounds(o2w: Matrix4): BoundingBox {
        let bounds: BoundingBox = new BoundingBox(1.5);
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
        let n: Point3 = parent.transformWorldToObject(state.getPoint());
        state.getNormal().set((n.x
        * ((2
        * (n.x * n.x))
        - 1)), (n.y
        * ((2
        * (n.y * n.y))
        - 1)), (n.z
        * ((2
        * (n.z * n.z))
        - 1)));
        state.getNormal().normalize();
        state.setShader(parent.getShader(0));
        state.setModifier(parent.getModifier(0));
        //  into world space
        let worldNormal: Vector3 = parent.transformNormalObjectToWorld(state.getNormal());
        state.getNormal().set(worldNormal);
        state.getNormal().normalize();
        state.getGeoNormal().set(state.getNormal());
        //  create basis in world space
        state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
    }

    public intersectPrimitive(r: Ray, primID: number, state: IntersectionState) {
        //  intersect in local space
        let rd2x: number = (r.dx * r.dx);
        let rd2y: number = (r.dy * r.dy);
        let rd2z: number = (r.dz * r.dz);
        let ro2x: number = (r.ox * r.ox);
        let ro2y: number = (r.oy * r.oy);
        let ro2z: number = (r.oz * r.oz);
        //  setup the quartic coefficients
        //  some common terms could probably be shared across these
        let A: number = ((rd2y * rd2y)
        + ((rd2z * rd2z)
        + (rd2x * rd2x)));
        let B: number = (4
        * ((r.oy
        * (rd2y * r.dy))
        + ((r.oz
        * (r.dz * rd2z))
        + (r.ox
        * (r.dx * rd2x)))));
        let C: number = (((rd2x
        - (rd2y - rd2z))
        * -1) + (6
        * ((ro2y * rd2y)
        + ((ro2z * rd2z)
        + (ro2x * rd2x)))));
        let D: number = (2
        * (((2
        * (ro2z
        * (r.oz * r.dz)))
        - (r.oz * r.dz))
        + ((2
        * (ro2x
        * (r.ox * r.dx)))
        + ((2
        * (ro2y
        * (r.oy * r.dy)))
        - ((r.ox * r.dx)
        - (r.oy * r.dy))))));
        let E: number = ((3 / 8)
        + ((ro2z * -1)
        + (((ro2z * ro2z)
        - ro2y)
        + (((ro2y * ro2y)
        - ro2x)
        + (ro2x * ro2x)))));
        //  solve equation
        let t: number[] = Solvers.solveQuartic(A, B, C, D, E);
        if ((t != null)) {
            //  early rejection
            if (((t[0] >= r.getMax())
                || (t[(t.length - 1)] <= r.getMin()))) {
                return;
            }

            //  find first intersection in front of the ray
            for (let i: number = 0; (i < t.length); i++) {
                if ((t[i] > r.getMin())) {
                    r.setMax((<number>(t[i])));
                    state.setIntersection(0, 0, 0);
                    return;
                }

            }

        }

    }

    public getBakingPrimitives(): PrimitiveList {
        return null;
    }
}