/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Plane implements PrimitiveList {

    private center: Point3;

    private normal: Vector3;

    k: number;

    private bnu: number;

    private bnv: number;

    private bnd: number;

    private cnu: number;

    private cnv: number;

    private cnd: number;

    public constructor () {
        this.center = new Point3(0, 0, 0);
        this.normal = new Vector3(0, 1, 0);
        this.k = 3;
        this.bnd = 0;
        this.bnv = 0;
        this.bnu = 0;
        this.cnd = 0;
        this.cnv = 0;
        this.cnu = 0;
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        this.center = pl.getPoint("center", this.center);
        let b: Point3 = pl.getPoint("point1", null);
        let c: Point3 = pl.getPoint("point2", null);
        if (((b != null)
            && (c != null))) {
            let v0: Point3 = this.center;
            let v1: Point3 = b;
            let v2: Point3 = c;
            let ng: Vector3;
            if (((Math.abs(ng.x) > Math.abs(ng.y))
                && (Math.abs(ng.x) > Math.abs(ng.z)))) {
                this.k = 0;
            }
            else if ((Math.abs(ng.y) > Math.abs(ng.z))) {
                this.k = 1;
            }
            else {
                this.k = 2;
            }

            let cy: number;
            let ax: number;
            let ay: number;
            let bx: number;
            let by: number;
            let cx: number;
            switch (this.k) {
                case 0:
                    ax = v0.y;
                    ay = v0.z;
                    bx = (v2.y - ax);
                    by = (v2.z - ay);
                    cx = (v1.y - ax);
                    cy = (v1.z - ay);
                    break;
                    break;
                case 1:
                    ax = v0.z;
                    ay = v0.x;
                    bx = (v2.z - ax);
                    by = (v2.x - ay);
                    cx = (v1.z - ax);
                    cy = (v1.x - ay);
                    break;
                    break;
                case 2:
                    break;
                default:
                    ax = v0.x;
                    ay = v0.y;
                    bx = (v2.x - ax);
                    by = (v2.y - ay);
                    cx = (v1.x - ax);
                    cy = (v1.y - ay);
                    break;
            }

            let det: number = ((bx * cy)
            - (by * cx));
            this.bnu = ((by / det)
            * -1);
            this.bnv = (bx / det);
            this.bnd = (((by * ax)
            - (bx * ay))
            / det);
            this.cnu = (cy / det);
            this.cnv = ((cx / det)
            * -1);
            this.cnd = (((cx * ay)
            - (cy * ax))
            / det);
        }
        else {
            this.normal = pl.getVector("normal", this.normal);
            this.k = 3;
            this.bnd = 0;
            this.bnv = 0;
            this.bnu = 0;
            this.cnd = 0;
            this.cnv = 0;
            this.cnu = 0;
        }

        return true;
    }

    public prepareShadingState(state: ShadingState) {
        state.init();
        state.getRay().getPoint(state.getPoint());
        let parent: Instance = state.getInstance();
        let worldNormal: Vector3 = parent.transformNormalObjectToWorld(this.normal);
        state.getNormal().set(worldNormal);
        state.getGeoNormal().set(worldNormal);
        state.setShader(parent.getShader(0));
        state.setModifier(parent.getModifier(0));
        let p: Point3 = parent.transformWorldToObject(state.getPoint());
        let hv: number;
        let hu: number;
        switch (this.k) {
            case 0:
                hu = p.y;
                hv = p.z;
                break;
                break;
            case 1:
                hu = p.z;
                hv = p.x;
                break;
                break;
            case 2:
                hu = p.x;
                hv = p.y;
                break;
                break;
            default:
                hv = 0;
                break;
        }

        hu = 0;
        state.getUV().x = ((hu * this.bnu)
        + ((hv * this.bnv)
        + this.bnd));
        state.getUV().y = ((hu * this.cnu)
        + ((hv * this.cnv)
        + this.cnd));
        state.setBasis(OrthoNormalBasis.makeFromW(this.normal));
    }

    public intersectPrimitive(r: Ray, primID: number, state: IntersectionState) {
        let dn: number = ((this.normal.x * r.dx)
        + ((this.normal.y * r.dy)
        + (this.normal.z * r.dz)));
        if ((dn == 0)) {
            return;
        }

        let t: number = ((((this.center.x - r.ox)
        * this.normal.x)
        + (((this.center.y - r.oy)
        * this.normal.y)
        + ((this.center.z - r.oz)
        * this.normal.z)))
        / dn);
        if (r.isInside(t)) {
            r.setMax(t);
            state.setIntersection(0, 0, 0);
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

    public getBakingPrimitives(): PrimitiveList {
        return null;
    }
}