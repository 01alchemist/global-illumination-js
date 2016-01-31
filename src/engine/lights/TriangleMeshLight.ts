/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
class TriangleLight implements LightSource {

    private tri3:number;

    private area:number;

    private ng:Vector3;

    constructor (tri:number) {
        this.tri3 = (3 * tri);
        let a:number = triangles[(this.tri3 + 0)];
        let b:number = triangles[(this.tri3 + 1)];
        let c:number = triangles[(this.tri3 + 2)];
        let v0p:Point3 = getPoint(a);
        let v1p:Point3 = getPoint(b);
        let v2p:Point3 = getPoint(c);
        this.ng = Point3.normal(v0p, v1p, v2p);
        this.area = (0.5 * this.ng.length());
        this.ng.normalize();
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        return true;
    }

    getNumSamples():number {
        return numSamples;
    }

    private intersectTriangleKensler(r:Ray):boolean {
        let a:number = (3 * triangles[(this.tri3 + 0)]);
        let b:number = (3 * triangles[(this.tri3 + 1)]);
        let c:number = (3 * triangles[(this.tri3 + 2)]);
        let edge0x:number = (points[(b + 0)] - points[(a + 0)]);
        let edge0y:number = (points[(b + 1)] - points[(a + 1)]);
        let edge0z:number = (points[(b + 2)] - points[(a + 2)]);
        let edge1x:number = (points[(a + 0)] - points[(c + 0)]);
        let edge1y:number = (points[(a + 1)] - points[(c + 1)]);
        let edge1z:number = (points[(a + 2)] - points[(c + 2)]);
        let nx:number = ((edge0y * edge1z)
        - (edge0z * edge1y));
        let ny:number = ((edge0z * edge1x)
        - (edge0x * edge1z));
        let nz:number = ((edge0x * edge1y)
        - (edge0y * edge1x));
        let v:number = r.dot(nx, ny, nz);
        let iv:number = (1 / v);
        let edge2x:number = (points[(a + 0)] - r.ox);
        let edge2y:number = (points[(a + 1)] - r.oy);
        let edge2z:number = (points[(a + 2)] - r.oz);
        let va:number = ((nx * edge2x)
        + ((ny * edge2y)
        + (nz * edge2z)));
        let t:number = (iv * va);
        if ((t <= 0)) {
            return false;
        }

        let ix:number = ((edge2y * r.dz)
        - (edge2z * r.dy));
        let iy:number = ((edge2z * r.dx)
        - (edge2x * r.dz));
        let iz:number = ((edge2x * r.dy)
        - (edge2y * r.dx));
        let v1:number = ((ix * edge1x)
        + ((iy * edge1y)
        + (iz * edge1z)));
        let beta:number = (iv * v1);
        if ((beta < 0)) {
            return false;
        }

        let v2:number = ((ix * edge0x)
        + ((iy * edge0y)
        + (iz * edge0z)));
        if ((((v1 + v2)
            * v)
            > (v * v))) {
            return false;
        }

        let gamma:number = (iv * v2);
        if ((gamma < 0)) {
            return false;
        }

        //  FIXME:arbitrary bias, should handle as in other places
        r.setMax((t - 0.001));
        return true;
    }

    getSamples(state:ShadingState) {
        if ((numSamples == 0)) {
            return;
        }

        let n:Vector3 = state.getNormal();
        let p:Point3 = state.getPoint();
        //  vector towards each vertex of the light source
        let p0:Vector3 = Point3.sub(getPoint(triangles[(this.tri3 + 0)]), p, new Vector3());
        //  cull triangle if it is facing the wrong way
        if ((Vector3.dot(p0, this.ng) >= 0)) {
            return;
        }

        let p1:Vector3 = Point3.sub(getPoint(triangles[(this.tri3 + 1)]), p, new Vector3());
        let p2:Vector3 = Point3.sub(getPoint(triangles[(this.tri3 + 2)]), p, new Vector3());
        //  if all three vertices are below the hemisphere, stop
        if (((Vector3.dot(p0, n) <= 0)
            && ((Vector3.dot(p1, n) <= 0)
            && (Vector3.dot(p2, n) <= 0)))) {
            return;
        }

        p0.normalize();
        p1.normalize();
        p2.normalize();
        let dot:number = Vector3.dot(p2, p0);
        let h:Vector3 = new Vector3();
        h.x = (p2.x
        - (dot * p0.x));
        h.y = (p2.y
        - (dot * p0.y));
        h.z = (p2.z
        - (dot * p0.z));
        let hlen:number = h.length();
        if ((hlen > 1E-06)) {
            h.div(hlen);
        }
        else {
            return;
        }

        let n0:Vector3 = Vector3.cross(p0, p1, new Vector3());
        let len0:number = n0.length();
        if ((len0 > 1E-06)) {
            n0.div(len0);
        }
        else {
            return;
        }

        let n1:Vector3 = Vector3.cross(p1, p2, new Vector3());
        let len1:number = n1.length();
        if ((len1 > 1E-06)) {
            n1.div(len1);
        }
        else {
            return;
        }

        let n2:Vector3 = Vector3.cross(p2, p0, new Vector3());
        let len2:number = n2.length();
        if ((len2 > 1E-06)) {
            n2.div(len2);
        }
        else {
            return;
        }

        let cosAlpha:number = MathUtils.clamp((Vector3.dot(n2, n0) * -1), -1, 1);
        let cosBeta:number = MathUtils.clamp((Vector3.dot(n0, n1) * -1), -1, 1);
        let cosGamma:number = MathUtils.clamp((Vector3.dot(n1, n2) * -1), -1, 1);
        let alpha:number = (<number>(Math.acos(cosAlpha)));
        let beta:number = (<number>(Math.acos(cosBeta)));
        let gamma:number = (<number>(Math.acos(cosGamma)));
        let area:number = (alpha
        + (beta
        + (gamma - (<number>(Math.PI)))));
        let cosC:number = MathUtils.clamp(Vector3.dot(p0, p1), -1, 1);
        let salpha:number = (<number>(Math.sin(alpha)));
        let product:number = (salpha * cosC);
        //  use lower sampling depth for diffuse bounces
        let samples:number = (state.getDiffuseDepth() > 0);
        // TODO:Warning!!!, inline IF is not supported ?
        let c:Color = Color.mul((this.area / samples), radiance);
        for (let i:number = 0; (i < samples); i++) {
            //  random offset on unit square
            let randX:number = state.getRandom(i, 0, samples);
            let randY:number = state.getRandom(i, 1, samples);
            let phi:number = ((((<number>(randX)) * this.area)
            - alpha)
            + (<number>(Math.PI)));
            let sinPhi:number = (<number>(Math.sin(phi)));
            let cosPhi:number = (<number>(Math.cos(phi)));
            let u:number = (cosPhi + cosAlpha);
            let v:number = (sinPhi - product);
            let q:number = (((v * -1)
            + (cosAlpha
            * ((cosPhi
            * (v * -1))
            + (sinPhi * u))))
            / (salpha
            * (sinPhi
            * ((v
            - (cosPhi * u))
            * -1))));
            let q1:number = (1
            - (q * q));
            if ((q1 < 0)) {
                q1 = 0;
            }

            let sqrtq1:number = (<number>(Math.sqrt(q1)));
            let ncx:number = ((q * p0.x)
            + (sqrtq1 * h.x));
            let ncy:number = ((q * p0.y)
            + (sqrtq1 * h.y));
            let ncz:number = ((q * p0.z)
            + (sqrtq1 * h.z));
            dot = p1.dot(ncx, ncy, ncz);
            let z:number = (1
            - ((<number>(randY)) * (1 - dot)));
            let z1:number = (1
            - (z * z));
            if ((z1 < 0)) {
                z1 = 0;
            }

            let nd:Vector3 = new Vector3();
            nd.x = (ncx
            - (dot * p1.x));
            nd.y = (ncy
            - (dot * p1.y));
            nd.z = (ncz
            - (dot * p1.z));
            nd.normalize();
            let sqrtz1:number = (<number>(Math.sqrt(z1)));
            let result:Vector3 = new Vector3();
            result.x = ((z * p1.x)
            + (sqrtz1 * nd.x));
            result.y = ((z * p1.y)
            + (sqrtz1 * nd.y));
            result.z = ((z * p1.z)
            + (sqrtz1 * nd.z));
            //  make sure the sample is in the right hemisphere - facing in
            //  the right direction
            if (((Vector3.dot(result, n) > 0)
                && ((Vector3.dot(result, state.getGeoNormal()) > 0)
                && (Vector3.dot(result, this.ng) < 0)))) {
                //  compute intersection with triangle (if any)
                let shadowRay:Ray = new Ray(state.getPoint(), result);
                if (!this.intersectTriangleKensler(shadowRay)) {
                    // TODO:Warning!!! continue If
                }

                let dest:LightSample = new LightSample();
                dest.setShadowRay(shadowRay);
                //  prepare sample
                dest.setRadiance(c, c);
                dest.traceShadow(state);
                state.addSample(dest);
            }

        }

    }

    getPhoton(randX1:number, randY1:number, randX2:number, randY2:number, p:Point3, dir:Vector3, power:Color) {
        let s:number = Math.sqrt((1 - randX2));
        let u:number = (<number>((randY2 * s)));
        let v:number = (<number>((1 - s)));
        let w:number = (1
        - (u - v));
        let index0:number = (3 * triangles[(this.tri3 + 0)]);
        let index1:number = (3 * triangles[(this.tri3 + 1)]);
        let index2:number = (3 * triangles[(this.tri3 + 2)]);
        p.x = ((w * points[(index0 + 0)])
        + ((u * points[(index1 + 0)])
        + (v * points[(index2 + 0)])));
        p.y = ((w * points[(index0 + 1)])
        + ((u * points[(index1 + 1)])
        + (v * points[(index2 + 1)])));
        p.z = ((w * points[(index0 + 2)])
        + ((u * points[(index1 + 2)])
        + (v * points[(index2 + 2)])));
        p.x = (p.x + (0.001 * this.ng.x));
        p.y = (p.y + (0.001 * this.ng.y));
        p.z = (p.z + (0.001 * this.ng.z));
        let onb:OrthoNormalBasis = OrthoNormalBasis.makeFromW(this.ng);
        u = (<number>((2
        * (Math.PI * randX1))));
        s = Math.sqrt(randY1);
        onb.transform(new Vector3((<number>((Math.cos(u) * s))), (<number>((Math.sin(u) * s))), (<number>(Math.sqrt((1 - randY1))))), dir);
        Color.mul(((<number>(Math.PI)) * this.area), radiance, power);
    }

    getPower():number {
        return radiance.copy().mul(((<number>(Math.PI)) * this.area)).getLuminance();
    }
}
export class TriangleMeshLight extends TriangleMesh implements Shader {

    private radiance:Color;

    private numSamples:number;

    constructor () {
        this.radiance = Color.WHITE;
        this.numSamples = 4;
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        this.radiance = pl.getColor("radiance", this.radiance);
        this.numSamples = pl.getInt("samples", this.numSamples);
        return super.update(pl, api);
    }

    init(name:string, api:GlobalIlluminationAPI) {
        api.geometry(name, this);
        api.shader((name + ".shader"), this);
        api.parameter("shaders", (name + ".shader"));
        api.instance((name + ".instance"), name);
        for (let j:number = 0; (i < triangles.length); i += 3) {
            let t:TriangleLight = new TriangleLight(j);
            let i:number = 0;
            let lname:string = String.format("%s.light[%d]", name, j);
            api.light(lname, t);
        }

    }



getRadiance(state:ShadingState):Color {
    if (!state.includeLights()) {
        return Color.BLACK;
    }

    state.faceforward();
    //  emit constant radiance
    return state.isBehind();
    // TODO:Warning!!!, inline IF is not supported ?
}

scatterPhoton(state:ShadingState, power:Color) {
    //  do not scatter photons
}
}