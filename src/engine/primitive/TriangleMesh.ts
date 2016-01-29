import {Point3} from "../math/Point3";
import {PrimitiveList} from "../core/PrimitiveList";
import {FloatParameter} from "../core/ParameterList";
import {ByteArrayBase} from "../../pointer/ByteArrayBase";
import {ParameterList} from "../core/ParameterList";
import {GlobalIlluminationAPI} from "../GlobalIlluminatiionAPI";
import {BrowserPlatform} from "../../utils/BrowserPlatform";
import {InterpolationType} from "../core/ParameterList";
import {BoundingBox} from "../math/BoundingBox";
import {Matrix4} from "../math/Matrix4";
import {Ray} from "../core/Ray";
import {IntersectionState} from "../core/IntersectionState";
import {Vector3} from "../math/Vector3";
import {ShadingState} from "../core/ShadingState";
import {Instance} from "../core/Instance";
import {OrthoNormalBasis} from "../math/OrthoNormalBasis";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
/**
 * TODO: handle inner private class reference to parent class
 */
class WaldTriangle {
    // private data for fast triangle intersection testing
    private k:int;
    private nu:float;
    private nv:float;
    private nd:float;
    private bnu:float;
    private bnv:float;
    private bnd:float;
    private cnu:float;
    private cnv:float;
    private cnd:float;

    private WaldTriangle(mesh:TriangleMesh, tri:int) {
    this.k = 0;
    tri *= 3;
    var index0:int = mesh.triangles[tri + 0];
        var index1:int = mesh.triangles[tri + 1];
        var index2:int = mesh.triangles[tri + 2];
     var v0p:Point3 = mesh.getPoint(index0);
    var v1p:Point3 = mesh.getPoint(index1);
    var v2p:Point3 = mesh.getPoint(index2);
    var ng:Vector3 = Point3.normal(v0p, v1p, v2p);

    if (Math.abs(ng.x) > Math.abs(ng.y) && Math.abs(ng.x) > Math.abs(ng.z)) {
        k = 0;
    }
    else if (Math.abs(ng.y) > Math.abs(ng.z)) {
        k = 1;
    }
    else {
        k = 2;
    }

    var ax:float, ay, bx, by, cx, cy;
    switch (k) {
    case 0: {
            nu = ng.y / ng.x;
            nv = ng.z / ng.x;
            nd = v0p.x + (nu * v0p.y) + (nv * v0p.z);
            ax = v0p.y;
            ay = v0p.z;
            bx = v2p.y - ax;
            by = v2p.z - ay;
            cx = v1p.y - ax;
            cy = v1p.z - ay;
            break;
        }
    case 1: {
            nu = ng.z / ng.y;
            nv = ng.x / ng.y;
            nd = (nv * v0p.x) + v0p.y + (nu * v0p.z);
            ax = v0p.z;
            ay = v0p.x;
            bx = v2p.z - ax;
            by = v2p.x - ay;
            cx = v1p.z - ax;
            cy = v1p.x - ay;
            break;
        }
    case 2:
    default: {
            nu = ng.x / ng.z;
            nv = ng.y / ng.z;
            nd = (nu * v0p.x) + (nv * v0p.y) + v0p.z;
            ax = v0p.x;
            ay = v0p.y;
            bx = v2p.x - ax;
            by = v2p.y - ay;
            cx = v1p.x - ax;
            cy = v1p.y - ay;
        }
    }
    var det:float = bx * cy - by * cx;
    bnu = -by / det;
    bnv = bx / det;
    bnd = (by * ax - bx * ay) / det;
    cnu = cy / det;
    cnv = -cx / det;
    cnd = (cx * ay - cy * ax) / det;
}

intersectBox(r:Ray, hx:float, hy:float, hz:float, primID:int, state:IntersectionState):void {
    switch (k) {
        case 0: {
            var hu:float = hy;
            var hv:float = hz;
            var u:float = hu * bnu + hv * bnv + bnd;
            if (u < 0.0) {
                u = 0;
            }
            var v:float = hu * cnu + hv * cnv + cnd;
            if (v < 0.0) {
                v = 0;
            }
            state.setIntersection(primID, u, v);
            return;
        }
        case 1: {
            var hu:float = hz;
            var hv:float = hx;
            var u:float = hu * bnu + hv * bnv + bnd;
            if (u < 0.0) {
                u = 0;
            }
            var v:float = hu * cnu + hv * cnv + cnd;
            if (v < 0.0) {
                v = 0;
            }
            state.setIntersection(primID, u, v);
            return;
        }
        case 2: {
            var hu:float = hx;
            var hv:float = hy;
            var u:float = hu * bnu + hv * bnv + bnd;
            if (u < 0.0) {
                u = 0;
            }
            var v:float = hu * cnu + hv * cnv + cnd;
            if (v < 0.0) {
                v = 0;
            }
            state.setIntersection(primID, u, v);
            return;
        }
    }
}

intersect(r:Ray, primID:int, state:IntersectionState):void {
    switch (k) {
        case 0: {
            var det:float = 1.0 / (r.dx + nu * r.dy + nv * r.dz);
            var t:float = (nd - r.ox - nu * r.oy - nv * r.oz) * det;
            if (!r.isInside(t)) {
                return;
            }
            var hu:float = r.oy + t * r.dy;
            var hv:float = r.oz + t * r.dz;
            var u:float = hu * bnu + hv * bnv + bnd;
            if (u < 0.0){
                return;
            }
            var v:float = hu * cnu + hv * cnv + cnd;
            if (v < 0.0 || u + v > 1.0) {
                return;
            }
            r.setMax(t);
            state.setIntersection(primID, u, v);
            return;
        }
        case 1: {
            var det:float = 1.0 / (r.dy + nu * r.dz + nv * r.dx);
            var t:float = (nd - r.oy - nu * r.oz - nv * r.ox) * det;
            if (!r.isInside(t)) {
                return;
            }
            var hu:float = r.oz + t * r.dz;
            var hv:float = r.ox + t * r.dx;
            var u:float = hu * bnu + hv * bnv + bnd;
            if (u < 0.0) {
                return;
            }
            var v:float = hu * cnu + hv * cnv + cnd;
            if (v < 0.0 || u + v > 1.0) {
                return;
            }
            r.setMax(t);
            state.setIntersection(primID, u, v);
            return;
        }
        case 2: {
            var det:float = 1.0 / (r.dz + nu * r.dx + nv * r.dy);
            var t:float = (nd - r.oz - nu * r.ox - nv * r.oy) * det;
            if (!r.isInside(t)) {
                return;
            }
            var hu:float = r.ox + t * r.dx;
            var hv:float = r.oy + t * r.dy;
            var u:float = hu * bnu + hv * bnv + bnd;
            if (u < 0.0) {
                return;
            }
            var v:float = hu * cnu + hv * cnv + cnd;
            if (v < 0.0 || u + v > 1.0) {
                return;
            }
            r.setMax(t);
            state.setIntersection(primID, u, v);
            return;
        }
    }
}
}
class BakingSurface implements PrimitiveList {
    public getBakingPrimitives():PrimitiveList {
        return null;
    }

    public getNumPrimitives():int {

        return TriangleMesh.this.getNumPrimitives();
    }

    public getPrimitiveBound(primID:int, i:int):float {
        if (i > 3) {
            return 0;
        }
        switch (TriangleMesh.this.uvs.interp) {
            case InterpolationType.NONE:
            case InterpolationType.FACE:
            default:
            {
                return 0;
            }
            case InterpolationType.VERTEX:
            {
                var tri:int = 3 * primID;
                var index0:int = triangles[tri + 0];
                var index1:int = triangles[tri + 1];
                var index2:int = triangles[tri + 2];
                var i20:int = 2 * index0;
                var i21:int = 2 * index1;
                var i22:int = 2 * index2;
                var uvs:Float32Array = TriangleMesh.this.uvs.data;
                switch (i) {
                    case 0:
                        return Math.min(uvs[i20 + 0], uvs[i21 + 0], uvs[i22 + 0]);
                    case 1:
                        return Math.max(uvs[i20 + 0], uvs[i21 + 0], uvs[i22 + 0]);
                    case 2:
                        return Math.min(uvs[i20 + 1], uvs[i21 + 1], uvs[i22 + 1]);
                    case 3:
                        return Math.max(uvs[i20 + 1], uvs[i21 + 1], uvs[i22 + 1]);
                    default:
                        return 0;
                }
            }
            case FACEVARYING:
            {
                var idx = 6 * primID;
                var uvs:Float32Array = TriangleMesh.this.uvs.data;
                switch (i) {
                    case 0:
                        return Math.min(uvs[idx + 0], uvs[idx + 2], uvs[idx + 4]);
                    case 1:
                        return Math.max(uvs[idx + 0], uvs[idx + 2], uvs[idx + 4]);
                    case 2:
                        return Math.min(uvs[idx + 1], uvs[idx + 3], uvs[idx + 5]);
                    case 3:
                        return Math.max(uvs[idx + 1], uvs[idx + 3], uvs[idx + 5]);
                    default:
                        return 0;
                }
            }
        }
    }

    public getWorldBounds(o2w:Matrix4):BoundingBox {
        var bounds:BoundingBox = new BoundingBox();
        if (o2w == null) {
            for (var i:int = 0; i < uvs.data.length; i += 2)
                bounds.include(uvs.data[i], uvs.data[i + 1], 0);
        } else {
            // transform vertices first
            for (var i:int = 0; i < uvs.data.length; i += 2) {
                var x:float = uvs.data[i];
                var y:float = uvs.data[i + 1];
                var wx:float = o2w.transformPX(x, y, 0);
                var wy:float = o2w.transformPY(x, y, 0);
                var wz:float = o2w.transformPZ(x, y, 0);
                bounds.include(wx, wy, wz);
            }
        }
        return bounds;
    }

    public intersectPrimitive(r:Ray, primID:int, state:IntersectionState):void {
        var uv00:float = 0, uv01 = 0, uv10 = 0, uv11 = 0, uv20 = 0, uv21 = 0;
        switch (TriangleMesh.uvs.interp) {
            case NONE:
            case FACE:
            default:
                return;
            case VERTEX:
            {
                var tri:int = 3 * primID;
                var index0:int = triangles[tri + 0];
                var index1:int = triangles[tri + 1];
                var index2:int = triangles[tri + 2];
                var i20:int = 2 * index0;
                var i21:int = 2 * index1;
                var i22:int = 2 * index2;
                let uvs:Float32Array = TriangleMesh.uvs.data;
                uv00 = uvs[i20 + 0];
                uv01 = uvs[i20 + 1];
                uv10 = uvs[i21 + 0];
                uv11 = uvs[i21 + 1];
                uv20 = uvs[i22 + 0];
                uv21 = uvs[i22 + 1];
                break;

            }
            case FACEVARYING:
            {
                var idx:int = (3 * primID) << 1;
                let uvs:Float32Array = TriangleMesh.this.uvs.data;
                uv00 = uvs[idx + 0];
                uv01 = uvs[idx + 1];
                uv10 = uvs[idx + 2];
                uv11 = uvs[idx + 3];
                uv20 = uvs[idx + 4];
                uv21 = uvs[idx + 5];
                break;
            }
        }

        var edge1x:double = uv10 - uv00;
        var edge1y:double = uv11 - uv01;
        var edge2x:double = uv20 - uv00;
        var edge2y:double = uv21 - uv01;
        var pvecx:double = r.dy * 0 - r.dz * edge2y;
        var pvecy:double = r.dz * edge2x - r.dx * 0;
        var pvecz:double = r.dx * edge2y - r.dy * edge2x;
        var qvecx:double, qvecy, qvecz;
        var u:double, v;
        var det:double = edge1x * pvecx + edge1y * pvecy + 0 * pvecz;
        if (det > 0) {
            var tvecx:double = r.ox - uv00;
            var tvecy:double = r.oy - uv01;
            var tvecz:double = r.oz;
            u = (tvecx * pvecx + tvecy * pvecy + tvecz * pvecz);
            if (u < 0.0 || u > det) {
                return;
            }
            qvecx = tvecy * 0 - tvecz * edge1y;
            qvecy = tvecz * edge1x - tvecx * 0;
            qvecz = tvecx * edge1y - tvecy * edge1x;
            v = (r.dx * qvecx + r.dy * qvecy + r.dz * qvecz);
            if (v < 0.0 || u + v > det) {
                return;
            }
        } else if (det < 0) {
            var tvecx:double = r.ox - uv00;
            var tvecy:double = r.oy - uv01;
            var tvecz:double = r.oz;
            u = (tvecx * pvecx + tvecy * pvecy + tvecz * pvecz);
            if (u > 0.0 || u < det) {
                return;
            }
            qvecx = tvecy * 0 - tvecz * edge1y;
            qvecy = tvecz * edge1x - tvecx * 0;
            qvecz = tvecx * edge1y - tvecy * edge1x;
            v = (r.dx * qvecx + r.dy * qvecy + r.dz * qvecz);
            if (v > 0.0 || u + v < det)
                return;
        } else
            return;
        var inv_det:double = 1.0 / det;
        var t:float = (edge2x * qvecx + edge2y * qvecy + 0 * qvecz) * inv_det;
        if (r.isInside(t)) {
            r.setMax(t);
            state.setIntersection(primID, (float)(u * inv_det), (float)(v * inv_det));
        }
    }

    public prepareShadingState(state:ShadingState) {
        state.init();
        var parent:Instance = state.getInstance();
        var primID:int = state.getPrimitiveID();
        var u:float = state.getU();
        var v:float = state.getV();
        var w:float = 1 - u - v;
        // state.getRay().getPoint(state.getPoint());
        var tri:int = 3 * primID;
        var index0:int = triangles[tri + 0];
        var index1:int = triangles[tri + 1];
        var index2:int = triangles[tri + 2];
        var v0p:Point3 = getPoint(index0);
        var v1p:Point3 = getPoint(index1);
        var v2p:Point3 = getPoint(index2);

        // get object space point from barycentric coordinates
        state.getPoint().x = w * v0p.x + u * v1p.x + v * v2p.x;
        state.getPoint().y = w * v0p.y + u * v1p.y + v * v2p.y;
        state.getPoint().z = w * v0p.z + u * v1p.z + v * v2p.z;
        // move into world space
        state.getPoint().set(parent.transformObjectToWorld(state.getPoint()));

        var ng:Vector3 = Point3.normal(v0p, v1p, v2p);
        if (parent != null) {
            ng = parent.transformNormalObjectToWorld(ng);
        }
        ng.normalize();
        state.getGeoNormal().set(ng);
        switch (normals.interp) {
            case InterpolationType.NONE:
            case InterpolationType.FACE:
            {
                state.getNormal().set(ng);
                break;
            }
            case InterpolationType.VERTEX:
            {
                var i30:int = 3 * index0;
                var i31:int = 3 * index1;
                var i32:int = 3 * index2;
                var normals:Float32Array = TriangleMesh.this.normals.data;
                state.getNormal().x = w * normals[i30 + 0] + u * normals[i31 + 0] + v * normals[i32 + 0];
                state.getNormal().y = w * normals[i30 + 1] + u * normals[i31 + 1] + v * normals[i32 + 1];
                state.getNormal().z = w * normals[i30 + 2] + u * normals[i31 + 2] + v * normals[i32 + 2];
                if (parent != null) {
                    state.getNormal().set(parent.transformNormalObjectToWorld(state.getNormal()));
                }
                state.getNormal().normalize();
                break;
            }
            case InterpolationType.FACEVARYING:
            {
                var idx:int = 3 * tri;
                var normals:Float32Array = TriangleMesh.this.normals.data;
                state.getNormal().x = w * normals[idx + 0] + u * normals[idx + 3] + v * normals[idx + 6];
                state.getNormal().y = w * normals[idx + 1] + u * normals[idx + 4] + v * normals[idx + 7];
                state.getNormal().z = w * normals[idx + 2] + u * normals[idx + 5] + v * normals[idx + 8];
                if (parent != null) {
                    state.getNormal().set(parent.transformNormalObjectToWorld(state.getNormal()));
                }
                state.getNormal().normalize();
                break;
            }
        }
        var uv00:float = 0, uv01 = 0, uv10 = 0, uv11 = 0, uv20 = 0, uv21 = 0;
        switch (uvs.interp) {
            case InterpolationType.NONE:
            case InterpolationType.FACE:
            {
                state.getUV().x = 0;
                state.getUV().y = 0;
                break;
            }
            case InterpolationType.VERTEX:
            {
                var i20:int = 2 * index0;
                var i21:int = 2 * index1;
                var i22:int = 2 * index2;
                var uvs:Float32Array = TriangleMesh.this.uvs.data;
                uv00 = uvs[i20 + 0];
                uv01 = uvs[i20 + 1];
                uv10 = uvs[i21 + 0];
                uv11 = uvs[i21 + 1];
                uv20 = uvs[i22 + 0];
                uv21 = uvs[i22 + 1];
                break;
            }
            case FACEVARYING:
            {
                var idx:int = tri << 1;
                var uvs:Float32Array = TriangleMesh.this.uvs.data;
                uv00 = uvs[idx + 0];
                uv01 = uvs[idx + 1];
                uv10 = uvs[idx + 2];
                uv11 = uvs[idx + 3];
                uv20 = uvs[idx + 4];
                uv21 = uvs[idx + 5];
                break;
            }
        }
        if (uvs.interp != InterpolationType.NONE) {
            // get exact uv coords and compute tangent vectors
            state.getUV().x = w * uv00 + u * uv10 + v * uv20;
            state.getUV().y = w * uv01 + u * uv11 + v * uv21;
            var du1:float = uv00 - uv20;
            var du2:float = uv10 - uv20;
            var dv1:float = uv01 - uv21;
            var dv2:float = uv11 - uv21;
            var dp1:Vector3 = Point3.sub(v0p, v2p, new Vector3()), dp2 = Point3.sub(v1p, v2p, new Vector3());
            var determinant:float = du1 * dv2 - dv1 * du2;
            if (determinant == 0.0) {
                // create basis in world space
                state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
            } else {
                var invdet:float = 1 / determinant;
                // Vector3 dpdu = new Vector3();
                // dpdu.x = (dv2 * dp1.x - dv1 * dp2.x) * invdet;
                // dpdu.y = (dv2 * dp1.y - dv1 * dp2.y) * invdet;
                // dpdu.z = (dv2 * dp1.z - dv1 * dp2.z) * invdet;
                var dpdv:Vector3 = new Vector3();
                dpdv.x = (-du2 * dp1.x + du1 * dp2.x) * invdet;
                dpdv.y = (-du2 * dp1.y + du1 * dp2.y) * invdet;
                dpdv.z = (-du2 * dp1.z + du1 * dp2.z) * invdet;
                if (parent != null) {
                    dpdv = parent.transformVectorObjectToWorld(dpdv);
                }
                // create basis in world space
                state.setBasis(OrthoNormalBasis.makeFromWV(state.getNormal(), dpdv));
            }
        } else
            state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
        var shaderIndex:int = faceShaders == null ? 0 : (faceShaders[primID] & 0xFF);
        state.setShader(parent.getShader(shaderIndex));
    }

    public update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        return true;
    }
}
export class TriangleMesh implements PrimitiveList {

    private static smallTriangles:boolean = false;
    protected points:number[];
    protected triangles:number[];
    private triaccel:WaldTriangle[];
    private normals:FloatParameter;
    private uvs:FloatParameter;
    private faceShaders:number[];

    static setSmallTriangles(smallTriangles:boolean) {
        if (smallTriangles) {
            console.log("Small trimesh mode:enabled");
        }
        else {
            console.log("Small trimesh mode:disabled");
        }

        TriangleMesh.smallTriangles = smallTriangles;
    }

    constructor() {
        this.triangles = null;
        this.points = null;
        this.uvs = new FloatParameter();
        this.normals = new FloatParameter();
        this.faceShaders = null;
    }

    writeObj(filename:string) {
        try {
            var objData:string = "";
            objData += "o object\n";
            for (let i:number = 0; i < this.points.length; i += 3) {
                objData += "v " + this.points[i] + " " + this.points[i + 1] + " " + this.points[i + 2] + "\n";
            }

            objData += "s off\n";

            for (let i:number = 0; (i < this.triangles.length); i += 3) {
                objData += "f " + (this.triangles[i] + 1) + " " + (this.triangles[i + 1] + 1) + " " + (this.triangles[i + 2] + 1);
            }

            BrowserPlatform.saveFile(filename, objData);

        }
        catch (e) {
            console.error(e);
        }
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        let updatedTopology:boolean = false;
        let triangles:number[] = pl.getIntArray("triangles");
        if (this.triangles != null) {
            this.triangles = triangles;
            updatedTopology = true;
        }

        if (this.triangles == null) {
            console.error("Unable to update mesh - triangle indices are missing");
            return false;
        }

        if ((this.triangles.length % 3) != 0) {
            console.warn("Triangle index data is not a multiple of 3 - triangles may be missing");
        }

        pl.setFaceCount(this.triangles.length / 3);
        let pointsP:FloatParameter = pl.getPointArray("points");
        if (pointsP != null) {
            if (pointsP.interp != InterpolationType.VERTEX) {
                console.error("Point interpolation type must be set to \"vertex\" - was \"" + pointsP.interp.name().toLowerCase() + "\"");
            }else{
                points=pointsP.data;
                updatedTopology = true;
            }
        }

        if (points == null) {
            console.log("Unable to update mesh - vertices are missing");
            return false;
        }
        pl.setVertexCount(points.length / 3);
        pl.setFaceVertexCount(3 * (triangles.length / 3));
        var normals:FloatParameter = pl.getVectorArray("normals");
        if (normals != null){
            this.normals = normals;
        }
        var uvs:FloatParameter = pl.getTexCoordArray("uvs");
        if (uvs != null) {
            this.uvs = uvs;
        }
        var faceShaders:Int32Array = pl.getIntArray("faceshaders");
        if (faceShaders != null && faceShaders.length == triangles.length / 3) {
            this.faceShaders = new byte[faceShaders.length];
            for (var i:int = 0; i < faceShaders.length; i++) {
                var v:int = faceShaders[i];
                if (v > 255) {
                    console.warn("Shader index too large on triangle "+ i);
                }
                this.faceShaders[i] = (v & 0xFF);
            }
        }
        if (updatedTopology) {
            // create triangle acceleration structure
            this.init();
        }
        return true;
    }

    public getPrimitiveBound(primID:int, i:int):float {
        var tri:int = 3 * primID;
        var a:int = 3 * triangles[tri + 0];
        var b:int = 3 * triangles[tri + 1];
        var c:int = 3 * triangles[tri + 2];
        var axis:int = i >>> 1;
        if ((i & 1) == 0) {
            return Math.min(points[a + axis], points[b + axis], points[c + axis]);
        }
        else {
            return Math.max(points[a + axis], points[b + axis], points[c + axis]);
        }
    }

public getWorldBounds(o2w:Matrix4):BoundingBox {
    var bounds:BoundingBox = new BoundingBox();
    if (o2w == null) {
        for (var i:int = 0; i < points.length; i += 3)
        bounds.include(points[i], points[i + 1], points[i + 2]);
    } else {
        // transform vertices first
        for (var i = 0; i < points.length; i += 3) {
            var x:float = points[i];
            var y:float = points[i + 1];
            var z:float = points[i + 2];
            var wx:float = o2w.transformPX(x, y, z);
            var wy:float = o2w.transformPY(x, y, z);
            var wz:float = o2w.transformPZ(x, y, z);
            bounds.include(wx, wy, wz);
        }
    }
    return bounds;
}

public intersectPrimitiveRobust(r:Ray, primID:int, state:IntersectionState):void {
    // ray-triangle intersection here
    var tri:int = 3 * primID;
    var a:int = 3 * triangles[tri + 0];
    var b:int = 3 * triangles[tri + 1];
    var c:int = 3 * triangles[tri + 2];
    var stack:Float32Array = state.getRobustStack();
    for (var i:int = 0, i3 = 0; i < 3; i++, i3 += 3) {
        stack[i3 + 0] = points[a + i];
        stack[i3 + 1] = points[b + i];
        stack[i3 + 2] = points[c + i];
    }
    stack[9] = Float.POSITIVE_INFINITY;
    var stackpos:int = 0;
    var orgX:float = r.ox;
    var dirX:float = r.dx, invDirX = 1 / dirX;
    var orgY:float = r.oy;
    var dirY:float = r.dy, invDirY = 1 / dirY;
    var orgZ:float = r.oz;
    var dirZ:float = r.dz, invDirZ = 1 / dirZ;
    var t1:float;
    var t2:float;
    var minx:float, maxx;
    var miny:float, maxy;
    var minz:float, maxz;
    var mint:float = r.getMin();
    var maxt:float = r.getMax();
    while (stackpos >= 0) {
        var intervalMin:float = mint;
        var intervalMax:float = maxt;
        var p0x:float = stack[stackpos + 0];
        var p1x:float = stack[stackpos + 1];
        var p2x:float = stack[stackpos + 2];
        t1 = ((minx = Math.min(p0x, p1x, p2x)) - orgX) * invDirX;
        t2 = ((maxx = Math.max(p0x, p1x, p2x)) - orgX) * invDirX;
        if (invDirX > 0) {
            if (t1 > intervalMin)
                intervalMin = t1;
            if (t2 < intervalMax)
                intervalMax = t2;
        } else {
            if (t2 > intervalMin)
                intervalMin = t2;
            if (t1 < intervalMax)
                intervalMax = t1;
        }
        if (intervalMin > intervalMax) {
            stackpos -= 10;
            continue;
        }
        var p0y:float = stack[stackpos + 3];
        var p1y:float = stack[stackpos + 4];
        var p2y:float = stack[stackpos + 5];
        t1 = ((miny = Math.min(p0y, p1y, p2y)) - orgY) * invDirY;
        t2 = ((maxy = Math.max(p0y, p1y, p2y)) - orgY) * invDirY;
        if (invDirY > 0) {
            if (t1 > intervalMin)
                intervalMin = t1;
            if (t2 < intervalMax)
                intervalMax = t2;
        } else {
            if (t2 > intervalMin)
                intervalMin = t2;
            if (t1 < intervalMax)
                intervalMax = t1;
        }
        if (intervalMin > intervalMax) {
            stackpos -= 10;
            continue;
        }
        var p0z:float = stack[stackpos + 6];
        var p1z:float = stack[stackpos + 7];
        var p2z:float = stack[stackpos + 8];
        t1 = ((minz = Math.min(p0z, p1z, p2z)) - orgZ) * invDirZ;
        t2 = ((maxz = Math.max(p0z, p1z, p2z)) - orgZ) * invDirZ;
        if (invDirZ > 0) {
            if (t1 > intervalMin)
                intervalMin = t1;
            if (t2 < intervalMax)
                intervalMax = t2;
        } else {
            if (t2 > intervalMin)
                intervalMin = t2;
            if (t1 < intervalMax)
                intervalMax = t1;
        }
        if (intervalMin > intervalMax) {
            stackpos -= 10;
            continue;
        }
        // intersection was found - keep going
        var size:float = (maxx - minx) + (maxy - miny) + (maxz - minz);
        if (Float.floatToRawIntBits(stack[stackpos + 9]) == Float.floatToRawIntBits(size)) {
            // L1 norm is 0, we are done
            r.setMax(intervalMin);
            triaccel[primID].intersectBox(r, p0x, p0y, p0z, primID, state);
            return; // safe to return, only one intersection per primitive
        }
        // not small enough yet - subdivide
        var p01x:float = (p0x + p1x) * 0.5;
        var p01y:float = (p0y + p1y) * 0.5;
        var p01z:float = (p0z + p1z) * 0.5;

        var p12x:float = (p1x + p2x) * 0.5;
        var p12y:float = (p1y + p2y) * 0.5;
        var p12z:float = (p1z + p2z) * 0.5;

        var p20x:float = (p2x + p0x) * 0.5;
        var p20y:float = (p2y + p0y) * 0.5;
        var p20z:float = (p2z + p0z) * 0.5;

        // triangle 0
        stack[stackpos + 0] = p0x;
        stack[stackpos + 1] = p01x;
        stack[stackpos + 2] = p20x;
        stack[stackpos + 3] = p0y;
        stack[stackpos + 4] = p01y;
        stack[stackpos + 5] = p20y;
        stack[stackpos + 6] = p0z;
        stack[stackpos + 7] = p01z;
        stack[stackpos + 8] = p20z;
        stack[stackpos + 9] = size;
        stackpos += 10;
        // triangle 1
        stack[stackpos + 0] = p1x;
        stack[stackpos + 1] = p12x;
        stack[stackpos + 2] = p01x;
        stack[stackpos + 3] = p1y;
        stack[stackpos + 4] = p12y;
        stack[stackpos + 5] = p01y;
        stack[stackpos + 6] = p1z;
        stack[stackpos + 7] = p12z;
        stack[stackpos + 8] = p01z;
        stack[stackpos + 9] = size;
        stackpos += 10;
        // triangle 2
        stack[stackpos + 0] = p2x;
        stack[stackpos + 1] = p20x;
        stack[stackpos + 2] = p12x;
        stack[stackpos + 3] = p2y;
        stack[stackpos + 4] = p20y;
        stack[stackpos + 5] = p12y;
        stack[stackpos + 6] = p2z;
        stack[stackpos + 7] = p20z;
        stack[stackpos + 8] = p12z;
        stack[stackpos + 9] = size;
        stackpos += 10;
        // triangle 4
        stack[stackpos + 0] = p20x;
        stack[stackpos + 1] = p12x;
        stack[stackpos + 2] = p01x;
        stack[stackpos + 3] = p20y;
        stack[stackpos + 4] = p12y;
        stack[stackpos + 5] = p01y;
        stack[stackpos + 6] = p20z;
        stack[stackpos + 7] = p12z;
        stack[stackpos + 8] = p01z;
        stack[stackpos + 9] = size;
    }
}

private intersectTriangleKensler(r:Ray, primID:int, state:IntersectionState):void {
    var tri:int = 3 * primID;
    var a:int = 3 * triangles[tri + 0];
    var b:int = 3 * triangles[tri + 1];
    var c:int = 3 * triangles[tri + 2];
    var edge0x:float = points[b + 0] - points[a + 0];
    var edge0y:float = points[b + 1] - points[a + 1];
    var edge0z:float = points[b + 2] - points[a + 2];
    var edge1x:float = points[a + 0] - points[c + 0];
    var edge1y:float = points[a + 1] - points[c + 1];
    var edge1z:float = points[a + 2] - points[c + 2];
    var nx = edge0y * edge1z - edge0z * edge1y;
    var ny = edge0z * edge1x - edge0x * edge1z;
    var nz = edge0x * edge1y - edge0y * edge1x;
    var v = r.dot(nx, ny, nz);
    var iv = 1 / v;
    var edge2x = points[a + 0] - r.ox;
    var edge2y = points[a + 1] - r.oy;
    var edge2z = points[a + 2] - r.oz;
    var va = nx * edge2x + ny * edge2y + nz * edge2z;
    var t = iv * va;
    if (!r.isInside(t))
        return;
    var ix:float = edge2y * r.dz - edge2z * r.dy;
    var iy:float = edge2z * r.dx - edge2x * r.dz;
    var iz:float = edge2x * r.dy - edge2y * r.dx;
    var v1:float = ix * edge1x + iy * edge1y + iz * edge1z;
    var beta:float = iv * v1;
    if (beta < 0)
        return;
    var v2:float = ix * edge0x + iy * edge0y + iz * edge0z;
    if ((v1 + v2) * v > v * v)
        return;
    var gamma:float = iv * v2;
    if (gamma < 0)
        return;
    r.setMax(t);
    state.setIntersection(primID, beta, gamma);
}

public intersectPrimitive(r:Ray, primID:int, state:IntersectionState):void {
    // alternative test -- disabled for now
    // intersectPrimitiveRobust(r, primID, state);

    if (this.triaccel != null) {
        // optional fast intersection method
        this.triaccel[primID].intersect(r, primID, state);
        return;
    }
    this.intersectTriangleKensler(r, primID, state);
}

public getNumPrimitives():int {
    return this.triangles.length / 3;
}

public prepareShadingState(state:ShadingState):void {
    state.init();
    var parent:Instance = state.getInstance();
    var primID:int = state.getPrimitiveID();
    var u:float = state.getU();
    var v:float = state.getV();
    var w:float = 1 - u - v;
    state.getRay().getPoint(state.getPoint());
    var tri:int = 3 * primID;
    var index0:int = this.triangles[tri + 0];
    var index1:int = this.triangles[tri + 1];
    var index2:int = this.triangles[tri + 2];
    var v0p:Point3 = this.getPoint(index0);
    var v1p:Point3 = this.getPoint(index1);
    var v2p:Point3 = this.getPoint(index2);
    var ng:Vector3 = Point3.normal(v0p, v1p, v2p);
    ng = parent.transformNormalObjectToWorld(ng);
    ng.normalize();
    state.getGeoNormal().set(ng);
    switch (normals.interp) {
        case InterpolationType.NONE:
        case InterpolationType.FACE: {
            state.getNormal().set(ng);
            break;
        }
        case InterpolationType.VERTEX: {
            var i30:int = 3 * index0;
            var i31:int = 3 * index1;
            var i32:int = 3 * index2;
            var normals:Float32Array = this.normals.data;
            state.getNormal().x = w * normals[i30 + 0] + u * normals[i31 + 0] + v * normals[i32 + 0];
            state.getNormal().y = w * normals[i30 + 1] + u * normals[i31 + 1] + v * normals[i32 + 1];
            state.getNormal().z = w * normals[i30 + 2] + u * normals[i31 + 2] + v * normals[i32 + 2];
            state.getNormal().set(parent.transformNormalObjectToWorld(state.getNormal()));
            state.getNormal().normalize();
            break;
        }
        case InterpolationType.FACEVARYING: {
            var idx:int = 3 * tri;
            var normals:Float32Array = this.normals.data;
            state.getNormal().x = w * normals[idx + 0] + u * normals[idx + 3] + v * normals[idx + 6];
            state.getNormal().y = w * normals[idx + 1] + u * normals[idx + 4] + v * normals[idx + 7];
            state.getNormal().z = w * normals[idx + 2] + u * normals[idx + 5] + v * normals[idx + 8];
            state.getNormal().set(parent.transformNormalObjectToWorld(state.getNormal()));
            state.getNormal().normalize();
            break;
        }
    }
    var uv00:float = 0, uv01:float = 0, uv10:float = 0, uv11:float = 0, uv20:float = 0, uv21:float = 0;
    switch (uvs.interp) {
        case InterpolationType.NONE:
        case FACE: {
            state.getUV().x = 0;
            state.getUV().y = 0;
            break;
        }
        case InterpolationType.VERTEX: {
            var i20:int = 2 * index0;
            var i21:int = 2 * index1;
            var i22:int = 2 * index2;
            var uvs:Float32Array = this.uvs.data;
            uv00 = uvs[i20 + 0];
            uv01 = uvs[i20 + 1];
            uv10 = uvs[i21 + 0];
            uv11 = uvs[i21 + 1];
            uv20 = uvs[i22 + 0];
            uv21 = uvs[i22 + 1];
            break;
        }
        case InterpolationType.FACEVARYING: {
            var idx:int = tri << 1;
            var uvs:Float32Array = this.uvs.data;
            uv00 = uvs[idx + 0];
            uv01 = uvs[idx + 1];
            uv10 = uvs[idx + 2];
            uv11 = uvs[idx + 3];
            uv20 = uvs[idx + 4];
            uv21 = uvs[idx + 5];
            break;
        }
    }
    if (uvs.interp != InterpolationType.NONE) {
        // get exact uv coords and compute tangent vectors
        state.getUV().x = w * uv00 + u * uv10 + v * uv20;
        state.getUV().y = w * uv01 + u * uv11 + v * uv21;
        var du1:float = uv00 - uv20;
        var du2:float = uv10 - uv20;
        var dv1:float = uv01 - uv21;
        var dv2:float = uv11 - uv21;
        var dp1:Vector3 = Point3.sub(v0p, v2p, new Vector3()), dp2 = Point3.sub(v1p, v2p, new Vector3());
        var determinant:float = du1 * dv2 - dv1 * du2;
        if (determinant == 0.0) {
            // create basis in world space
            state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
        } else {
            var invdet:float = 1.0 / determinant;
            // Vector3 dpdu = new Vector3();
            // dpdu.x = (dv2 * dp1.x - dv1 * dp2.x) * invdet;
            // dpdu.y = (dv2 * dp1.y - dv1 * dp2.y) * invdet;
            // dpdu.z = (dv2 * dp1.z - dv1 * dp2.z) * invdet;
            var dpdv:Vector3 = new Vector3();
            dpdv.x = (-du2 * dp1.x + du1 * dp2.x) * invdet;
            dpdv.y = (-du2 * dp1.y + du1 * dp2.y) * invdet;
            dpdv.z = (-du2 * dp1.z + du1 * dp2.z) * invdet;
            dpdv = parent.transformVectorObjectToWorld(dpdv);
            // create basis in world space
            state.setBasis(OrthoNormalBasis.makeFromWV(state.getNormal(), dpdv));
        }
    } else
        state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
    var shaderIndex:int = faceShaders == null ? 0 : (faceShaders[primID] & 0xFF);
    state.setShader(parent.getShader(shaderIndex));
    state.setModifier(parent.getModifier(shaderIndex));
}

public init():void {
    this.triaccel = null;
    var nt:int = this.getNumPrimitives();
    if (!this.smallTriangles) {
        // too many triangles? -- don't generate triaccel to save memory
        if (nt > 2000000) {
            console.warn("TRI - Too many triangles -- triaccel generation skipped");
            return;
        }
        this.triaccel = new WaldTriangle[nt];
        for (var i:int = 0; i < nt; i++) {
            this.triaccel[i] = new WaldTriangle(this, i);
        }
    }
}

protected getPoint(i:int):Point3 {
    i *= 3;
    return new Point3(this.points[i], this.points[i + 1], this.points[i + 2]);
}

public getTrianglePoint(tri:int, i:int, p:Point3):void {
    var index:int = 3 * this.triangles[3 * tri + i];
    p.set(this.points[index], this.points[index + 1], this.points[index + 2]);
}

public getBakingPrimitives():PrimitiveList {
    switch (uvs.interp) {
        case InterpolationType.NONE:
        case InterpolationType.FACE:
            console.log("Cannot generate baking surface without texture coordinate data");
            return null;
        default:
            return new BakingSurface();
    }
}
}