/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class CornellBox implements PrimitiveList, Shader, LightSource {

    private minX:number;

    private minY:number;

    private minZ:number;

    private maxX:number;

    private maxY:number;

    private maxZ:number;

    private left:Color;

    private right:Color;

    private top:Color;

    private bottom:Color;

    private back:Color;

    private radiance:Color;

    private samples:number;

    private lxmin:number;

    private lymin:number;

    private lxmax:number;

    private lymax:number;

    private area:number;

    private lightBounds:BoundingBox;

    constructor () {
        this.updateGeometry(new Point3(-1, -1, -1), new Point3(1, 1, 1));
        //  cube colors
        this.left = new Color(0.8, 0.25, 0.25);
        this.right = new Color(0.25, 0.25, 0.8);
        let gray:Color = new Color(0.7, 0.7, 0.7);
        this.back = gray;
        this.bottom = gray;
        this.top = gray;
        //  light source
        this.radiance = Color.WHITE;
        this.samples = 16;
    }

    private updateGeometry(c0:Point3, c1:Point3) {
        //  figure out cube extents
        this.lightBounds = new BoundingBox(c0);
        this.lightBounds.include(c1);
        //  cube extents
        this.minX = this.lightBounds.getMinimum().x;
        this.minY = this.lightBounds.getMinimum().y;
        this.minZ = this.lightBounds.getMinimum().z;
        this.maxX = this.lightBounds.getMaximum().x;
        this.maxY = this.lightBounds.getMaximum().y;
        this.maxZ = this.lightBounds.getMaximum().z;
        //  work around epsilon problems for light test
        this.lightBounds.enlargeUlps();
        //  light source geometry
        this.lxmin = ((this.maxX / 3) + (2
        * (this.minX / 3)));
        this.lxmax = ((this.minX / 3) + (2
        * (this.maxX / 3)));
        this.lymin = ((this.maxY / 3) + (2
        * (this.minY / 3)));
        this.lymax = ((this.minY / 3) + (2
        * (this.maxY / 3)));
        this.area = ((this.lxmax - this.lxmin)
        * (this.lymax - this.lymin));
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        let corner0:Point3 = pl.getPoint("corner0", null);
        let corner1:Point3 = pl.getPoint("corner1", null);
        if (((corner0 != null)
            && (corner1 != null))) {
            this.updateGeometry(corner0, corner1);
        }

        //  shader colors
        this.left = pl.getColor("leftColor", this.left);
        this.right = pl.getColor("rightColor", this.right);
        this.top = pl.getColor("topColor", this.top);
        this.bottom = pl.getColor("bottomColor", this.bottom);
        this.back = pl.getColor("backColor", this.back);
        //  light
        this.radiance = pl.getColor("radiance", this.radiance);
        this.samples = pl.getInt("samples", this.samples);
        return true;
    }

    init(name:string, api:GlobalIlluminationAPI) {
        //  register with the api properly
        api.geometry(name, this);
        api.shader((name + ".shader"), this);
        api.parameter("shaders", (name + ".shader"));
        api.instance((name + ".instance"), name);
        api.light((name + ".light"), this);
    }

    getBounds():BoundingBox {
        return this.lightBounds;
    }

    getBound(i:number):number {
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

    intersects(box:BoundingBox):boolean {
        //  this could be optimized
        let b:BoundingBox = new BoundingBox();
        b.include(new Point3(this.minX, this.minY, this.minZ));
        b.include(new Point3(this.maxX, this.maxY, this.maxZ));
        if (b.intersects(box)) {
            //  the box is overlapping or enclosed
            if (!b.contains(new Point3(box.getMinimum().x, box.getMinimum().y, box.getMinimum().z))) {
                return true;
            }

            if (!b.contains(new Point3(box.getMinimum().x, box.getMinimum().y, box.getMaximum().z))) {
                return true;
            }

            if (!b.contains(new Point3(box.getMinimum().x, box.getMaximum().y, box.getMinimum().z))) {
                return true;
            }

            if (!b.contains(new Point3(box.getMinimum().x, box.getMaximum().y, box.getMaximum().z))) {
                return true;
            }

            if (!b.contains(new Point3(box.getMaximum().x, box.getMinimum().y, box.getMinimum().z))) {
                return true;
            }

            if (!b.contains(new Point3(box.getMaximum().x, box.getMinimum().y, box.getMaximum().z))) {
                return true;
            }

            if (!b.contains(new Point3(box.getMaximum().x, box.getMaximum().y, box.getMinimum().z))) {
                return true;
            }

            if (!b.contains(new Point3(box.getMaximum().x, box.getMaximum().y, box.getMaximum().z))) {
                return true;
            }

            //  all vertices of the box are inside - the surface of the box is
            //  not intersected
        }

        return false;
    }

    prepareShadingState(state:ShadingState) {
        state.init();
        state.getRay().getPoint(state.getPoint());
        let n:number = state.getPrimitiveID();
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
        state.setShader(this);
    }

    intersectPrimitive(r:Ray, primID:number, state:IntersectionState) {
        let intervalMin:number = Float.NEGATIVE_INFINITY;
        let intervalMax:number = Float.POSITIVE_INFINITY;
        let orgX:number = r.ox;
        let invDirX:number = (1 / r.dx);
        let t2:number;
        let t1:number;
        t1 = ((this.minX - orgX)
        * invDirX);
        t2 = ((this.maxX - orgX)
        * invDirX);
        let sideOut:number = -1;
        let sideIn:number = -1;
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

        let orgY:number = r.oy;
        let invDirY:number = (1 / r.dy);
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

        let orgZ:number = r.oz;
        let invDirZ:number = (1 / r.dz);
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

        let sideIn:assert;
        -1;
        let sideOut:assert;
        -1;
        //  can't hit minY wall, there is none
        if (((sideIn != 2)
            && r.isInside(intervalMin))) {
            r.setMax(intervalMin);
            state.setIntersection(sideIn, 0, 0);
        }
        else if (((sideOut != 2)
            && r.isInside(intervalMax))) {
            r.setMax(intervalMax);
            state.setIntersection(sideOut, 0, 0);
        }

    }

    getRadiance(state:ShadingState):Color {
        let side:number = state.getPrimitiveID();
        let kd:Color = null;
        switch (side) {
            case 0:
                kd = this.left;
                break;
            case 1:
                kd = this.right;
                break;
            case 3:
                kd = this.back;
                break;
            case 4:
                kd = this.bottom;
                break;
            case 5:
                let lx:number = state.getPoint().x;
                let ly:number = state.getPoint().y;
                if (((lx >= this.lxmin)
                    && ((lx < this.lxmax)
                    && ((ly >= this.lymin)
                    && ((ly < this.lymax)
                    && (state.getRay().dz > 0)))))) {
                    return state.includeLights();
                }

                kd = this.top;
                break;
            default:
                assert;
                false;
                break;
        }

        // TODO:Warning!!!, inline IF is not supported ?
        //  make sure we are on the right side of the material
        state.faceforward();
        //  setup lighting
        state.initLightSamples();
        state.initCausticSamples();
        return state.diffuse(kd);
    }

    scatterPhoton(state:ShadingState, power:Color) {
        let side:number = state.getPrimitiveID();
        let kd:Color = null;
        switch (side) {
            case 0:
                kd = this.left;
                break;
            case 1:
                kd = this.right;
                break;
            case 3:
                kd = this.back;
                break;
            case 4:
                kd = this.bottom;
                break;
            case 5:
                let lx:number = state.getPoint().x;
                let ly:number = state.getPoint().y;
                if (((lx >= this.lxmin)
                    && ((lx < this.lxmax)
                    && ((ly >= this.lymin)
                    && ((ly < this.lymax)
                    && (state.getRay().dz > 0)))))) {
                    return;
                }

                kd = this.top;
                break;
            default:
                assert;
                false;
                break;
        }

        //  make sure we are on the right side of the material
        if ((Vector3.dot(state.getNormal(), state.getRay().getDirection()) > 0)) {
            state.getNormal().negate();
            state.getGeoNormal().negate();
        }

        state.storePhoton(state.getRay().getDirection(), power, kd);
        let avg:number = kd.getAverage();
        let rnd:number = state.getRandom(0, 0, 1);
        if ((rnd < avg)) {
            //  photon is scattered
            power.mul(kd).mul((1 / (<number>(avg))));
            let onb:OrthoNormalBasis = OrthoNormalBasis.makeFromW(state.getNormal());
            let u:number = (2
            * (Math.PI
            * (rnd / avg)));
            let v:number = state.getRandom(0, 1, 1);
            let s:number = (<number>(Math.sqrt(v)));
            let s1:number = (<number>(Math.sqrt((1 - v))));
            let w:Vector3 = new Vector3(((<number>(Math.cos(u))) * s), ((<number>(Math.sin(u))) * s), s1);
            w = onb.transform(w, new Vector3());
            state.traceDiffusePhoton(new Ray(state.getPoint(), w), power);
        }

    }

    getNumSamples():number {
        return this.samples;
    }

    getSamples(state:ShadingState) {
        if ((this.lightBounds.contains(state.getPoint())
            && (state.getPoint().z < this.maxZ))) {
            let n:number = (state.getDiffuseDepth() > 0);
            // TODO:Warning!!!, inline IF is not supported ?
            let a:number = (this.area / n);
            for (let i:number = 0; (i < n); i++) {
                //  random offset on unit square, we use the infinite version of
                //  getRandom
                //  because the light sampling is adaptive
                let randX:number = state.getRandom(i, 0);
                let randY:number = state.getRandom(i, 1);
                let p:Point3 = new Point3();
                p.x = (<number>(((this.lxmin * (1 - randX))
                + (this.lxmax * randX))));
                p.y = (<number>(((this.lymin * (1 - randY))
                + (this.lymax * randY))));
                p.z = (this.maxZ - 0.001);
                let dest:LightSample = new LightSample();
                //  prepare shadow ray to sampled point
                dest.setShadowRay(new Ray(state.getPoint(), p));
                //  check that the direction of the sample is the same as the
                //  normal
                let cosNx:number = dest.dot(state.getNormal());
                if ((cosNx <= 0)) {
                    return;
                }

                //  light source facing point ?
                //  (need to check with light source's normal)
                let cosNy:number = dest.getShadowRay().dz;
                if ((cosNy > 0)) {
                    //  compute geometric attenuation and probability scale
                    //  factor
                    let r:number = dest.getShadowRay().getMax();
                    let g:number = (cosNy
                    / (r * r));
                    let scale:number = (g * a);
                    //  set final sample radiance
                    dest.setRadiance(this.radiance, this.radiance);
                    dest.getDiffuseRadiance().mul(scale);
                    dest.getSpecularRadiance().mul(scale);
                    dest.traceShadow(state);
                    state.addSample(dest);
                }

            }

        }

    }

    getPhoton(randX1:number, randY1:number, randX2:number, randY2:number, p:Point3, dir:Vector3, power:Color) {
        p.x = (<number>(((this.lxmin * (1 - randX2))
        + (this.lxmax * randX2))));
        p.y = (<number>(((this.lymin * (1 - randY2))
        + (this.lymax * randY2))));
        p.z = (this.maxZ - 0.001);
        let u:number = (2
        * (Math.PI * randX1));
        let s:number = Math.sqrt(randY1);
        dir.set((<number>((Math.cos(u) * s))), (<number>((Math.sin(u) * s))), (float - Math.sqrt((1 - randY1))));
        Color.mul(((<number>(Math.PI)) * this.area), this.radiance, power);
    }

    getPower():number {
        return this.radiance.copy().mul(((<number>(Math.PI)) * this.area)).getLuminance();
    }

    getNumPrimitives():number {
        return 1;
    }

    getPrimitiveBound(primID:number, i:number):number {
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

    getWorldBounds(o2w:Matrix4):BoundingBox {
        let bounds:BoundingBox = new BoundingBox(this.minX, this.minY, this.minZ);
        bounds.include(this.maxX, this.maxY, this.maxZ);
        if ((o2w == null)) {
            return bounds;
        }

        return o2w.transform(bounds);
    }

    getBakingPrimitives():PrimitiveList {
        return null;
    }
}