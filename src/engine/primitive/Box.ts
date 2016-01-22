/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Box implements PrimitiveList {

    private minX: number;

    private minY: number;

    private minZ: number;

    private maxX: number;

    private maxY: number;

    private maxZ: number;

    public constructor () {
        this.minZ = -1;
        this.minY = -1;
        this.minX = -1;
        this.minY = -1;
        this.minX = -1;
        this.maxZ = 1;
        this.maxY = 1;
        this.maxX = 1;
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        let pts: FloatParameter = pl.getPointArray("points");
        if ((pts != null)) {
            let bounds: BoundingBox = new BoundingBox();
            for (let i: number = 0; (i < pts.data.length); i += 3) {
                bounds.include(pts.data[i], pts.data[(i + 1)], pts.data[(i + 2)]);
            }

            //  cube extents
            this.minX = bounds.getMinimum().x;
            this.minY = bounds.getMinimum().y;
            this.minZ = bounds.getMinimum().z;
            this.maxX = bounds.getMaximum().x;
            this.maxY = bounds.getMaximum().y;
            this.maxZ = bounds.getMaximum().z;
        }

        return true;
    }

    public prepareShadingState(state: ShadingState) {
        state.init();
        state.getRay().getPoint(state.getPoint());
        let n: number = state.getPrimitiveID();
        switch (n) {
            case 0:
                state.getNormal().set(new Vector3(1, 0, 0));
                break;
            case 1:
                state.getNormal().set(new Vector3(-1, 0, 0));
                break;
            case 2:
                state.getNormal().set(new Vector3(0, 1, 0));
                break;
            case 3:
                state.getNormal().set(new Vector3(0, -1, 0));
                break;
            case 4:
                state.getNormal().set(new Vector3(0, 0, 1));
                break;
            case 5:
                state.getNormal().set(new Vector3(0, 0, -1));
                break;
            default:
                state.getNormal().set(new Vector3(0, 0, 0));
                break;
        }

        state.getGeoNormal().set(state.getNormal());
        state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
        state.setShader(state.getInstance().getShader(0));
        state.setModifier(state.getInstance().getModifier(0));
    }

    public intersectPrimitive(r: Ray, primID: number, state: IntersectionState) {
        let intervalMin: number = Float.NEGATIVE_INFINITY;
        let intervalMax: number = Float.POSITIVE_INFINITY;
        let orgX: number = r.ox;
        let invDirX: number = (1 / r.dx);
        let t2: number;
        let t1: number;
        t1 = ((this.minX - orgX)
        * invDirX);
        t2 = ((this.maxX - orgX)
        * invDirX);
        let sideOut: number = -1;
        let sideIn: number = -1;
        if ((invDirX > 0)) {
            if ((t1 > intervalMin)) {
                intervalMin = t1;
                sideIn = 0;
            }

            if ((t2 < intervalMax)) {
                intervalMax = t2;
                sideOut = 1;
            }

        }
        else {
            if ((t2 > intervalMin)) {
                intervalMin = t2;
                sideIn = 1;
            }

            if ((t1 < intervalMax)) {
                intervalMax = t1;
                sideOut = 0;
            }

        }

        if ((intervalMin > intervalMax)) {
            return;
        }

        let orgY: number = r.oy;
        let invDirY: number = (1 / r.dy);
        t1 = ((this.minY - orgY)
        * invDirY);
        t2 = ((this.maxY - orgY)
        * invDirY);
        if ((invDirY > 0)) {
            if ((t1 > intervalMin)) {
                intervalMin = t1;
                sideIn = 2;
            }

            if ((t2 < intervalMax)) {
                intervalMax = t2;
                sideOut = 3;
            }

        }
        else {
            if ((t2 > intervalMin)) {
                intervalMin = t2;
                sideIn = 3;
            }

            if ((t1 < intervalMax)) {
                intervalMax = t1;
                sideOut = 2;
            }

        }

        if ((intervalMin > intervalMax)) {
            return;
        }

        let orgZ: number = r.oz;
        let invDirZ: number = (1 / r.dz);
        t1 = ((this.minZ - orgZ)
        * invDirZ);
        //  no front wall
        t2 = ((this.maxZ - orgZ)
        * invDirZ);
        if ((invDirZ > 0)) {
            if ((t1 > intervalMin)) {
                intervalMin = t1;
                sideIn = 4;
            }

            if ((t2 < intervalMax)) {
                intervalMax = t2;
                sideOut = 5;
            }

        }
        else {
            if ((t2 > intervalMin)) {
                intervalMin = t2;
                sideIn = 5;
            }

            if ((t1 < intervalMax)) {
                intervalMax = t1;
                sideOut = 4;
            }

        }

        if ((intervalMin > intervalMax)) {
            return;
        }

        if (r.isInside(intervalMin)) {
            r.setMax(intervalMin);
            state.setIntersection(sideIn, 0, 0);
        }
        else if (r.isInside(intervalMax)) {
            r.setMax(intervalMax);
            state.setIntersection(sideOut, 0, 0);
        }

    }

    public getNumPrimitives(): number {
        return 1;
    }

    public getPrimitiveBound(primID: number, i: number): number {
        switch (i) {
            case 0:
                return this.minX;
                break;
            case 1:
                return this.maxX;
                break;
            case 2:
                return this.minY;
                break;
            case 3:
                return this.maxY;
                break;
            case 4:
                return this.minZ;
                break;
            case 5:
                return this.maxZ;
                break;
            default:
                return 0;
                break;
        }

    }

    public getWorldBounds(o2w: Matrix4): BoundingBox {
        let bounds: BoundingBox = new BoundingBox(this.minX, this.minY, this.minZ);
        bounds.include(this.maxX, this.maxY, this.maxZ);
        if ((o2w == null)) {
            return bounds;
        }

        return o2w.transform(bounds);
    }

    public getBakingPrimitives(): PrimitiveList {
        return null;
    }
}