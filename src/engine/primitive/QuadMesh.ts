/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class QuadMesh implements PrimitiveList {

    protected points:number[];

    protected quads:number[];

    private normals:FloatParameter;

    private uvs:FloatParameter;

    private faceShaders:number[];

    constructor () {
        this.quads = null;
        this.points = null;
        this.uvs = new FloatParameter();
        this.normals = new FloatParameter();
        this.faceShaders = null;
    }

    writeObj(filename:string) {
        try {
            let file:FileWriter = new FileWriter(filename);
            file.write(String.format("o object
            "));
            for (let i:number = 0; (i < this.points.length); i += 3) {
                file.write(String.format("v %g %g %g
                ", this.points[i], this.points[(i + 1)], this.points[(i + 2)]));
            }

            file.write("s off
            ");
            for (let i:number = 0; (i < this.quads.length); i += 4) {
                file.write(String.format("f %d %d %d %d
                ", (this.quads[i] + 1), (this.quads[(i + 1)] + 1), (this.quads[(i + 2)] + 1), (this.quads[(i + 3)] + 1)));
            }

            file.close();
        }
        catch (e /*:IOException*/) {
            e.printStackTrace();
        }

    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        let quads:number[] = pl.getIntArray("quads");
        if ((this.quads != null)) {
            this.quads = this.quads;
        }

        if ((this.quads == null)) {
            console.error(Module.GEOM, "Unable to update mesh - quad indices are missing");
            return false;
        }

        if (((this.quads.length % 4)
            != 0)) {
            console.warn(Module.GEOM, "Quad index data is not a multiple of 4 - some quads may be missing");
        }

        pl.setFaceCount((this.quads.length / 4));
        let pointsP:FloatParameter = pl.getPointArray("points");
        if ((pointsP != null)) {
            if ((pointsP.interp != InterpolationType.VERTEX)) {
                console.error(Module.GEOM, "Point interpolation type must be set to \""vertex\"" - was \""%s\"""", pointsP.interp.name().toLowerCase())", else, {, points=pointsP.data);
            }

        }

    }
}
pl.setVertexCount((points.length / 3));
pl.setFaceVertexCount((4
* (quads.length / 4)));
let normals:FloatParameter = pl.getVectorArray("normals");
if ((normals != null)) {
    this.normals = normals;
}

let uvs:FloatParameter = pl.getTexCoordArray("uvs");
if ((uvs != null)) {
    this.uvs = uvs;
}

let faceShaders:number[] = pl.getIntArray("faceshaders");
if (((faceShaders != null)
    && (faceShaders.length
    == (quads.length / 4)))) {
    this.faceShaders = new Array(faceShaders.length);
    for (let i:number = 0; (i < faceShaders.length); i++) {
        let v:number = faceShaders[i];
        if ((v > 255)) {
            console.warn(Module.GEOM, "Shader index too large on quad %d", i);
        }

        this.faceShaders[i] = (<number>((v & 255)));
    }

}

return true;
UnknownUnknown

getPrimitiveBound(primID:number, i:number):number {
    let quad:number = (4 * primID);
    let a:number = (3 * quads[(quad + 0)]);
    let b:number = (3 * quads[(quad + 1)]);
    let c:number = (3 * quads[(quad + 2)]);
    let d:number = (3 * quads[(quad + 3)]);
    let axis:number;
    1;
    if (((i & 1)
        == 0)) {
        return MathUtils.min(points[(a + axis)], points[(b + axis)], points[(c + axis)], points[(d + axis)]);
    }
    else {
        return MathUtils.max(points[(a + axis)], points[(b + axis)], points[(c + axis)], points[(d + axis)]);
    }

}

getWorldBounds(o2w:Matrix4):BoundingBox {
    let bounds:BoundingBox = new BoundingBox();
    if ((o2w == null)) {
        for (let i:number = 0; (i < points.length); i += 3) {
            bounds.include(points[i], points[(i + 1)], points[(i + 2)]);
        }

    }
    else {
        //  transform vertices first
        for (let i:number = 0; (i < points.length); i += 3) {
            let x:number = points[i];
            let y:number = points[(i + 1)];
            let z:number = points[(i + 2)];
            let wx:number = o2w.transformPX(x, y, z);
            let wy:number = o2w.transformPY(x, y, z);
            let wz:number = o2w.transformPZ(x, y, z);
            bounds.include(wx, wy, wz);
        }

    }

    return bounds;
}

intersectPrimitive(r:Ray, primID:number, state:IntersectionState) {
    //  ray/bilinear patch intersection adapted from "Production Rendering:
    //  Design and Implementation" by Ian Stephenson (Ed.)
    let quad:number = (4 * primID);
    let p0:number = (3 * quads[(quad + 0)]);
    let p1:number = (3 * quads[(quad + 1)]);
    let p2:number = (3 * quads[(quad + 2)]);
    let p3:number = (3 * quads[(quad + 3)]);
    //  transform patch into Hilbert space
    let A:number[] = [
        ((points[(p2 + 0)]
        - (points[(p3 + 0)] - points[(p1 + 0)]))
        + points[(p0 + 0)]),
        ((points[(p2 + 1)]
        - (points[(p3 + 1)] - points[(p1 + 1)]))
        + points[(p0 + 1)]),
        ((points[(p2 + 2)]
        - (points[(p3 + 2)] - points[(p1 + 2)]))
        + points[(p0 + 2)])];
    let B:number[] = [
        (points[(p1 + 0)] - points[(p0 + 0)]),
        (points[(p1 + 1)] - points[(p0 + 1)]),
        (points[(p1 + 2)] - points[(p0 + 2)])];
    let C:number[] = [
        (points[(p3 + 0)] - points[(p0 + 0)]),
        (points[(p3 + 1)] - points[(p0 + 1)]),
        (points[(p3 + 2)] - points[(p0 + 2)])];
    let R:number[] = [
        (r.ox - points[(p0 + 0)]),
        (r.oy - points[(p0 + 1)]),
        (r.oz - points[(p0 + 2)])];
    let Q:number[] = [
        r.dx,
        r.dy,
        r.dz];
    //  pick major direction
    let absqx:number = Math.abs(r.dx);
    let absqy:number = Math.abs(r.dy);
    let absqz:number = Math.abs(r.dz);
    let Z:number = 2;
    let X:number = 0;
    let Y:number = 1;
    if (((absqx > absqy)
        && (absqx > absqz))) {
        //  X = 0, Y = 1, Z = 2
    }
    else if ((absqy > absqz)) {
        //  X = 1, Y = 0, Z = 2
        X = 1;
        Y = 0;
    }
    else {
        //  X = 2, Y = 1, Z = 0
        X = 2;
        Z = 0;
    }

    let Cxz:number = ((C[X] * Q[Z])
    - (C[Z] * Q[X]));
    let Cyx:number = ((C[Y] * Q[X])
    - (C[X] * Q[Y]));
    let Czy:number = ((C[Z] * Q[Y])
    - (C[Y] * Q[Z]));
    let Rxz:number = ((R[X] * Q[Z])
    - (R[Z] * Q[X]));
    let Ryx:number = ((R[Y] * Q[X])
    - (R[X] * Q[Y]));
    let Rzy:number = ((R[Z] * Q[Y])
    - (R[Y] * Q[Z]));
    let Bxy:number = ((B[X] * Q[Y])
    - (B[Y] * Q[X]));
    let Byz:number = ((B[Y] * Q[Z])
    - (B[Z] * Q[Y]));
    let Bzx:number = ((B[Z] * Q[X])
    - (B[X] * Q[Z]));
    let a:number = ((A[X] * Byz)
    + ((A[Y] * Bzx)
    + (A[Z] * Bxy)));
    if ((a == 0)) {
        //  setup for linear equation
        let b:number = ((B[X] * Czy)
        + ((B[Y] * Cxz)
        + (B[Z] * Cyx)));
        let c:number = ((C[X] * Rzy)
        + ((C[Y] * Rxz)
        + (C[Z] * Ryx)));
        let u:number = ((c / b)
        * -1);
        if (((u >= 0)
            && (u <= 1))) {
            let v:number = (((u * Bxy)
            + Ryx)
            / Cyx);
            if (((v >= 0)
                && (v <= 1))) {
                let t:number = (((B[X] * u)
                + ((C[X] * v)
                - R[X]))
                / Q[X]);
                if (r.isInside(t)) {
                    r.setMax(t);
                    state.setIntersection(primID, u, v);
                }

            }

        }

    }
    else {
        //  setup for quadratic equation
        let b:number = ((A[X] * Rzy)
        + ((A[Y] * Rxz)
        + ((A[Z] * Ryx)
        + ((B[X] * Czy)
        + ((B[Y] * Cxz)
        + (B[Z] * Cyx))))));
        let c:number = ((C[X] * Rzy)
        + ((C[Y] * Rxz)
        + (C[Z] * Ryx)));
        let discrim:number = ((b * b) - (4
        * (a * c)));
        //  reject trivial cases
        if ((((c
            * (a
            + (b + c)))
            > 0)
            && ((discrim < 0)
            || (((a * c)
            < 0)
            || (((b / a)
            > 0)
            || ((b / a)
            < -2)))))) {
            return;
        }

        //  solve quadratic
        let q:number = (b > 0);
        // TODO:Warning!!!, inline IF is not supported ?
        //  check first solution
        let Axy:number = ((A[X] * Q[Y])
        - (A[Y] * Q[X]));
        let u:number = (q / a);
        if (((u >= 0)
            && (u <= 1))) {
            let d:number = ((u * Axy)
            - Cyx);
            let v:number = ((((u * Bxy)
            + Ryx)
            / d)
            * -1);
            if (((v >= 0)
                && (v <= 1))) {
                let t:number = (((A[X]
                * (u * v))
                + ((B[X] * u)
                + ((C[X] * v)
                - R[X])))
                / Q[X]);
                if (r.isInside(t)) {
                    r.setMax(t);
                    state.setIntersection(primID, u, v);
                }

            }

        }

        u = (c / q);
        if (((u >= 0)
            && (u <= 1))) {
            let d:number = ((u * Axy)
            - Cyx);
            let v:number = ((((u * Bxy)
            + Ryx)
            / d)
            * -1);
            if (((v >= 0)
                && (v <= 1))) {
                let t:number = (((A[X]
                * (u * v))
                + ((B[X] * u)
                + ((C[X] * v)
                - R[X])))
                / Q[X]);
                if (r.isInside(t)) {
                    r.setMax(t);
                    state.setIntersection(primID, u, v);
                }

            }

        }

    }

}

getNumPrimitives():number {
    return (quads.length / 4);
}

prepareShadingState(state:ShadingState) {
    state.init();
    let parent:Instance = state.getInstance();
    let primID:number = state.getPrimitiveID();
    let u:number = state.getU();
    let v:number = state.getV();
    state.getRay().getPoint(state.getPoint());
    let quad:number = (4 * primID);
    let index0:number = quads[(quad + 0)];
    let index1:number = quads[(quad + 1)];
    let index2:number = quads[(quad + 2)];
    let index3:number = quads[(quad + 3)];
    let v0p:Point3 = getPoint(index0);
    let v1p:Point3 = getPoint(index1);
    let v2p:Point3 = getPoint(index2);
    let v3p:Point3 = getPoint(index2);
    let tanux:number = (((1 - v)
    * (v1p.x - v0p.x))
    + (v
    * (v2p.x - v3p.x)));
    let tanuy:number = (((1 - v)
    * (v1p.y - v0p.y))
    + (v
    * (v2p.y - v3p.y)));
    let tanuz:number = (((1 - v)
    * (v1p.z - v0p.z))
    + (v
    * (v2p.z - v3p.z)));
    let tanvx:number = (((1 - u)
    * (v3p.x - v0p.x))
    + (u
    * (v2p.x - v1p.x)));
    let tanvy:number = (((1 - u)
    * (v3p.y - v0p.y))
    + (u
    * (v2p.y - v1p.y)));
    let tanvz:number = (((1 - u)
    * (v3p.z - v0p.z))
    + (u
    * (v2p.z - v1p.z)));
    let nx:number = ((tanuy * tanvz)
    - (tanuz * tanvy));
    let ny:number = ((tanuz * tanvx)
    - (tanux * tanvz));
    let nz:number = ((tanux * tanvy)
    - (tanuy * tanvx));
    let ng:Vector3 = new Vector3(nx, ny, nz);
    ng = parent.transformNormalObjectToWorld(ng);
    ng.normalize();
    state.getGeoNormal().set(ng);
    let k00:number = ((1 - u) * (1 - v));
    let k10:number = (u * (1 - v));
    let k01:number = ((1 - u)
    * v);
    let k11:number = (u * v);
    switch (normals.interp) {
        case NONE:
        case FACE:
            state.getNormal().set(ng);
            break;
            break;
        case VERTEX:
            let i30:number = (3 * index0);
            let i31:number = (3 * index1);
            let i32:number = (3 * index2);
            let i33:number = (3 * index3);
            let normals:number[] = this.normals.data;
            state.getNormal().x = ((k00 * normals[(i30 + 0)])
            + ((k10 * normals[(i31 + 0)])
            + ((k11 * normals[(i32 + 0)])
            + (k01 * normals[(i33 + 0)]))));
            state.getNormal().y = ((k00 * normals[(i30 + 1)])
            + ((k10 * normals[(i31 + 1)])
            + ((k11 * normals[(i32 + 1)])
            + (k01 * normals[(i33 + 1)]))));
            state.getNormal().z = ((k00 * normals[(i30 + 2)])
            + ((k10 * normals[(i31 + 2)])
            + ((k11 * normals[(i32 + 2)])
            + (k01 * normals[(i33 + 2)]))));
            state.getNormal().set(parent.transformNormalObjectToWorld(state.getNormal()));
            state.getNormal().normalize();
            break;
            break;
        case FACEVARYING:
            let idx:number = (3 * quad);
            let normals:number[] = this.normals.data;
            state.getNormal().x = ((k00 * normals[(idx + 0)])
            + ((k10 * normals[(idx + 3)])
            + ((k11 * normals[(idx + 6)])
            + (k01 * normals[(idx + 9)]))));
            state.getNormal().y = ((k00 * normals[(idx + 1)])
            + ((k10 * normals[(idx + 4)])
            + ((k11 * normals[(idx + 7)])
            + (k01 * normals[(idx + 10)]))));
            state.getNormal().z = ((k00 * normals[(idx + 2)])
            + ((k10 * normals[(idx + 5)])
            + ((k11 * normals[(idx + 8)])
            + (k01 * normals[(idx + 11)]))));
            state.getNormal().set(parent.transformNormalObjectToWorld(state.getNormal()));
            state.getNormal().normalize();
            break;
            break;
    }

    let uv31:number = 0;
    let uv00:number = 0;
    let uv01:number = 0;
    let uv10:number = 0;
    let uv11:number = 0;
    let uv20:number = 0;
    let uv21:number = 0;
    let uv30:number = 0;
    switch (uvs.interp) {
        case NONE:
        case FACE:
            state.getUV().x = 0;
            state.getUV().y = 0;
            break;
            break;
        case VERTEX:
            let i20:number = (2 * index0);
            let i21:number = (2 * index1);
            let i22:number = (2 * index2);
            let i23:number = (2 * index3);
            let uvs:number[] = this.uvs.data;
            uv00 = uvs[(i20 + 0)];
            uv01 = uvs[(i20 + 1)];
            uv10 = uvs[(i21 + 0)];
            uv11 = uvs[(i21 + 1)];
            uv20 = uvs[(i22 + 0)];
            uv21 = uvs[(i22 + 1)];
            uv20 = uvs[(i23 + 0)];
            uv21 = uvs[(i23 + 1)];
            break;
            break;
        case FACEVARYING:
            let idx:number = (quad + 1);
            let uvs:number[] = this.uvs.data;
            uv00 = uvs[(idx + 0)];
            uv01 = uvs[(idx + 1)];
            uv10 = uvs[(idx + 2)];
            uv11 = uvs[(idx + 3)];
            uv20 = uvs[(idx + 4)];
            uv21 = uvs[(idx + 5)];
            uv30 = uvs[(idx + 6)];
            uv31 = uvs[(idx + 7)];
            break;
            break;
    }

    if ((uvs.interp != InterpolationType.NONE)) {
        //  get exact uv coords and compute tangent vectors
        state.getUV().x = ((k00 * uv00)
        + ((k10 * uv10)
        + ((k11 * uv20)
        + (k01 * uv30))));
        state.getUV().y = ((k00 * uv01)
        + ((k10 * uv11)
        + ((k11 * uv21)
        + (k01 * uv31))));
        let du1:number = (uv00 - uv20);
        let du2:number = (uv10 - uv20);
        let dv1:number = (uv01 - uv21);
        let dv2:number = (uv11 - uv21);
        let dp2:Vector3 = Point3.sub(v1p, v2p, new Vector3());
        let dp1:Vector3 = Point3.sub(v0p, v2p, new Vector3());
        let determinant:number = ((du1 * dv2)
        - (dv1 * du2));
        if ((determinant == 0)) {
            //  create basis in world space
            state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
        }
        else {
            let invdet:number = (1.f / determinant);
            //  Vector3 dpdu = new Vector3();
            //  dpdu.x = (dv2 * dp1.x - dv1 * dp2.x) * invdet;
            //  dpdu.y = (dv2 * dp1.y - dv1 * dp2.y) * invdet;
            //  dpdu.z = (dv2 * dp1.z - dv1 * dp2.z) * invdet;
            let dpdv:Vector3 = new Vector3();
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

    let shaderIndex:number = (faceShaders == null);
    // TODO:Warning!!!, inline IF is not supported ?
    state.setShader(parent.getShader(shaderIndex));
    state.setModifier(parent.getModifier(shaderIndex));
}

protected getPoint(i:number):Point3 {
    i = (i * 3);
    return new Point3(points[i], points[(i + 1)], points[(i + 2)]);
}

getBakingPrimitives():PrimitiveList {
    return null;
}