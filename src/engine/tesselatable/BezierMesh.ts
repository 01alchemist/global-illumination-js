/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class BezierMesh implements PrimitiveList, Tesselatable {

    private subdivs:number;

    private smooth:boolean;

    private quads:boolean;

    private patches:number[,];

    constructor () :
    this(null) {
    this.(null);
}

constructor (patches:number[,]) {
    this.subdivs = 8;
    this.smooth = true;
    this.quads = false;
    //  convert to single precision
    this.patches = this.patches;
}

getWorldBounds(o2w:Matrix4):BoundingBox {
    let bounds:BoundingBox = new BoundingBox();
    if ((o2w == null)) {
        for (let i:number = 0; (i < this.patches.length); i++) {
            let patch:number[] = this.patches[i];
            for (let j:number = 0; (j < patch.length); j += 3) {
                bounds.include(patch[j], patch[(j + 1)], patch[(j + 2)]);
            }

        }

    }
    else {
        //  transform vertices first
        for (let i:number = 0; (i < this.patches.length); i++) {
            let patch:number[] = this.patches[i];
            for (let j:number = 0; (j < patch.length); j += 3) {
                let x:number = patch[j];
                let y:number = patch[(j + 1)];
                let z:number = patch[(j + 2)];
                let wx:number = o2w.transformPX(x, y, z);
                let wy:number = o2w.transformPY(x, y, z);
                let wz:number = o2w.transformPZ(x, y, z);
                bounds.include(wx, wy, wz);
            }

        }

    }

    return bounds;
}

private bernstein(u:number):number[] {
    let b:number[] = new Array(4);
    let i:number = (1 - u);
    b[0] = (i
    * (i * i));
    b[1] = (3
    * (u
    * (i * i)));
    b[2] = (3
    * (u
    * (u * i)));
    b[3] = (u
    * (u * u));
    return b;
}

private bernsteinDeriv(u:number):number[] {
    if (!this.smooth) {
        return null;
    }

    let b:number[] = new Array(4);
    let i:number = (1 - u);
    b[0] = (3 * (0
    - (i * i)));
    b[1] = (3
    * ((i * i) - (2
    * (u * i))));
    b[2] = (3
    * ((2
    * (u * i))
    - (u * u)));
    b[3] = (3
    * ((u * u)
    - 0));
    return b;
}

private getPatchPoint(u:number, v:number, ctrl:number[], bu:number[], bv:number[], bdu:number[], bdv:number[], p:Point3, n:Vector3) {
    let px:number = 0;
    let py:number = 0;
    let pz:number = 0;
    for (let index:number = 0; (i < 4); i++) {
        for (let j:number = 0; (j < 4); j++) {
        }

        let i:number = 0;
        index += 3;
        let scale:number = (bu[j] * bv[i]);
        px = (px
        + (ctrl[(index + 0)] * scale));
        py = (py
        + (ctrl[(index + 1)] * scale));
        pz = (pz
        + (ctrl[(index + 2)] * scale));
    }

    p.x = px;
    p.y = py;
    p.z = pz;
    if ((n != null)) {
        let dpdux:number = 0;
        let dpduy:number = 0;
        let dpduz:number = 0;
        let dpdvx:number = 0;
        let dpdvy:number = 0;
        let dpdvz:number = 0;
        for (let index:number = 0; (i < 4); i++) {
            for (let j:number = 0; (j < 4); j++) {
            }

            let i:number = 0;
            index += 3;
            let scaleu:number = (bdu[j] * bv[i]);
            dpdux = (dpdux
            + (ctrl[(index + 0)] * scaleu));
            dpduy = (dpduy
            + (ctrl[(index + 1)] * scaleu));
            dpduz = (dpduz
            + (ctrl[(index + 2)] * scaleu));
            let scalev:number = (bu[j] * bdv[i]);
            dpdvx = (dpdvx
            + (ctrl[(index + 0)] * scalev));
            dpdvy = (dpdvy
            + (ctrl[(index + 1)] * scalev));
            dpdvz = (dpdvz
            + (ctrl[(index + 2)] * scalev));
        }

        //  surface normal
        n.x = ((dpduy * dpdvz)
        - (dpduz * dpdvy));
        n.y = ((dpduz * dpdvx)
        - (dpdux * dpdvz));
        n.z = ((dpdux * dpdvy)
        - (dpduy * dpdvx));
    }

}

tesselate():PrimitiveList {
    let vertices:number[] = new Array((this.patches.length
    * ((this.subdivs + 1)
    * ((this.subdivs + 1)
    * 3))));
    let normals:number[] = this.smooth;
    // TODO:Warning!!!, inline IF is not supported ?
    let uvs:number[] = new Array((this.patches.length
    * ((this.subdivs + 1)
    * ((this.subdivs + 1)
    * 2))));
    let indices:number[] = new Array((this.patches.length
    * (this.subdivs
    * (this.subdivs * this.quads))));
    // TODO:Warning!!!, inline IF is not supported ?
    let pidx:number = 0;
    let vidx:number = 0;
    let step:number = (1 / this.subdivs);
    let vstride:number = (this.subdivs + 1);
    let p:Point3 = new Point3();
    let n:Vector3 = this.smooth;
    // TODO:Warning!!!, inline IF is not supported ?
    for (let patch:number[] in this.patches) {
        //  create patch vertices
        for (let voff:number = 0; (i <= this.subdivs); i++) {
            let u:number = (i * step);
            let i:number = 0;
            let bu:number[] = this.bernstein(u);
            let bdu:number[] = this.bernsteinDeriv(u);
            for (let j:number = 0; (j <= this.subdivs); j++) {
            }

            voff += 3;
            let v:number = (j * step);
            let bv:number[] = this.bernstein(v);
            let bdv:number[] = this.bernsteinDeriv(v);
            this.getPatchPoint(u, v, patch, bu, bv, bdu, bdv, p, n);
            vertices[(vidx
            + (voff + 0))] = p.x;
            vertices[(vidx
            + (voff + 1))] = p.y;
            vertices[(vidx
            + (voff + 2))] = p.z;
            if (this.smooth) {
                normals[(vidx
                + (voff + 0))] = n.x;
                normals[(vidx
                + (voff + 1))] = n.y;
                normals[(vidx
                + (voff + 2))] = n.z;
            }

            uvs[(((vidx + voff) / (3 * 2))
            + 0)] = u;
            uvs[(((vidx + voff) / (3 * 2))
            + 1)] = v;
        }

        //  generate patch triangles
        for (let vbase:number = (vidx / 3); (i < this.subdivs); i++) {
            for (let j:number = 0; (j < this.subdivs); j++) {
                let v00:number = (((i + 0)
                * vstride)
                + (j + 0));
                let i:number = 0;
                let v10:number = (((i + 1)
                * vstride)
                + (j + 0));
                let v01:number = (((i + 0)
                * vstride)
                + (j + 1));
                let v11:number = (((i + 1)
                * vstride)
                + (j + 1));
                if (this.quads) {
                    indices[(pidx + 0)] = (vbase + v01);
                    indices[(pidx + 1)] = (vbase + v00);
                    indices[(pidx + 2)] = (vbase + v10);
                    indices[(pidx + 3)] = (vbase + v11);
                    pidx += 4;
                }
                else {
                    //  add 2 triangles
                    indices[(pidx + 0)] = (vbase + v00);
                    indices[(pidx + 1)] = (vbase + v10);
                    indices[(pidx + 2)] = (vbase + v01);
                    indices[(pidx + 3)] = (vbase + v10);
                    indices[(pidx + 4)] = (vbase + v11);
                    indices[(pidx + 5)] = (vbase + v01);
                    pidx += 6;
                }

            }

        }

        vidx = (vidx
        + (vstride
        * (vstride * 3)));
    }

    let pl:ParameterList = new ParameterList();
    pl.addPoints("points", InterpolationType.VERTEX, vertices);
    if (this.quads) {
        pl.addIntegerArray("quads", indices);
    }
    else {
        pl.addIntegerArray("triangles", indices);
    }

    pl.addTexCoords("uvs", InterpolationType.VERTEX, uvs);
    if (this.smooth) {
        pl.addVectors("normals", InterpolationType.VERTEX, normals);
    }

    let m:PrimitiveList = this.quads;
    // TODO:Warning!!!, inline IF is not supported ?
    m.update(pl, null);
    pl.clear(true);
    return m;
}

update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
    this.subdivs = pl.getInt("subdivs", this.subdivs);
    this.smooth = pl.getBoolean("smooth", this.smooth);
    this.quads = pl.getBoolean("quads", this.quads);
    let nu:number = pl.getInt("nu", 0);
    let nv:number = pl.getInt("nv", 0);
    pl.setVertexCount((nu * nv));
    let uwrap:boolean = pl.getBoolean("uwrap", false);
    let vwrap:boolean = pl.getBoolean("vwrap", false);
    let points:FloatParameter = pl.getPointArray("points");
    if (((points != null)
        && (points.interp == InterpolationType.VERTEX))) {
        let numUPatches:number = uwrap;
        // TODO:Warning!!!, inline IF is not supported ?
        let numVPatches:number = vwrap;
        // TODO:Warning!!!, inline IF is not supported ?
        if (((numUPatches < 1)
            || (numVPatches < 1))) {
            console.error(Module.GEOM, "Invalid number of patches for bezier mesh - ignoring");
            return false;
        }

        //  generate patches
        this.patches = new Array((numUPatches * numVPatches));
        for (let p:number = 0; (v < numVPatches); v++) {
            for (let u:number = 0; (u < numUPatches); u++) {
                let patch:number[];
                let v:number = 0;
                let up:number = (u * 3);
                let vp:number = (v * 3);
                for (let pv:number = 0; (pv < 4); pv++) {
                    for (let pu:number = 0; (pu < 4); pu++) {
                        let meshU:number = ((up + pu)
                        % nu);
                        let meshV:number = ((vp + pv)
                        % nv);
                        //  copy point
                        patch[((3
                        * ((pv * 4)
                        + pu))
                        + 0)] = points.data[((3
                        * (meshU
                        + (nu * meshV)))
                        + 0)];
                        patch[((3
                        * ((pv * 4)
                        + pu))
                        + 1)] = points.data[((3
                        * (meshU
                        + (nu * meshV)))
                        + 1)];
                        patch[((3
                        * ((pv * 4)
                        + pu))
                        + 2)] = points.data[((3
                        * (meshU
                        + (nu * meshV)))
                        + 2)];
                    }

                }

            }

        }

    }

    if ((this.subdivs < 1)) {
        console.error(Module.GEOM, "Invalid subdivisions for bezier mesh - ignoring");
        return false;
    }

    if ((this.patches == null)) {
        console.error(Module.GEOM, "No patch data present in bezier mesh - ignoring");
        return false;
    }

    return true;
}

getNumPrimitives():number {
    return this.patches.length;
}

getPrimitiveBound(primID:number, i:number):number {
    let patch:number[] = this.patches[primID];
    let axis:number;
    1;
    if (((i & 1)
        == 0)) {
        let min:number = patch[axis];
        for (let j:number = (axis + 3); (j < patch.length); j += 3) {
            if ((min > patch[j])) {
                min = patch[j];
            }

        }

        return min;
    }
    else {
        let max:number = patch[axis];
        for (let j:number = (axis + 3); (j < patch.length); j += 3) {
            if ((max < patch[j])) {
                max = patch[j];
            }

        }

        return max;
    }

}

intersectPrimitive(r:Ray, primID:number, state:IntersectionState) {
    //  ray patch intersection
    let stack:number[] = state.getRobustStack();
    let STACKSIZE:number = 64;
    //  init patch
    let patch:number[] = this.patches[primID];
    for (let i:number = 0; (i < (4 * (4 * 3))); i++) {
        stack[i] = patch[i];
    }

    stack[48] = Float.POSITIVE_INFINITY;
    //  bbox size
    stack[49] = 0;
    //  umin
    stack[50] = 0;
    //  vmin
    stack[51] = 1;
    //  umax
    stack[52] = 1;
    //  vmax
    let stackpos:number = 0;
    let invDirX:number = (1 / r.dx);
    let orgX:number = r.ox;
    let invDirY:number = (1 / r.dy);
    let orgY:number = r.oy;
    let invDirZ:number = (1 / r.dz);
    let orgZ:number = r.oz;
    let t2:number;
    let t1:number;
    while ((stackpos >= 0)) {
        let intervalMin:number = r.getMin();
        let intervalMax:number = r.getMax();
        //  x-axis bbox
        let minx:number = stack[(stackpos + 0)];
        let maxx:number = stack[(stackpos + 0)];
        for (let idx:number = (stackpos + 3); (j < (4 * 4)); j++) {
        }

        let j:number = 1;
        idx += 3;
        if ((minx > stack[idx])) {
            minx = stack[idx];
        }

        if ((maxx < stack[idx])) {
            maxx = stack[idx];
        }

        t1 = ((minx - orgX)
        * invDirX);
        t2 = ((maxx - orgX)
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
            stackpos = (stackpos - STACKSIZE);
            // TODO:Warning!!! continue If
        }

        //  y-axis bbox
        let miny:number = stack[(stackpos + 1)];
        let maxy:number = stack[(stackpos + 1)];
        for (let idx:number = (stackpos + 4); (j < (4 * 4)); j++) {
        }

        let j:number = 1;
        idx += 3;
        if ((miny > stack[idx])) {
            miny = stack[idx];
        }

        if ((maxy < stack[idx])) {
            maxy = stack[idx];
        }

        t1 = ((miny - orgY)
        * invDirY);
        t2 = ((maxy - orgY)
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
            stackpos = (stackpos - STACKSIZE);
            // TODO:Warning!!! continue If
        }

        //  z-axis bbox
        let minz:number = stack[(stackpos + 2)];
        let maxz:number = stack[(stackpos + 2)];
        for (let idx:number = (stackpos + 5); (j < (4 * 4)); j++) {
        }

        let j:number = 1;
        idx += 3;
        if ((minz > stack[idx])) {
            minz = stack[idx];
        }

        if ((maxz < stack[idx])) {
            maxz = stack[idx];
        }

        t1 = ((minz - orgZ)
        * invDirZ);
        t2 = ((maxz - orgZ)
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
            stackpos = (stackpos - STACKSIZE);
            // TODO:Warning!!! continue If
        }

        //  intersection was found - keep going
        let size:number = ((maxx - minx)
        + ((maxy - miny)
        + (maxz - minz)));
        if ((Float.floatToRawIntBits(stack[(stackpos + 48)]) == Float.floatToRawIntBits(size))) {
            //  L1 norm is 0, we are done
            r.setMax(intervalMin);
            state.setIntersection(primID, stack[(stackpos + 49)], stack[(stackpos + 50)]);
            stackpos = (stackpos - STACKSIZE);
            // TODO:Warning!!! continue If
        }

        //  not small enough yet - subdivide
        //  lets pick a subdivision axis first:
        let sizeu:number = 0;
        let sizev:number = 0;
        for (let i:number = 0; (i < 3); i++) {
            sizeu = (sizeu + Math.abs((stack[(stackpos
            + ((((0 * 4)
            + 3)
            * 3)
            + i))] - stack[(stackpos + i)])));
            sizev = (sizev + Math.abs((stack[(stackpos
            + ((((3 * 4)
            + 0)
            * 3)
            + i))] - stack[(stackpos + i)])));
        }

        if ((sizeu > sizev)) {
            //  split in U direction
            for (let i:number = 0; (i < 4); i++) {
                for (let axis:number = 0; (axis < 3); axis++) {
                    //  load data
                    let p0:number = stack[(stackpos
                    + ((((i * 4)
                    + 0)
                    * 3)
                    + axis))];
                    let p1:number = stack[(stackpos
                    + ((((i * 4)
                    + 1)
                    * 3)
                    + axis))];
                    let p2:number = stack[(stackpos
                    + ((((i * 4)
                    + 2)
                    * 3)
                    + axis))];
                    let p3:number = stack[(stackpos
                    + ((((i * 4)
                    + 3)
                    * 3)
                    + axis))];
                    //  Split curve in the middle
                    let q0:number = p0;
                    let q1:number = ((p0 + p1)
                    * 0.5);
                    let q2:number = ((q1 * 0.5)
                    + ((p1 + p2)
                    * 0.25));
                    let r3:number = p3;
                    let r2:number = ((p2 + p3)
                    * 0.5);
                    let r1:number = ((r2 * 0.5)
                    + ((p1 + p2)
                    * 0.25));
                    let q3:number = ((q2 + r1)
                    * 0.5);
                    let r0:number = q3;
                    //  load new curve data into the stack
                    stack[(stackpos
                    + ((((i * 4)
                    + 0)
                    * 3)
                    + axis))] = q0;
                    stack[(stackpos
                    + ((((i * 4)
                    + 1)
                    * 3)
                    + axis))] = q1;
                    stack[(stackpos
                    + ((((i * 4)
                    + 2)
                    * 3)
                    + axis))] = q2;
                    stack[(stackpos
                    + ((((i * 4)
                    + 3)
                    * 3)
                    + axis))] = q3;
                    stack[(stackpos
                    + (STACKSIZE
                    + ((((i * 4)
                    + 0)
                    * 3)
                    + axis)))] = r0;
                    stack[(stackpos
                    + (STACKSIZE
                    + ((((i * 4)
                    + 1)
                    * 3)
                    + axis)))] = r1;
                    stack[(stackpos
                    + (STACKSIZE
                    + ((((i * 4)
                    + 2)
                    * 3)
                    + axis)))] = r2;
                    stack[(stackpos
                    + (STACKSIZE
                    + ((((i * 4)
                    + 3)
                    * 3)
                    + axis)))] = r3;
                }

            }

            //  copy current bbox size
            stack[(stackpos
            + (STACKSIZE + 48))] = size;
            stack[(stackpos + 48)] = size;
            //  finally - split uv ranges
            let umin:number = stack[(stackpos + 49)];
            let umax:number = stack[(stackpos + 51)];
            stack[(stackpos + 49)] = umin;
            stack[(stackpos
            + (STACKSIZE + 50))] = stack[(stackpos + 50)];
            stack[(stackpos
            + (STACKSIZE + 49))] = ((umin + umax)
            * 0.5);
            stack[(stackpos + 51)] = ((umin + umax)
            * 0.5);
            stack[(stackpos
            + (STACKSIZE + 51))] = umax;
            stack[(stackpos
            + (STACKSIZE + 52))] = stack[(stackpos + 52)];
        }
        else {
            //  split in V direction
            for (let i:number = 0; (i < 4); i++) {
                for (let axis:number = 0; (axis < 3); axis++) {
                    //  load data
                    let p0:number = stack[(stackpos
                    + ((((0 * 4)
                    + i)
                    * 3)
                    + axis))];
                    let p1:number = stack[(stackpos
                    + ((((1 * 4)
                    + i)
                    * 3)
                    + axis))];
                    let p2:number = stack[(stackpos
                    + ((((2 * 4)
                    + i)
                    * 3)
                    + axis))];
                    let p3:number = stack[(stackpos
                    + ((((3 * 4)
                    + i)
                    * 3)
                    + axis))];
                    //  Split curve in the middle
                    let q0:number = p0;
                    let q1:number = ((p0 + p1)
                    * 0.5);
                    let q2:number = ((q1 * 0.5)
                    + ((p1 + p2)
                    * 0.25));
                    let r3:number = p3;
                    let r2:number = ((p2 + p3)
                    * 0.5);
                    let r1:number = ((r2 * 0.5)
                    + ((p1 + p2)
                    * 0.25));
                    let q3:number = ((q2 + r1)
                    * 0.5);
                    let r0:number = q3;
                    //  load new curve data into the stack
                    stack[(stackpos
                    + ((((0 * 4)
                    + i)
                    * 3)
                    + axis))] = q0;
                    stack[(stackpos
                    + ((((1 * 4)
                    + i)
                    * 3)
                    + axis))] = q1;
                    stack[(stackpos
                    + ((((2 * 4)
                    + i)
                    * 3)
                    + axis))] = q2;
                    stack[(stackpos
                    + ((((3 * 4)
                    + i)
                    * 3)
                    + axis))] = q3;
                    stack[(stackpos
                    + (STACKSIZE
                    + ((((0 * 4)
                    + i)
                    * 3)
                    + axis)))] = r0;
                    stack[(stackpos
                    + (STACKSIZE
                    + ((((1 * 4)
                    + i)
                    * 3)
                    + axis)))] = r1;
                    stack[(stackpos
                    + (STACKSIZE
                    + ((((2 * 4)
                    + i)
                    * 3)
                    + axis)))] = r2;
                    stack[(stackpos
                    + (STACKSIZE
                    + ((((3 * 4)
                    + i)
                    * 3)
                    + axis)))] = r3;
                }

            }

            //  copy current bbox size
            stack[(stackpos
            + (STACKSIZE + 48))] = size;
            stack[(stackpos + 48)] = size;
            //  finally - split uv ranges
            let vmin:number = stack[(stackpos + 50)];
            let vmax:number = stack[(stackpos + 52)];
            stack[(stackpos
            + (STACKSIZE + 49))] = stack[(stackpos + 49)];
            stack[(stackpos + 50)] = vmin;
            stack[(stackpos
            + (STACKSIZE + 50))] = ((vmin + vmax)
            * 0.5);
            stack[(stackpos + 52)] = ((vmin + vmax)
            * 0.5);
            stack[(stackpos
            + (STACKSIZE + 51))] = stack[(stackpos + 51)];
            stack[(stackpos
            + (STACKSIZE + 52))] = vmax;
        }

        stackpos = (stackpos + STACKSIZE);
    }

}

prepareShadingState(state:ShadingState) {
    state.init();
    state.getRay().getPoint(state.getPoint());
    let parent:Instance = state.getInstance();
    let u:number = state.getU();
    let v:number = state.getV();
    let bu:number[] = this.bernstein(u);
    let bdu:number[] = this.bernsteinDeriv(u);
    let bv:number[] = this.bernstein(v);
    let bdv:number[] = this.bernsteinDeriv(v);
    this.getPatchPoint(u, v, this.patches[state.getPrimitiveID()], bu, bv, bdu, bdv, new Point3(), state.getNormal());
    state.getNormal().set(parent.transformNormalObjectToWorld(state.getNormal()));
    state.getNormal().normalize();
    state.getGeoNormal().set(state.getNormal());
    state.getUV().set(u, v);
    state.setShader(parent.getShader(0));
    state.setModifier(parent.getModifier(0));
    //  FIXME:use actual derivatives to create basis
    state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
}

getBakingPrimitives():PrimitiveList {
    return null;
}
}