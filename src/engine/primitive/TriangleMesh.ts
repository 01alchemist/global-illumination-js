/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class TriangleMesh implements PrimitiveList {

    private static smallTriangles: boolean = false;

    protected points: number[];

    protected triangles: number[];

    private triaccel: WaldTriangle[];

    private normals: FloatParameter;

    private uvs: FloatParameter;

    private faceShaders: number[];

    public static setSmallTriangles(smallTriangles: boolean) {
        if (smallTriangles) {
            UI.printInfo(Module.GEOM, "Small trimesh mode: enabled");
        }
        else {
            UI.printInfo(Module.GEOM, "Small trimesh mode: disabled");
        }

        TriangleMesh.smallTriangles = smallTriangles;
    }

    public constructor () {
        this.triangles = null;
        this.points = null;
        this.uvs = new FloatParameter();
        this.normals = new FloatParameter();
        this.faceShaders = null;
    }

    public writeObj(filename: String) {
        try {
            let file: FileWriter = new FileWriter(filename);
            file.write(String.format("o object
            "));
            for (let i: number = 0; (i < this.points.length); i += 3) {
                file.write(String.format("v %g %g %g
                ", this.points[i], this.points[(i + 1)], this.points[(i + 2)]));
            }

            file.write("s off
            ");
            for (let i: number = 0; (i < this.triangles.length); i += 3) {
                file.write(String.format("f %d %d %d
                ", (this.triangles[i] + 1), (this.triangles[(i + 1)] + 1), (this.triangles[(i + 2)] + 1)));
            }

            file.close();
        }
        catch (e /*:IOException*/) {
            e.printStackTrace();
        }

    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        let updatedTopology: boolean = false;
        let triangles: number[] = pl.getIntArray("triangles");
        if ((this.triangles != null)) {
            this.triangles = this.triangles;
            updatedTopology = true;
        }

        if ((this.triangles == null)) {
            UI.printError(Module.GEOM, "Unable to update mesh - triangle indices are missing");
            return false;
        }

        if (((this.triangles.length % 3)
            != 0)) {
            UI.printWarning(Module.GEOM, "Triangle index data is not a multiple of 3 - triangles may be missing");
        }

        pl.setFaceCount((this.triangles.length / 3));
        let pointsP: FloatParameter = pl.getPointArray("points");
        if ((pointsP != null)) {
            if ((pointsP.interp != InterpolationType.VERTEX)) {
                UI.printError(Module.GEOM, "Point interpolation type must be set to \""vertex\"" - was \""%s\"""", pointsP.interp.name().toLowerCase())", else, {, points=pointsP.data);
            }

        }

        updatedTopology = true;
    }
}
pl.setVertexCount((points.length / 3));
pl.setFaceVertexCount((3
* (triangles.length / 3)));
let normals: FloatParameter = pl.getVectorArray("normals");
if ((normals != null)) {
    this.normals = normals;
}

let uvs: FloatParameter = pl.getTexCoordArray("uvs");
if ((uvs != null)) {
    this.uvs = uvs;
}

let faceShaders: number[] = pl.getIntArray("faceshaders");
if (((faceShaders != null)
    && (faceShaders.length
    == (triangles.length / 3)))) {
    this.faceShaders = new Array(faceShaders.length);
    for (let i: number = 0; (i < faceShaders.length); i++) {
        let v: number = faceShaders[i];
        if ((v > 255)) {
            UI.printWarning(Module.GEOM, "Shader index too large on triangle %d", i);
        }

        this.faceShaders[i] = (<number>((v & 255)));
    }

}

if (updatedTopology) {
    //  create triangle acceleration structure
    init();
}

return true;
Unknown/* sealed */ class WaldTriangle {

    //  private data for fast triangle intersection testing
    private k: number;

    private nu: number;

    private nv: number;

    private nd: number;

    private bnu: number;

    private bnv: number;

    private bnd: number;

    private cnu: number;

    private cnv: number;

    private cnd: number;

    private constructor (mesh: TriangleMesh, tri: number) {
        this.k = 0;
        tri = (tri * 3);
        let index0: number = mesh.triangles[(tri + 0)];
        let index1: number = mesh.triangles[(tri + 1)];
        let index2: number = mesh.triangles[(tri + 2)];
        let v0p: Point3 = mesh.getPoint(index0);
        let v1p: Point3 = mesh.getPoint(index1);
        let v2p: Point3 = mesh.getPoint(index2);
        let ng: Vector3 = Point3.normal(v0p, v1p, v2p);
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
                this.nu = (ng.y / ng.x);
                this.nv = (ng.z / ng.x);
                this.nd = (v0p.x
                + ((this.nu * v0p.y)
                + (this.nv * v0p.z)));
                ax = v0p.y;
                ay = v0p.z;
                bx = (v2p.y - ax);
                by = (v2p.z - ay);
                cx = (v1p.y - ax);
                cy = (v1p.z - ay);
                break;
                break;
            case 1:
                this.nu = (ng.z / ng.y);
                this.nv = (ng.x / ng.y);
                this.nd = ((this.nv * v0p.x)
                + (v0p.y
                + (this.nu * v0p.z)));
                ax = v0p.z;
                ay = v0p.x;
                bx = (v2p.z - ax);
                by = (v2p.x - ay);
                cx = (v1p.z - ax);
                cy = (v1p.x - ay);
                break;
                break;
            case 2:
                break;
            default:
                this.nu = (ng.x / ng.z);
                this.nv = (ng.y / ng.z);
                this.nd = ((this.nu * v0p.x)
                + ((this.nv * v0p.y)
                + v0p.z));
                ax = v0p.x;
                ay = v0p.y;
                bx = (v2p.x - ax);
                by = (v2p.y - ay);
                cx = (v1p.x - ax);
                cy = (v1p.y - ay);
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

    intersectBox(r: Ray, hx: number, hy: number, hz: number, primID: number, state: IntersectionState) {
        switch (this.k) {
            case 0:
                let hu: number = hy;
                let hv: number = hz;
                let u: number = ((hu * this.bnu)
                + ((hv * this.bnv)
                + this.bnd));
                if ((u < 0)) {
                    u = 0;
                }

                let v: number = ((hu * this.cnu)
                + ((hv * this.cnv)
                + this.cnd));
                if ((v < 0)) {
                    v = 0;
                }

                state.setIntersection(primID, u, v);
                return;
                break;
            case 1:
                let hu: number = hz;
                let hv: number = hx;
                let u: number = ((hu * this.bnu)
                + ((hv * this.bnv)
                + this.bnd));
                if ((u < 0)) {
                    u = 0;
                }

                let v: number = ((hu * this.cnu)
                + ((hv * this.cnv)
                + this.cnd));
                if ((v < 0)) {
                    v = 0;
                }

                state.setIntersection(primID, u, v);
                return;
                break;
            case 2:
                let hu: number = hx;
                let hv: number = hy;
                let u: number = ((hu * this.bnu)
                + ((hv * this.bnv)
                + this.bnd));
                if ((u < 0)) {
                    u = 0;
                }

                let v: number = ((hu * this.cnu)
                + ((hv * this.cnv)
                + this.cnd));
                if ((v < 0)) {
                    v = 0;
                }

                state.setIntersection(primID, u, v);
                return;
                break;
        }

    }

    intersect(r: Ray, primID: number, state: IntersectionState) {
        switch (this.k) {
            case 0:
                let det: number = (1
                / (r.dx
                + ((this.nu * r.dy)
                + (this.nv * r.dz))));
                let t: number = ((this.nd
                - (r.ox
                - ((this.nu * r.oy)
                - (this.nv * r.oz))))
                * det);
                if (!r.isInside(t)) {
                    return;
                }

                let hu: number = (r.oy
                + (t * r.dy));
                let hv: number = (r.oz
                + (t * r.dz));
                let u: number = ((hu * this.bnu)
                + ((hv * this.bnv)
                + this.bnd));
                if ((u < 0)) {
                    return;
                }

                let v: number = ((hu * this.cnu)
                + ((hv * this.cnv)
                + this.cnd));
                if ((v < 0)) {
                    return;
                }

                if ((u
                    + (v > 1))) {
                    return;
                }

                r.setMax(t);
                state.setIntersection(primID, u, v);
                return;
                break;
            case 1:
                let det: number = (1
                / (r.dy
                + ((this.nu * r.dz)
                + (this.nv * r.dx))));
                let t: number = ((this.nd
                - (r.oy
                - ((this.nu * r.oz)
                - (this.nv * r.ox))))
                * det);
                if (!r.isInside(t)) {
                    return;
                }

                let hu: number = (r.oz
                + (t * r.dz));
                let hv: number = (r.ox
                + (t * r.dx));
                let u: number = ((hu * this.bnu)
                + ((hv * this.bnv)
                + this.bnd));
                if ((u < 0)) {
                    return;
                }

                let v: number = ((hu * this.cnu)
                + ((hv * this.cnv)
                + this.cnd));
                if ((v < 0)) {
                    return;
                }

                if ((u
                    + (v > 1))) {
                    return;
                }

                r.setMax(t);
                state.setIntersection(primID, u, v);
                return;
                break;
            case 2:
                let det: number = (1
                / (r.dz
                + ((this.nu * r.dx)
                + (this.nv * r.dy))));
                let t: number = ((this.nd
                - (r.oz
                - ((this.nu * r.ox)
                - (this.nv * r.oy))))
                * det);
                if (!r.isInside(t)) {
                    return;
                }

                let hu: number = (r.ox
                + (t * r.dx));
                let hv: number = (r.oy
                + (t * r.dy));
                let u: number = ((hu * this.bnu)
                + ((hv * this.bnv)
                + this.bnd));
                if ((u < 0)) {
                    return;
                }

                let v: number = ((hu * this.cnu)
                + ((hv * this.cnv)
                + this.cnd));
                if ((v < 0)) {
                    return;
                }

                if ((u
                    + (v > 1))) {
                    return;
                }

                r.setMax(t);
                state.setIntersection(primID, u, v);
                return;
                break;
        }

    }
}
class BakingSurface implements PrimitiveList {

    public getBakingPrimitives(): PrimitiveList {
        return null;
    }

    public getNumPrimitives(): number {
        return TriangleMesh.this.getNumPrimitives();
    }

    public getPrimitiveBound(primID: number, i: number): number {
        if ((i > 3)) {
            return 0;
        }

        switch (uvs.interp) {
            case NONE:
            case FACE:
                break;
            default:
                return 0;
                if ((uvs.interp == VERTEX)) {
                    let tri: number = (3 * primID);
                    let index0: number = triangles[(tri + 0)];
                    let index1: number = triangles[(tri + 1)];
                    let index2: number = triangles[(tri + 2)];
                    let i20: number = (2 * index0);
                    let i21: number = (2 * index1);
                    let i22: number = (2 * index2);
                    let uvs: number[] = TriangleMesh.this.uvs.data;
                    switch (i) {
                        case 0:
                            return MathUtils.min(uvs[(i20 + 0)], uvs[(i21 + 0)], uvs[(i22 + 0)]);
                            break;
                        case 1:
                            return MathUtils.max(uvs[(i20 + 0)], uvs[(i21 + 0)], uvs[(i22 + 0)]);
                            break;
                        case 2:
                            return MathUtils.min(uvs[(i20 + 1)], uvs[(i21 + 1)], uvs[(i22 + 1)]);
                            break;
                        case 3:
                            return MathUtils.max(uvs[(i20 + 1)], uvs[(i21 + 1)], uvs[(i22 + 1)]);
                            break;
                        default:
                            return 0;
                            break;
                    }

                }
                else if ((uvs.interp == FACEVARYING)) {
                    let idx: number = (6 * primID);
                    let uvs: number[] = TriangleMesh.this.uvs.data;
                    switch (i) {
                        case 0:
                            return MathUtils.min(uvs[(idx + 0)], uvs[(idx + 2)], uvs[(idx + 4)]);
                            break;
                        case 1:
                            return MathUtils.max(uvs[(idx + 0)], uvs[(idx + 2)], uvs[(idx + 4)]);
                            break;
                        case 2:
                            return MathUtils.min(uvs[(idx + 1)], uvs[(idx + 3)], uvs[(idx + 5)]);
                            break;
                        case 3:
                            return MathUtils.max(uvs[(idx + 1)], uvs[(idx + 3)], uvs[(idx + 5)]);
                            break;
                        default:
                            return 0;
                            break;
                    }

                }

                break;
        }

    }

    public getWorldBounds(o2w: Matrix4): BoundingBox {
        let bounds: BoundingBox = new BoundingBox();
        if ((o2w == null)) {
            for (let i: number = 0; (i < uvs.data.length); i += 2) {
                bounds.include(uvs.data[i], uvs.data[(i + 1)], 0);
            }

        }
        else {
            //  transform vertices first
            for (let i: number = 0; (i < uvs.data.length); i += 2) {
                let x: number = uvs.data[i];
                let y: number = uvs.data[(i + 1)];
                let wx: number = o2w.transformPX(x, y, 0);
                let wy: number = o2w.transformPY(x, y, 0);
                let wz: number = o2w.transformPZ(x, y, 0);
                bounds.include(wx, wy, wz);
            }

        }

        return bounds;
    }

    public intersectPrimitive(r: Ray, primID: number, state: IntersectionState) {
        let uv21: number = 0;
        let uv00: number = 0;
        let uv01: number = 0;
        let uv10: number = 0;
        let uv11: number = 0;
        let uv20: number = 0;
        switch (uvs.interp) {
            case NONE:
            case FACE:
                break;
            default:
                return;
                if ((uvs.interp == VERTEX)) {
                    let tri: number = (3 * primID);
                    let index0: number = triangles[(tri + 0)];
                    let index1: number = triangles[(tri + 1)];
                    let index2: number = triangles[(tri + 2)];
                    let i20: number = (2 * index0);
                    let i21: number = (2 * index1);
                    let i22: number = (2 * index2);
                    let uvs: number[] = TriangleMesh.this.uvs.data;
                    uv00 = uvs[(i20 + 0)];
                    uv01 = uvs[(i20 + 1)];
                    uv10 = uvs[(i21 + 0)];
                    uv11 = uvs[(i21 + 1)];
                    uv20 = uvs[(i22 + 0)];
                    uv21 = uvs[(i22 + 1)];
                    break;
                }
                else if ((uvs.interp == FACEVARYING)) {
                    let idx: number = ((3 * primID)
                    + 1);
                    let uvs: number[] = TriangleMesh.this.uvs.data;
                    uv00 = uvs[(idx + 0)];
                    uv01 = uvs[(idx + 1)];
                    uv10 = uvs[(idx + 2)];
                    uv11 = uvs[(idx + 3)];
                    uv20 = uvs[(idx + 4)];
                    uv21 = uvs[(idx + 5)];
                    break;
                }

                break;
        }

        let edge1x: number = (uv10 - uv00);
        let edge1y: number = (uv11 - uv01);
        let edge2x: number = (uv20 - uv00);
        let edge2y: number = (uv21 - uv01);
        let pvecx: number = ((r.dy * 0)
        - (r.dz * edge2y));
        let pvecy: number = ((r.dz * edge2x)
        - (r.dx * 0));
        let pvecz: number = ((r.dx * edge2y)
        - (r.dy * edge2x));
        let qvecz: number;
        let qvecx: number;
        let qvecy: number;
        let v: number;
        let u: number;
        let det: number = ((edge1x * pvecx)
        + ((edge1y * pvecy) + (0 * pvecz)));
        if ((det > 0)) {
            let tvecx: number = (r.ox - uv00);
            let tvecy: number = (r.oy - uv01);
            let tvecz: number = r.oz;
            u = ((tvecx * pvecx)
            + ((tvecy * pvecy)
            + (tvecz * pvecz)));
            if (((u < 0)
                || (u > det))) {
                return;
            }

            qvecx = ((tvecy * 0)
            - (tvecz * edge1y));
            qvecy = ((tvecz * edge1x)
            - (tvecx * 0));
            qvecz = ((tvecx * edge1y)
            - (tvecy * edge1x));
            v = ((r.dx * qvecx)
            + ((r.dy * qvecy)
            + (r.dz * qvecz)));
            if (((v < 0)
                || (u
                + (v > det)))) {
                return;
            }

        }
        else if ((det < 0)) {
            let tvecx: number = (r.ox - uv00);
            let tvecy: number = (r.oy - uv01);
            let tvecz: number = r.oz;
            u = ((tvecx * pvecx)
            + ((tvecy * pvecy)
            + (tvecz * pvecz)));
            if (((u > 0)
                || (u < det))) {
                return;
            }

            qvecx = ((tvecy * 0)
            - (tvecz * edge1y));
            qvecy = ((tvecz * edge1x)
            - (tvecx * 0));
            qvecz = ((tvecx * edge1y)
            - (tvecy * edge1x));
            v = ((r.dx * qvecx)
            + ((r.dy * qvecy)
            + (r.dz * qvecz)));
            if (((v > 0)
                || (u
                + (v < det)))) {
                return;
            }

        }
        else {
            return;
        }

        let inv_det: number = (1 / det);
        let t: number = (<number>((((edge2x * qvecx)
        + ((edge2y * qvecy) + (0 * qvecz)))
        * inv_det)));
        if (r.isInside(t)) {
            r.setMax(t);
            state.setIntersection(primID, (<number>((u * inv_det))), (<number>((v * inv_det))));
        }

    }

    public prepareShadingState(state: ShadingState) {
        state.init();
        let parent: Instance = state.getInstance();
        let primID: number = state.getPrimitiveID();
        let u: number = state.getU();
        let v: number = state.getV();
        let w: number = (1
        - (u - v));
        //  state.getRay().getPoint(state.getPoint());
        let tri: number = (3 * primID);
        let index0: number = triangles[(tri + 0)];
        let index1: number = triangles[(tri + 1)];
        let index2: number = triangles[(tri + 2)];
        let v0p: Point3 = getPoint(index0);
        let v1p: Point3 = getPoint(index1);
        let v2p: Point3 = getPoint(index2);
        //  get object space point from barycentric coordinates
        state.getPoint().x = ((w * v0p.x)
        + ((u * v1p.x)
        + (v * v2p.x)));
        state.getPoint().y = ((w * v0p.y)
        + ((u * v1p.y)
        + (v * v2p.y)));
        state.getPoint().z = ((w * v0p.z)
        + ((u * v1p.z)
        + (v * v2p.z)));
        //  move into world space
        state.getPoint().set(parent.transformObjectToWorld(state.getPoint()));
        let ng: Vector3 = Point3.normal(v0p, v1p, v2p);
        if ((parent != null)) {
            ng = parent.transformNormalObjectToWorld(ng);
        }

        ng.normalize();
        state.getGeoNormal().set(ng);
        switch (normals.interp) {
            case NONE:
            case FACE:
                state.getNormal().set(ng);
                break;
                break;
            case VERTEX:
                let i30: number = (3 * index0);
                let i31: number = (3 * index1);
                let i32: number = (3 * index2);
                let normals: number[] = TriangleMesh.this.normals.data;
                state.getNormal().x = ((w * normals[(i30 + 0)])
                + ((u * normals[(i31 + 0)])
                + (v * normals[(i32 + 0)])));
                state.getNormal().y = ((w * normals[(i30 + 1)])
                + ((u * normals[(i31 + 1)])
                + (v * normals[(i32 + 1)])));
                state.getNormal().z = ((w * normals[(i30 + 2)])
                + ((u * normals[(i31 + 2)])
                + (v * normals[(i32 + 2)])));
                if ((parent != null)) {
                    state.getNormal().set(parent.transformNormalObjectToWorld(state.getNormal()));
                }

                state.getNormal().normalize();
                break;
                break;
            case FACEVARYING:
                let idx: number = (3 * tri);
                let normals: number[] = TriangleMesh.this.normals.data;
                state.getNormal().x = ((w * normals[(idx + 0)])
                + ((u * normals[(idx + 3)])
                + (v * normals[(idx + 6)])));
                state.getNormal().y = ((w * normals[(idx + 1)])
                + ((u * normals[(idx + 4)])
                + (v * normals[(idx + 7)])));
                state.getNormal().z = ((w * normals[(idx + 2)])
                + ((u * normals[(idx + 5)])
                + (v * normals[(idx + 8)])));
                if ((parent != null)) {
                    state.getNormal().set(parent.transformNormalObjectToWorld(state.getNormal()));
                }

                state.getNormal().normalize();
                break;
                break;
        }

        let uv21: number = 0;
        let uv00: number = 0;
        let uv01: number = 0;
        let uv10: number = 0;
        let uv11: number = 0;
        let uv20: number = 0;
        switch (uvs.interp) {
            case NONE:
            case FACE:
                state.getUV().x = 0;
                state.getUV().y = 0;
                break;
                break;
            case VERTEX:
                let i20: number = (2 * index0);
                let i21: number = (2 * index1);
                let i22: number = (2 * index2);
                let uvs: number[] = TriangleMesh.this.uvs.data;
                uv00 = uvs[(i20 + 0)];
                uv01 = uvs[(i20 + 1)];
                uv10 = uvs[(i21 + 0)];
                uv11 = uvs[(i21 + 1)];
                uv20 = uvs[(i22 + 0)];
                uv21 = uvs[(i22 + 1)];
                break;
                break;
            case FACEVARYING:
                let idx: number = (tri + 1);
                let uvs: number[] = TriangleMesh.this.uvs.data;
                uv00 = uvs[(idx + 0)];
                uv01 = uvs[(idx + 1)];
                uv10 = uvs[(idx + 2)];
                uv11 = uvs[(idx + 3)];
                uv20 = uvs[(idx + 4)];
                uv21 = uvs[(idx + 5)];
                break;
                break;
        }

        if ((uvs.interp != InterpolationType.NONE)) {
            //  get exact uv coords and compute tangent vectors
            state.getUV().x = ((w * uv00)
            + ((u * uv10)
            + (v * uv20)));
            state.getUV().y = ((w * uv01)
            + ((u * uv11)
            + (v * uv21)));
            let du1: number = (uv00 - uv20);
            let du2: number = (uv10 - uv20);
            let dv1: number = (uv01 - uv21);
            let dv2: number = (uv11 - uv21);
            let dp2: Vector3 = Point3.sub(v1p, v2p, new Vector3());
            let dp1: Vector3 = Point3.sub(v0p, v2p, new Vector3());
            let determinant: number = ((du1 * dv2)
            - (dv1 * du2));
            if ((determinant == 0)) {
                //  create basis in world space
                state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
            }
            else {
                let invdet: number = (1.f / determinant);
                //  Vector3 dpdu = new Vector3();
                //  dpdu.x = (dv2 * dp1.x - dv1 * dp2.x) * invdet;
                //  dpdu.y = (dv2 * dp1.y - dv1 * dp2.y) * invdet;
                //  dpdu.z = (dv2 * dp1.z - dv1 * dp2.z) * invdet;
                let dpdv: Vector3 = new Vector3();
                dpdv.x = ((((du2 * dp1.x)
                * -1)
                + (du1 * dp2.x))
                * invdet);
                dpdv.y = ((((du2 * dp1.y)
                * -1)
                + (du1 * dp2.y))
                * invdet);
                dpdv.z = ((((du2 * dp1.z)
                * -1)
                + (du1 * dp2.z))
                * invdet);
                if ((parent != null)) {
                    dpdv = parent.transformVectorObjectToWorld(dpdv);
                }

                //  create basis in world space
                state.setBasis(OrthoNormalBasis.makeFromWV(state.getNormal(), dpdv));
            }

        }
        else {
            state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
        }

        let shaderIndex: number = (faceShaders == null);
        // TODO: Warning!!!, inline IF is not supported ?
        state.setShader(parent.getShader(shaderIndex));
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        return true;
    }
}
Unknown

public getPrimitiveBound(primID: number, i: number): number {
    let tri: number = (3 * primID);
    let a: number = (3 * triangles[(tri + 0)]);
    let b: number = (3 * triangles[(tri + 1)]);
    let c: number = (3 * triangles[(tri + 2)]);
    let axis: number;
    1;
    if (((i & 1)
        == 0)) {
        return MathUtils.min(points[(a + axis)], points[(b + axis)], points[(c + axis)]);
    }
    else {
        return MathUtils.max(points[(a + axis)], points[(b + axis)], points[(c + axis)]);
    }

}

public getWorldBounds(o2w: Matrix4): BoundingBox {
    let bounds: BoundingBox = new BoundingBox();
    if ((o2w == null)) {
        for (let i: number = 0; (i < points.length); i += 3) {
            bounds.include(points[i], points[(i + 1)], points[(i + 2)]);
        }

    }
    else {
        //  transform vertices first
        for (let i: number = 0; (i < points.length); i += 3) {
            let x: number = points[i];
            let y: number = points[(i + 1)];
            let z: number = points[(i + 2)];
            let wx: number = o2w.transformPX(x, y, z);
            let wy: number = o2w.transformPY(x, y, z);
            let wz: number = o2w.transformPZ(x, y, z);
            bounds.include(wx, wy, wz);
        }

    }

    return bounds;
}

public intersectPrimitiveRobust(r: Ray, primID: number, state: IntersectionState) {
    //  ray-triangle intersection here
    let tri: number = (3 * primID);
    let a: number = (3 * triangles[(tri + 0)]);
    let b: number = (3 * triangles[(tri + 1)]);
    let c: number = (3 * triangles[(tri + 2)]);
    let stack: number[] = state.getRobustStack();
    for (let i3: number = 0; (i < 3); i++) {
    }

    let i: number = 0;
    i3 += 3;
    stack[(i3 + 0)] = points[(a + i)];
    stack[(i3 + 1)] = points[(b + i)];
    stack[(i3 + 2)] = points[(c + i)];
    stack[9] = Float.POSITIVE_INFINITY;
    let stackpos: number = 0;
    let orgX: number = r.ox;
    let invDirX: number = (1 / dirX);
    let dirX: number = r.dx;
    let orgY: number = r.oy;
    let invDirY: number = (1 / dirY);
    let dirY: number = r.dy;
    let orgZ: number = r.oz;
    let invDirZ: number = (1 / dirZ);
    let dirZ: number = r.dz;
    let t2: number;
    let t1: number;
    let maxx: number;
    let minx: number;
    let maxy: number;
    let miny: number;
    let maxz: number;
    let minz: number;
    let mint: number = r.getMin();
    let maxt: number = r.getMax();
    while ((stackpos >= 0)) {
        let intervalMin: number = mint;
        let intervalMax: number = maxt;
        let p0x: number = stack[(stackpos + 0)];
        let p1x: number = stack[(stackpos + 1)];
        let p2x: number = stack[(stackpos + 2)];
        t1 = ((MathUtils.min(p0x, p1x, p2x) - orgX)
        * invDirX);
        t2 = ((MathUtils.max(p0x, p1x, p2x) - orgX)
        * invDirX);
        if ((invDirX > 0)) {
            if ((t1 > intervalMin)) {
                intervalMin = t1;
            }

            if ((t2 < intervalMax)) {
                intervalMax = t2;
            }

        }
        else {
            if ((t2 > intervalMin)) {
                intervalMin = t2;
            }

            if ((t1 < intervalMax)) {
                intervalMax = t1;
            }

        }

        if ((intervalMin > intervalMax)) {
            stackpos -= 10;
            // TODO: Warning!!! continue If
        }

        let p0y: number = stack[(stackpos + 3)];
        let p1y: number = stack[(stackpos + 4)];
        let p2y: number = stack[(stackpos + 5)];
        t1 = ((MathUtils.min(p0y, p1y, p2y) - orgY)
        * invDirY);
        t2 = ((MathUtils.max(p0y, p1y, p2y) - orgY)
        * invDirY);
        if ((invDirY > 0)) {
            if ((t1 > intervalMin)) {
                intervalMin = t1;
            }

            if ((t2 < intervalMax)) {
                intervalMax = t2;
            }

        }
        else {
            if ((t2 > intervalMin)) {
                intervalMin = t2;
            }

            if ((t1 < intervalMax)) {
                intervalMax = t1;
            }

        }

        if ((intervalMin > intervalMax)) {
            stackpos -= 10;
            // TODO: Warning!!! continue If
        }

        let p0z: number = stack[(stackpos + 6)];
        let p1z: number = stack[(stackpos + 7)];
        let p2z: number = stack[(stackpos + 8)];
        t1 = ((MathUtils.min(p0z, p1z, p2z) - orgZ)
        * invDirZ);
        t2 = ((MathUtils.max(p0z, p1z, p2z) - orgZ)
        * invDirZ);
        if ((invDirZ > 0)) {
            if ((t1 > intervalMin)) {
                intervalMin = t1;
            }

            if ((t2 < intervalMax)) {
                intervalMax = t2;
            }

        }
        else {
            if ((t2 > intervalMin)) {
                intervalMin = t2;
            }

            if ((t1 < intervalMax)) {
                intervalMax = t1;
            }

        }

        if ((intervalMin > intervalMax)) {
            stackpos -= 10;
            // TODO: Warning!!! continue If
        }

        //  intersection was found - keep going
        let size: number = ((maxx - minx)
        + ((maxy - miny)
        + (maxz - minz)));
        if ((Float.floatToRawIntBits(stack[(stackpos + 9)]) == Float.floatToRawIntBits(size))) {
            //  L1 norm is 0, we are done
            r.setMax(intervalMin);
            triaccel[primID].intersectBox(r, p0x, p0y, p0z, primID, state);
            return;
            //  safe to return, only one intersection per primitive
        }

        //  not small enough yet - subdivide
        let p01x: number = ((p0x + p1x)
        * 0.5);
        let p01y: number = ((p0y + p1y)
        * 0.5);
        let p01z: number = ((p0z + p1z)
        * 0.5);
        let p12x: number = ((p1x + p2x)
        * 0.5);
        let p12y: number = ((p1y + p2y)
        * 0.5);
        let p12z: number = ((p1z + p2z)
        * 0.5);
        let p20x: number = ((p2x + p0x)
        * 0.5);
        let p20y: number = ((p2y + p0y)
        * 0.5);
        let p20z: number = ((p2z + p0z)
        * 0.5);
        //  triangle 0
        stack[(stackpos + 0)] = p0x;
        stack[(stackpos + 1)] = p01x;
        stack[(stackpos + 2)] = p20x;
        stack[(stackpos + 3)] = p0y;
        stack[(stackpos + 4)] = p01y;
        stack[(stackpos + 5)] = p20y;
        stack[(stackpos + 6)] = p0z;
        stack[(stackpos + 7)] = p01z;
        stack[(stackpos + 8)] = p20z;
        stack[(stackpos + 9)] = size;
        stackpos += 10;
        //  triangle 1
        stack[(stackpos + 0)] = p1x;
        stack[(stackpos + 1)] = p12x;
        stack[(stackpos + 2)] = p01x;
        stack[(stackpos + 3)] = p1y;
        stack[(stackpos + 4)] = p12y;
        stack[(stackpos + 5)] = p01y;
        stack[(stackpos + 6)] = p1z;
        stack[(stackpos + 7)] = p12z;
        stack[(stackpos + 8)] = p01z;
        stack[(stackpos + 9)] = size;
        stackpos += 10;
        //  triangle 2
        stack[(stackpos + 0)] = p2x;
        stack[(stackpos + 1)] = p20x;
        stack[(stackpos + 2)] = p12x;
        stack[(stackpos + 3)] = p2y;
        stack[(stackpos + 4)] = p20y;
        stack[(stackpos + 5)] = p12y;
        stack[(stackpos + 6)] = p2z;
        stack[(stackpos + 7)] = p20z;
        stack[(stackpos + 8)] = p12z;
        stack[(stackpos + 9)] = size;
        stackpos += 10;
        //  triangle 4
        stack[(stackpos + 0)] = p20x;
        stack[(stackpos + 1)] = p12x;
        stack[(stackpos + 2)] = p01x;
        stack[(stackpos + 3)] = p20y;
        stack[(stackpos + 4)] = p12y;
        stack[(stackpos + 5)] = p01y;
        stack[(stackpos + 6)] = p20z;
        stack[(stackpos + 7)] = p12z;
        stack[(stackpos + 8)] = p01z;
        stack[(stackpos + 9)] = size;
    }

}

private intersectTriangleKensler(r: Ray, primID: number, state: IntersectionState) {
    let tri: number = (3 * primID);
    let a: number = (3 * triangles[(tri + 0)]);
    let b: number = (3 * triangles[(tri + 1)]);
    let c: number = (3 * triangles[(tri + 2)]);
    let edge0x: number = (points[(b + 0)] - points[(a + 0)]);
    let edge0y: number = (points[(b + 1)] - points[(a + 1)]);
    let edge0z: number = (points[(b + 2)] - points[(a + 2)]);
    let edge1x: number = (points[(a + 0)] - points[(c + 0)]);
    let edge1y: number = (points[(a + 1)] - points[(c + 1)]);
    let edge1z: number = (points[(a + 2)] - points[(c + 2)]);
    let nx: number = ((edge0y * edge1z)
    - (edge0z * edge1y));
    let ny: number = ((edge0z * edge1x)
    - (edge0x * edge1z));
    let nz: number = ((edge0x * edge1y)
    - (edge0y * edge1x));
    let v: number = r.dot(nx, ny, nz);
    let iv: number = (1 / v);
    let edge2x: number = (points[(a + 0)] - r.ox);
    let edge2y: number = (points[(a + 1)] - r.oy);
    let edge2z: number = (points[(a + 2)] - r.oz);
    let va: number = ((nx * edge2x)
    + ((ny * edge2y)
    + (nz * edge2z)));
    let t: number = (iv * va);
    if (!r.isInside(t)) {
        return;
    }

    let ix: number = ((edge2y * r.dz)
    - (edge2z * r.dy));
    let iy: number = ((edge2z * r.dx)
    - (edge2x * r.dz));
    let iz: number = ((edge2x * r.dy)
    - (edge2y * r.dx));
    let v1: number = ((ix * edge1x)
    + ((iy * edge1y)
    + (iz * edge1z)));
    let beta: number = (iv * v1);
    if ((beta < 0)) {
        return;
    }

    let v2: number = ((ix * edge0x)
    + ((iy * edge0y)
    + (iz * edge0z)));
    if ((((v1 + v2)
        * v)
        > (v * v))) {
        return;
    }

    let gamma: number = (iv * v2);
    if ((gamma < 0)) {
        return;
    }

    r.setMax(t);
    state.setIntersection(primID, beta, gamma);
}

public intersectPrimitive(r: Ray, primID: number, state: IntersectionState) {
    //  alternative test -- disabled for now
    //  intersectPrimitiveRobust(r, primID, state);
    if ((triaccel != null)) {
        //  optional fast intersection method
        triaccel[primID].intersect(r, primID, state);
        return;
    }

    intersectTriangleKensler(r, primID, state);
}

public getNumPrimitives(): number {
    return (triangles.length / 3);
}

public prepareShadingState(state: ShadingState) {
    state.init();
    let parent: Instance = state.getInstance();
    let primID: number = state.getPrimitiveID();
    let u: number = state.getU();
    let v: number = state.getV();
    let w: number = (1
    - (u - v));
    state.getRay().getPoint(state.getPoint());
    let tri: number = (3 * primID);
    let index0: number = triangles[(tri + 0)];
    let index1: number = triangles[(tri + 1)];
    let index2: number = triangles[(tri + 2)];
    let v0p: Point3 = getPoint(index0);
    let v1p: Point3 = getPoint(index1);
    let v2p: Point3 = getPoint(index2);
    let ng: Vector3 = Point3.normal(v0p, v1p, v2p);
    ng = parent.transformNormalObjectToWorld(ng);
    ng.normalize();
    state.getGeoNormal().set(ng);
    switch (normals.interp) {
        case NONE:
        case FACE:
            state.getNormal().set(ng);
            break;
            break;
        case VERTEX:
            let i30: number = (3 * index0);
            let i31: number = (3 * index1);
            let i32: number = (3 * index2);
            let normals: number[] = this.normals.data;
            state.getNormal().x = ((w * normals[(i30 + 0)])
            + ((u * normals[(i31 + 0)])
            + (v * normals[(i32 + 0)])));
            state.getNormal().y = ((w * normals[(i30 + 1)])
            + ((u * normals[(i31 + 1)])
            + (v * normals[(i32 + 1)])));
            state.getNormal().z = ((w * normals[(i30 + 2)])
            + ((u * normals[(i31 + 2)])
            + (v * normals[(i32 + 2)])));
            state.getNormal().set(parent.transformNormalObjectToWorld(state.getNormal()));
            state.getNormal().normalize();
            break;
            break;
        case FACEVARYING:
            let idx: number = (3 * tri);
            let normals: number[] = this.normals.data;
            state.getNormal().x = ((w * normals[(idx + 0)])
            + ((u * normals[(idx + 3)])
            + (v * normals[(idx + 6)])));
            state.getNormal().y = ((w * normals[(idx + 1)])
            + ((u * normals[(idx + 4)])
            + (v * normals[(idx + 7)])));
            state.getNormal().z = ((w * normals[(idx + 2)])
            + ((u * normals[(idx + 5)])
            + (v * normals[(idx + 8)])));
            state.getNormal().set(parent.transformNormalObjectToWorld(state.getNormal()));
            state.getNormal().normalize();
            break;
            break;
    }

    let uv21: number = 0;
    let uv00: number = 0;
    let uv01: number = 0;
    let uv10: number = 0;
    let uv11: number = 0;
    let uv20: number = 0;
    switch (uvs.interp) {
        case NONE:
        case FACE:
            state.getUV().x = 0;
            state.getUV().y = 0;
            break;
            break;
        case VERTEX:
            let i20: number = (2 * index0);
            let i21: number = (2 * index1);
            let i22: number = (2 * index2);
            let uvs: number[] = this.uvs.data;
            uv00 = uvs[(i20 + 0)];
            uv01 = uvs[(i20 + 1)];
            uv10 = uvs[(i21 + 0)];
            uv11 = uvs[(i21 + 1)];
            uv20 = uvs[(i22 + 0)];
            uv21 = uvs[(i22 + 1)];
            break;
            break;
        case FACEVARYING:
            let idx: number = (tri + 1);
            let uvs: number[] = this.uvs.data;
            uv00 = uvs[(idx + 0)];
            uv01 = uvs[(idx + 1)];
            uv10 = uvs[(idx + 2)];
            uv11 = uvs[(idx + 3)];
            uv20 = uvs[(idx + 4)];
            uv21 = uvs[(idx + 5)];
            break;
            break;
    }

    if ((uvs.interp != InterpolationType.NONE)) {
        //  get exact uv coords and compute tangent vectors
        state.getUV().x = ((w * uv00)
        + ((u * uv10)
        + (v * uv20)));
        state.getUV().y = ((w * uv01)
        + ((u * uv11)
        + (v * uv21)));
        let du1: number = (uv00 - uv20);
        let du2: number = (uv10 - uv20);
        let dv1: number = (uv01 - uv21);
        let dv2: number = (uv11 - uv21);
        let dp2: Vector3 = Point3.sub(v1p, v2p, new Vector3());
        let dp1: Vector3 = Point3.sub(v0p, v2p, new Vector3());
        let determinant: number = ((du1 * dv2)
        - (dv1 * du2));
        if ((determinant == 0)) {
            //  create basis in world space
            state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
        }
        else {
            let invdet: number = (1.f / determinant);
            //  Vector3 dpdu = new Vector3();
            //  dpdu.x = (dv2 * dp1.x - dv1 * dp2.x) * invdet;
            //  dpdu.y = (dv2 * dp1.y - dv1 * dp2.y) * invdet;
            //  dpdu.z = (dv2 * dp1.z - dv1 * dp2.z) * invdet;
            let dpdv: Vector3 = new Vector3();
            dpdv.x = ((((du2 * dp1.x)
            * -1)
            + (du1 * dp2.x))
            * invdet);
            dpdv.y = ((((du2 * dp1.y)
            * -1)
            + (du1 * dp2.y))
            * invdet);
            dpdv.z = ((((du2 * dp1.z)
            * -1)
            + (du1 * dp2.z))
            * invdet);
            dpdv = parent.transformVectorObjectToWorld(dpdv);
            //  create basis in world space
            state.setBasis(OrthoNormalBasis.makeFromWV(state.getNormal(), dpdv));
        }

    }
    else {
        state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
    }

    let shaderIndex: number = (faceShaders == null);
    // TODO: Warning!!!, inline IF is not supported ?
    state.setShader(parent.getShader(shaderIndex));
    state.setModifier(parent.getModifier(shaderIndex));
}

public init() {
    triaccel = null;
    let nt: number = this.getNumPrimitives();
    if (!smallTriangles) {
        //  too many triangles? -- don't generate triaccel to save memory
        if ((nt > 2000000)) {
            UI.printWarning(Module.GEOM, "TRI - Too many triangles -- triaccel generation skipped");
            return;
        }

        triaccel = new Array(nt);
        for (let i: number = 0; (i < nt); i++) {
            triaccel[i] = new WaldTriangle(this, i);
        }

    }

}

protected getPoint(i: number): Point3 {
    i = (i * 3);
    return new Point3(points[i], points[(i + 1)], points[(i + 2)]);
}

public getPoint(tri: number, i: number, p: Point3) {
    let index: number = (3 * triangles[((3 * tri)
    + i)]);
    p.set(points[index], points[(index + 1)], points[(index + 2)]);
}

public getBakingPrimitives(): PrimitiveList {
    switch (uvs.interp) {
        case NONE:
        case FACE:
            UI.printError(Module.GEOM, "Cannot generate baking surface without texture coordinate data");
            return null;
            break;
        default:
            return new BakingSurface();
            break;
    }

}