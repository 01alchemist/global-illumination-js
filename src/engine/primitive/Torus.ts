/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Torus implements PrimitiveList {

    private ri2: number;

    private ro2: number;

    private ri: number;

    private ro: number;

    public constructor () {
        this.ri = 0.25;
        this.ro = 1;
        this.ri2 = (this.ri * this.ri);
        this.ro2 = (this.ro * this.ro);
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        this.ri = pl.getFloat("radiusInner", this.ri);
        this.ro = pl.getFloat("radiusOuter", this.ro);
        this.ri2 = (this.ri * this.ri);
        this.ro2 = (this.ro * this.ro);
        return true;
    }

    public getWorldBounds(o2w: Matrix4): BoundingBox {
        let bounds: BoundingBox = new BoundingBox(((this.ro - this.ri)
        * -1), ((this.ro - this.ri)
        * -1), (this.ri * -1));
        bounds.include((this.ro + this.ri), (this.ro + this.ri), this.ri);
        if ((o2w != null)) {
            bounds = o2w.transform(bounds);
        }

        return bounds;
    }

    public getPrimitiveBound(primID: number, i: number): number {
        switch (i) {
            case 0:
            case 2:
                return ((this.ro - this.ri)
                * -1);
                break;
            case 1:
            case 3:
                return (this.ro + this.ri);
                break;
            case 4:
                return (this.ri * -1);
                break;
            case 5:
                return this.ri;
                break;
            default:
                return 0;
                break;
        }

    }

    public getNumPrimitives(): number {
        return 1;
    }

    public prepareShadingState(state: ShadingState) {
        state.init();
        state.getRay().getPoint(state.getPoint());
        let parent: Instance = state.getInstance();
        //  get local point
        let p: Point3 = parent.transformWorldToObject(state.getPoint());
        //  compute local normal
        let deriv: number = ((p.x * p.x)
        + ((p.y * p.y)
        + ((p.z * p.z)
        - (this.ri2 - this.ro2))));
        state.getNormal().set((p.x * deriv), (p.y * deriv), ((p.z * deriv) + (2
        * (this.ro2 * p.z))));
        state.getNormal().normalize();
        let phi: number = Math.asin(MathUtils.clamp((p.z / this.ri), -1, 1));
        let theta: number = Math.atan2(p.y, p.x);
        if ((theta < 0)) {
            theta = (theta + (2 * Math.PI));
        }

        state.getUV().x = (<number>((theta / (2 * Math.PI))));
        state.getUV().y = (<number>(((phi
        + (Math.PI / 2))
        / Math.PI)));
        state.setShader(parent.getShader(0));
        state.setModifier(parent.getModifier(0));
        //  into world space
        let worldNormal: Vector3 = parent.transformNormalObjectToWorld(state.getNormal());
        state.getNormal().set(worldNormal);
        state.getNormal().normalize();
        state.getGeoNormal().set(state.getNormal());
        //  make basis in world space
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
        //  compute some common factors
        let alpha: number = (rd2x
        + (rd2y + rd2z));
        let beta: number = (2
        * ((r.ox * r.dx)
        + ((r.oy * r.dy)
        + (r.oz * r.dz))));
        let gamma: number = ((ro2x
        + (ro2y + ro2z))
        - (this.ri2 - this.ro2));
        //  setup quartic coefficients
        let A: number = (alpha * alpha);
        let B: number = (2
        * (alpha * beta));
        let C: number = ((beta * beta)
        + ((2
        * (alpha * gamma)) + (4
        * (this.ro2 * rd2z))));
        let D: number = ((2
        * (beta * gamma)) + (8
        * (this.ro2
        * (r.oz * r.dz))));
        let E: number = ((gamma * gamma)
        + ((4
        * (this.ro2 * ro2z)) - (4
        * (this.ro2 * this.ri2))));
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