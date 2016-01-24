/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class JuliaFractal implements PrimitiveList {

    private static BOUNDING_RADIUS:number = (<number>(Math.sqrt(3)));

    private static BOUNDING_RADIUS2:number = 3;

    private static ESCAPE_THRESHOLD:number = 10;

    private static DELTA:number = 0.0001;

    //  quaternion constant
    private cx:number;

    private cy:number;

    private cz:number;

    private cw:number;

    private maxIterations:number;

    private epsilon:number;

    constructor () {
        //  good defaults?
        4;
        2;
        3;
        2;
        this.maxIterations = 15;
        this.epsilon = 1E-05;
    }

    getNumPrimitives():number {
        return 1;
    }

    getPrimitiveBound(primID:number, i:number):number {
        return ((i & 1)
        == 0);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    getWorldBounds(o2w:Matrix4):BoundingBox {
        let bounds:BoundingBox = new BoundingBox(BOUNDING_RADIUS);
        if ((o2w != null)) {
            bounds = o2w.transform(bounds);
        }

        return bounds;
    }

    intersectPrimitive(r:Ray, primID:number, state:IntersectionState) {
        //  intersect with bounding sphere
        let qc:number = (((r.ox * r.ox)
        + ((r.oy * r.oy)
        + (r.oz * r.oz)))
        - BOUNDING_RADIUS2);
        let qt:number = r.getMin();
        if ((qc > 0)) {
            //  we are starting outside the sphere, find intersection on the
            //  sphere
            let qa:number = ((r.dx * r.dx)
            + ((r.dy * r.dy)
            + (r.dz * r.dz)));
            let qb:number = (2
            * ((r.dx * r.ox)
            + ((r.dy * r.oy)
            + (r.dz * r.oz))));
            let t:number[] = Solvers.solveQuadric(qa, qb, qc);
            //  early rejection
            if (((t == null)
                || ((t[0] >= r.getMax())
                || (t[1] <= r.getMin())))) {
                return;
            }

            qt = (<number>(t[0]));
        }

        let dist:number = Float.POSITIVE_INFINITY;
        let rox:number = (r.ox
        + (qt * r.dx));
        let roy:number = (r.oy
        + (qt * r.dy));
        let roz:number = (r.oz
        + (qt * r.dz));
        let invRayLength:number = (<number>((1 / Math.sqrt(((r.dx * r.dx)
        + ((r.dy * r.dy)
        + (r.dz * r.dz)))))));
        //  now we can start intersection
        while (true) {
            let zw:number = rox;
            let zx:number = roy;
            let zy:number = roz;
            let zz:number = 0;
            let zpw:number = 1;
            let zpx:number = 0;
            let zpy:number = 0;
            let zpz:number = 0;
            //  run several iterations
            let dotz:number = 0;
            for (let i:number = 0; (i < this.maxIterations); i++) {
                //  zp = 2 * (z * zp)
                let nw:number = ((zw * zpw)
                - ((zx * zpx)
                - ((zy * zpy)
                - (zz * zpz))));
                let nx:number = ((zw * zpx)
                + ((zx * zpw)
                + ((zy * zpz)
                - (zz * zpy))));
                let ny:number = ((zw * zpy)
                + ((zy * zpw)
                + ((zz * zpx)
                - (zx * zpz))));
                zpz = (2
                * ((zw * zpz)
                + ((zz * zpw)
                + ((zx * zpy)
                - (zy * zpx)))));
                zpw = (2 * nw);
                zpx = (2 * nx);
                zpy = (2 * ny);
                //  z = z*z + c
                let nw:number = (((zw * zw)
                - ((zx * zx)
                - ((zy * zy)
                - (zz * zz))))
                + this.cw);
                zx = ((2
                * (zw * zx))
                + this.cx);
                zy = ((2
                * (zw * zy))
                + this.cy);
                zz = ((2
                * (zw * zz))
                + this.cz);
                zw = nw;
                dotz = ((zw * zw)
                + ((zx * zx)
                + ((zy * zy)
                + (zz * zz))));
                if ((dotz > ESCAPE_THRESHOLD)) {
                    break;
                }

            }

            let normZ:number = (<number>(Math.sqrt(dotz)));
            dist = (0.5
            * (normZ
            * ((<number>(Math.log(normZ))) / JuliaFractal.length(zpw, zpx, zpy, zpz))));
            rox = (rox
            + (dist * r.dx));
            roy = (roy
            + (dist * r.dy));
            roz = (roz
            + (dist * r.dz));
            qt = (qt + dist);
            if (((dist * invRayLength)
                < this.epsilon)) {
                break;
            }

            if (((rox * rox)
                + ((roy * roy)
                + ((roz * roz)
                > BOUNDING_RADIUS2)))) {
                return;
            }

        }

        //  now test t value again
        if (!r.isInside(qt)) {
            return;
        }

        if (((dist * invRayLength)
            < this.epsilon)) {
            //  valid hit
            r.setMax(qt);
            state.setIntersection(0, 0, 0);
        }

    }

    prepareShadingState(state:ShadingState) {
        state.init();
        state.getRay().getPoint(state.getPoint());
        let parent:Instance = state.getInstance();
        //  compute local normal
        let p:Point3 = parent.transformWorldToObject(state.getPoint());
        let gx1w:number = (p.x - DELTA);
        let gx1x:number = p.y;
        let gx1y:number = p.z;
        let gx1z:number = 0;
        let gx2w:number = (p.x + DELTA);
        let gx2x:number = p.y;
        let gx2y:number = p.z;
        let gx2z:number = 0;
        let gy1w:number = p.x;
        let gy1x:number = (p.y - DELTA);
        let gy1y:number = p.z;
        let gy1z:number = 0;
        let gy2w:number = p.x;
        let gy2x:number = (p.y + DELTA);
        let gy2y:number = p.z;
        let gy2z:number = 0;
        let gz1w:number = p.x;
        let gz1x:number = p.y;
        let gz1y:number = (p.z - DELTA);
        let gz1z:number = 0;
        let gz2w:number = p.x;
        let gz2x:number = p.y;
        let gz2y:number = (p.z + DELTA);
        let gz2z:number = 0;
        for (let i:number = 0; (i < this.maxIterations); i++) {
            //  z = z*z + c
            let nw:number = (((gx1w * gx1w)
            - ((gx1x * gx1x)
            - ((gx1y * gx1y)
            - (gx1z * gx1z))))
            + this.cw);
            gx1x = ((2
            * (gx1w * gx1x))
            + this.cx);
            gx1y = ((2
            * (gx1w * gx1y))
            + this.cy);
            gx1z = ((2
            * (gx1w * gx1z))
            + this.cz);
            gx1w = nw;
            //  z = z*z + c
            let nw:number = (((gx2w * gx2w)
            - ((gx2x * gx2x)
            - ((gx2y * gx2y)
            - (gx2z * gx2z))))
            + this.cw);
            gx2x = ((2
            * (gx2w * gx2x))
            + this.cx);
            gx2y = ((2
            * (gx2w * gx2y))
            + this.cy);
            gx2z = ((2
            * (gx2w * gx2z))
            + this.cz);
            gx2w = nw;
            //  z = z*z + c
            let nw:number = (((gy1w * gy1w)
            - ((gy1x * gy1x)
            - ((gy1y * gy1y)
            - (gy1z * gy1z))))
            + this.cw);
            gy1x = ((2
            * (gy1w * gy1x))
            + this.cx);
            gy1y = ((2
            * (gy1w * gy1y))
            + this.cy);
            gy1z = ((2
            * (gy1w * gy1z))
            + this.cz);
            gy1w = nw;
            //  z = z*z + c
            let nw:number = (((gy2w * gy2w)
            - ((gy2x * gy2x)
            - ((gy2y * gy2y)
            - (gy2z * gy2z))))
            + this.cw);
            gy2x = ((2
            * (gy2w * gy2x))
            + this.cx);
            gy2y = ((2
            * (gy2w * gy2y))
            + this.cy);
            gy2z = ((2
            * (gy2w * gy2z))
            + this.cz);
            gy2w = nw;
            //  z = z*z + c
            let nw:number = (((gz1w * gz1w)
            - ((gz1x * gz1x)
            - ((gz1y * gz1y)
            - (gz1z * gz1z))))
            + this.cw);
            gz1x = ((2
            * (gz1w * gz1x))
            + this.cx);
            gz1y = ((2
            * (gz1w * gz1y))
            + this.cy);
            gz1z = ((2
            * (gz1w * gz1z))
            + this.cz);
            gz1w = nw;
            //  z = z*z + c
            let nw:number = (((gz2w * gz2w)
            - ((gz2x * gz2x)
            - ((gz2y * gz2y)
            - (gz2z * gz2z))))
            + this.cw);
            gz2x = ((2
            * (gz2w * gz2x))
            + this.cx);
            gz2y = ((2
            * (gz2w * gz2y))
            + this.cy);
            gz2z = ((2
            * (gz2w * gz2z))
            + this.cz);
            gz2w = nw;
        }

        let gradX:number = (JuliaFractal.length(gx2w, gx2x, gx2y, gx2z) - JuliaFractal.length(gx1w, gx1x, gx1y, gx1z));
        let gradY:number = (JuliaFractal.length(gy2w, gy2x, gy2y, gy2z) - JuliaFractal.length(gy1w, gy1x, gy1y, gy1z));
        let gradZ:number = (JuliaFractal.length(gz2w, gz2x, gz2y, gz2z) - JuliaFractal.length(gz1w, gz1x, gz1y, gz1z));
        let n:Vector3 = new Vector3((<number>(gradX)), (<number>(gradY)), (<number>(gradZ)));
        state.getNormal().set(parent.transformNormalObjectToWorld(n));
        state.getNormal().normalize();
        state.getGeoNormal().set(state.getNormal());
        state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
        state.getPoint().x = (state.getPoint().x
        + (state.getNormal().x
        * (this.epsilon * 20)));
        state.getPoint().y = (state.getPoint().y
        + (state.getNormal().y
        * (this.epsilon * 20)));
        state.getPoint().z = (state.getPoint().z
        + (state.getNormal().z
        * (this.epsilon * 20)));
        state.setShader(parent.getShader(0));
        state.setModifier(parent.getModifier(0));
    }

    private static length(w:number, x:number, y:number, z:number):number {
        return (<number>(Math.sqrt(((w * w)
        + ((x * x)
        + ((y * y)
        + (z * z)))))));
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        this.maxIterations = pl.getInt("iterations", this.maxIterations);
        this.epsilon = pl.getFloat("epsilon", this.epsilon);
        this.cw = pl.getFloat("cw", this.cw);
        this.cx = pl.getFloat("cx", this.cx);
        this.cy = pl.getFloat("cy", this.cy);
        this.cz = pl.getFloat("cz", this.cz);
        return true;
    }

    getBakingPrimitives():PrimitiveList {
        return null;
    }
}