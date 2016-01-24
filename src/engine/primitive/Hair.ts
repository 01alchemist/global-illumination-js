/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Hair implements PrimitiveList, Shader {

    private numSegments:number;

    private points:number[];

    private widths:FloatParameter;

    constructor () {
        this.numSegments = 1;
        this.points = null;
        this.widths = new FloatParameter(1);
    }

    getNumPrimitives():number {
        return (this.numSegments
        * (this.points.length / (3
        * (this.numSegments + 1))));
    }

    getPrimitiveBound(primID:number, i:number):number {
        let hair:number = (primID / this.numSegments);
        let line:number = (primID % this.numSegments);
        let vn:number = ((hair
        * (this.numSegments + 1))
        + line);
        let vRoot:number = (hair * (3
        * (this.numSegments + 1)));
        let v0:number = (vRoot
        + (line * 3));
        let v1:number = (v0 + 3);
        let axis:number;
        1;
        if (((i & 1)
            == 0)) {
            return Math.min((this.points[(v0 + axis)] - (0.5 * this.getWidth(vn))), (this.points[(v1 + axis)] - (0.5 * this.getWidth((vn + 1)))));
        }
        else {
            return Math.max((this.points[(v0 + axis)] + (0.5 * this.getWidth(vn))), (this.points[(v1 + axis)] + (0.5 * this.getWidth((vn + 1)))));
        }

    }

    getWorldBounds(o2w:Matrix4):BoundingBox {
        let bounds:BoundingBox = new BoundingBox();
        for (let j:number = 0; (i < this.points.length); i += 3) {
            let w:number = (0.5 * this.getWidth(j));
            let i:number = 0;
            bounds.include((this.points[i] - w), (this.points[(i + 1)] - w), (this.points[(i + 2)] - w));
            bounds.include((this.points[i] + w), (this.points[(i + 1)] + w), (this.points[(i + 2)] + w));
        }

        if ((o2w != null)) {
            bounds = o2w.transform(bounds);
        }

        return bounds;
    }

    private getWidth(i:number):number {
        switch (this.widths.interp) {
            case NONE:
                return this.widths.data[0];
                break;
            case VERTEX:
                return this.widths.data[i];
                break;
            default:
                return 0;
                break;
        }

    }

    private getTangent(line:number, v0:number, v:number):Vector3 {
        let vcurr:Vector3 = new Vector3((this.points[(v0 + 3)] - this.points[(v0 + 0)]), (this.points[(v0 + 4)] - this.points[(v0 + 1)]), (this.points[(v0 + 5)] - this.points[(v0 + 2)]));
        vcurr.normalize();
        if (((line == 0)
            || (line
            == (this.numSegments - 1)))) {
            return vcurr;
        }

        if ((v <= 0.5)) {
            //  get previous segment
            let vprev:Vector3 = new Vector3((this.points[(v0 + 0)] - this.points[(v0 - 3)]), (this.points[(v0 + 1)] - this.points[(v0 - 2)]), (this.points[(v0 + 2)] - this.points[(v0 - 1)]));
            vprev.normalize();
            let t:number = (v + 0.5);
            let s:number = (1 - t);
            let vx:number = ((vprev.x * s)
            + (vcurr.x * t));
            let vy:number = ((vprev.y * s)
            + (vcurr.y * t));
            let vz:number = ((vprev.z * s)
            + (vcurr.z * t));
            return new Vector3(vx, vy, vz);
        }
        else {
            //  get next segment
            v0 += 3;
            let vnext:Vector3 = new Vector3((this.points[(v0 + 3)] - this.points[(v0 + 0)]), (this.points[(v0 + 4)] - this.points[(v0 + 1)]), (this.points[(v0 + 5)] - this.points[(v0 + 2)]));
            vnext.normalize();
            let t:number = (1.5 - v);
            let s:number = (1 - t);
            let vx:number = ((vnext.x * s)
            + (vcurr.x * t));
            let vy:number = ((vnext.y * s)
            + (vcurr.y * t));
            let vz:number = ((vnext.z * s)
            + (vcurr.z * t));
            return new Vector3(vx, vy, vz);
        }

    }

    intersectPrimitive(r:Ray, primID:number, state:IntersectionState) {
        let hair:number = (primID / this.numSegments);
        let line:number = (primID % this.numSegments);
        let vRoot:number = (hair * (3
        * (this.numSegments + 1)));
        let v0:number = (vRoot
        + (line * 3));
        let v1:number = (v0 + 3);
        let vx:number = (this.points[(v1 + 0)] - this.points[(v0 + 0)]);
        let vy:number = (this.points[(v1 + 1)] - this.points[(v0 + 1)]);
        let vz:number = (this.points[(v1 + 2)] - this.points[(v0 + 2)]);
        let ux:number = ((r.dy * vz)
        - (r.dz * vy));
        let uy:number = ((r.dz * vx)
        - (r.dx * vz));
        let uz:number = ((r.dx * vy)
        - (r.dy * vx));
        let nx:number = ((uy * vz)
        - (uz * vy));
        let ny:number = ((uz * vx)
        - (ux * vz));
        let nz:number = ((ux * vy)
        - (uy * vx));
        let tden:number = (1
        / ((nx * r.dx)
        + ((ny * r.dy)
        + (nz * r.dz))));
        let tnum:number = ((nx
        * (this.points[(v0 + 0)] - r.ox))
        + ((ny
        * (this.points[(v0 + 1)] - r.oy))
        + (nz
        * (this.points[(v0 + 2)] - r.oz))));
        let t:number = (tnum * tden);
        if (r.isInside(t)) {
            let vn:number = ((hair
            * (this.numSegments + 1))
            + line);
            let px:number = (r.ox
            + (t * r.dx));
            let py:number = (r.oy
            + (t * r.dy));
            let pz:number = (r.oz
            + (t * r.dz));
            let qx:number = (px - this.points[(v0 + 0)]);
            let qy:number = (py - this.points[(v0 + 1)]);
            let qz:number = (pz - this.points[(v0 + 2)]);
            let q:number = (((vx * qx)
            + ((vy * qy)
            + (vz * qz)))
            / ((vx * vx)
            + ((vy * vy)
            + (vz * vz))));
            if ((q <= 0)) {
                //  don't included rounded tip at root
                if ((line == 0)) {
                    return;
                }

                let dx:number = (this.points[(v0 + 0)] - px);
                let dy:number = (this.points[(v0 + 1)] - py);
                let dz:number = (this.points[(v0 + 2)] - pz);
                let d2:number = ((dx * dx)
                + ((dy * dy)
                + (dz * dz)));
                let width:number = this.getWidth(vn);
                if ((d2
                    < (width
                    * (width * 0.25)))) {
                    r.setMax(t);
                    state.setIntersection(primID, 0, 0);
                }

            }
            else if ((q >= 1)) {
                let dx:number = (this.points[(v1 + 0)] - px);
                let dy:number = (this.points[(v1 + 1)] - py);
                let dz:number = (this.points[(v1 + 2)] - pz);
                let d2:number = ((dx * dx)
                + ((dy * dy)
                + (dz * dz)));
                let width:number = this.getWidth((vn + 1));
                if ((d2
                    < (width
                    * (width * 0.25)))) {
                    r.setMax(t);
                    state.setIntersection(primID, 0, 1);
                }

            }
            else {
                let dx:number = (this.points[(v0 + 0)]
                + ((q * vx)
                - px));
                let dy:number = (this.points[(v0 + 1)]
                + ((q * vy)
                - py));
                let dz:number = (this.points[(v0 + 2)]
                + ((q * vz)
                - pz));
                let d2:number = ((dx * dx)
                + ((dy * dy)
                + (dz * dz)));
                let width:number = (((1 - q)
                * this.getWidth(vn))
                + (q * this.getWidth((vn + 1))));
                if ((d2
                    < (width
                    * (width * 0.25)))) {
                    r.setMax(t);
                    state.setIntersection(primID, 0, q);
                }

            }

        }

    }

    prepareShadingState(state:ShadingState) {
        state.init();
        let i:Instance = state.getInstance();
        state.getRay().getPoint(state.getPoint());
        let r:Ray = state.getRay();
        let s:Shader = i.getShader(0);
        state.setShader((s != null));
        // TODO:Warning!!!, inline IF is not supported ?
        let primID:number = state.getPrimitiveID();
        let hair:number = (primID / this.numSegments);
        let line:number = (primID % this.numSegments);
        let vRoot:number = (hair * (3
        * (this.numSegments + 1)));
        let v0:number = (vRoot
        + (line * 3));
        //  tangent vector
        let v:Vector3 = this.getTangent(line, v0, state.getV());
        v = i.transformVectorObjectToWorld(v);
        state.setBasis(OrthoNormalBasis.makeFromWV(v, new Vector3((r.dx * -1), (r.dy * -1), (r.dz * -1))));
        state.getBasis().swapVW();
        //  normal
        state.getNormal().set(0, 0, 1);
        state.getBasis().transform(state.getNormal());
        state.getGeoNormal().set(state.getNormal());
        state.getUV().set(0, ((line + state.getV())
        / this.numSegments));
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        this.numSegments = pl.getInt("segments", this.numSegments);
        if ((this.numSegments < 1)) {
            console.error(Module.HAIR, "Invalid number of segments:%d", this.numSegments);
            return false;
        }

        let pointsP:FloatParameter = pl.getPointArray("points");
        if ((pointsP != null)) {
            if ((pointsP.interp != InterpolationType.VERTEX)) {
                console.error(Module.HAIR, "Point interpolation type must be set to \""vertex\"" - was \""%s\"""", pointsP.interp.name().toLowerCase())", else, {, points=pointsP.data);
            }

        }

    }
}
pl.setVertexCount((points.length / 3));
let widthsP:FloatParameter = pl.getFloatArray("widths");
if ((widthsP != null)) {
    if (((widthsP.interp == InterpolationType.NONE)
        || (widthsP.interp == InterpolationType.VERTEX))) {
        widths = widthsP;
    }
    else {
        console.warn(Module.HAIR, "Width interpolation type %s is not supported -- ignoring", widthsP.interp.name().toLowerCase());
    }

}

return true;
UnknownUnknown

getRadiance(state:ShadingState):Color {
    //  don't use these - gather lights for sphere of directions
    //  gather lights
    state.initLightSamples();
    state.initCausticSamples();
    let v:Vector3 = state.getRay().getDirection();
    v.negate();
    let h:Vector3 = new Vector3();
    let t:Vector3 = state.getBasis().transform(new Vector3(0, 1, 0));
    let diff:Color = Color.black();
    let spec:Color = Color.black();
    for (let ls:LightSample in state) {
        let l:Vector3 = ls.getShadowRay().getDirection();
        let dotTL:number = Vector3.dot(t, l);
        let sinTL:number = (<number>(Math.sqrt((1
        - (dotTL * dotTL)))));
        //  float dotVL = Vector3.dot(v, l);
        diff.madd(sinTL, ls.getDiffuseRadiance());
        Vector3.add(v, l, h);
        h.normalize();
        let dotTH:number = Vector3.dot(t, h);
        let sinTH:number = (<number>(Math.sqrt((1
        - (dotTH * dotTH)))));
        let s:number = (<number>(Math.pow(sinTH, 10)));
        spec.madd(s, ls.getSpecularRadiance());
    }

    let c:Color = Color.add(diff, spec, new Color());
    //  transparency
    return Color.blend(c, state.traceTransparency(), state.getV(), new Color());
}

scatterPhoton(state:ShadingState, power:Color) {

}

getBakingPrimitives():PrimitiveList {
    return null;
}