/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ParticleSurface implements PrimitiveList {

    private particles: number[];

    private r: number;

    private r2: number;

    private n: number;

    public constructor () {
        this.particles = null;
        this.r2 = 1;
        this.r = 1;
        this.n = 0;
    }

    public getNumPrimitives(): number {
        return this.n;
    }

    public getPrimitiveBound(primID: number, i: number): number {
        let c: number = this.particles[primIDStar3, +(i, >>, Greater, 1];
        return ((i & 1)
        == 0);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    public getWorldBounds(o2w: Matrix4): BoundingBox {
        let bounds: BoundingBox = new BoundingBox();
        for (let i3: number = 0; (i < this.n); i++) {
        }

        let i: number = 0;
        i3 += 3;
        bounds.include(this.particles[i3], this.particles[(i3 + 1)], this.particles[(i3 + 2)]);
        bounds.include((bounds.getMinimum().x - this.r), (bounds.getMinimum().y - this.r), (bounds.getMinimum().z - this.r));
        bounds.include((bounds.getMaximum().x + this.r), (bounds.getMaximum().y + this.r), (bounds.getMaximum().z + this.r));
        return (o2w == null);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    public intersectPrimitive(r: Ray, primID: number, state: IntersectionState) {
        let i3: number = (primID * 3);
        let ocx: number = (this.r.ox - this.particles[(i3 + 0)]);
        let ocy: number = (this.r.oy - this.particles[(i3 + 1)]);
        let ocz: number = (this.r.oz - this.particles[(i3 + 2)]);
        let qa: number = ((this.r.dx * this.r.dx)
        + ((this.r.dy * this.r.dy)
        + (this.r.dz * this.r.dz)));
        let qb: number = (2
        * ((this.r.dx * ocx)
        + ((this.r.dy * ocy)
        + (this.r.dz * ocz))));
        let qc: number = (((ocx * ocx)
        + ((ocy * ocy)
        + (ocz * ocz)))
        - this.r2);
        let t: number[] = Solvers.solveQuadric(qa, qb, qc);
        if ((t != null)) {
            //  early rejection
            if (((t[0] >= this.r.getMax())
                || (t[1] <= this.r.getMin()))) {
                return;
            }

            if ((t[0] > this.r.getMin())) {
                this.r.setMax((<number>(t[0])));
            }
            else {
                this.r.setMax((<number>(t[1])));
            }

            state.setIntersection(primID, 0, 0);
        }

    }

    public prepareShadingState(state: ShadingState) {
        state.init();
        state.getRay().getPoint(state.getPoint());
        let localPoint: Point3 = state.getInstance().transformWorldToObject(state.getPoint());
        localPoint.x = (localPoint.x - this.particles[((3 * state.getPrimitiveID())
        + 0)]);
        localPoint.y = (localPoint.y - this.particles[((3 * state.getPrimitiveID())
        + 1)]);
        localPoint.z = (localPoint.z - this.particles[((3 * state.getPrimitiveID())
        + 2)]);
        state.getNormal().set(localPoint.x, localPoint.y, localPoint.z);
        state.getNormal().normalize();
        state.setShader(state.getInstance().getShader(0));
        state.setModifier(state.getInstance().getModifier(0));
        //  into object space
        let worldNormal: Vector3 = state.getInstance().transformNormalObjectToWorld(state.getNormal());
        state.getNormal().set(worldNormal);
        state.getNormal().normalize();
        state.getGeoNormal().set(state.getNormal());
        state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        let p: FloatParameter = pl.getPointArray("particles");
        if ((p != null)) {
            this.particles = p.data;
        }

        this.r = pl.getFloat("radius", this.r);
        this.r2 = (this.r * this.r);
        this.n = pl.getInt("num", this.n);
        return ((this.particles != null)
        && (this.n
        <= (this.particles.length / 3)));
    }

    public getBakingPrimitives(): PrimitiveList {
        return null;
    }
}