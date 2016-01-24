/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ImageBasedLight implements PrimitiveList, LightSource, Shader {

    private texture:Texture;

    private basis:OrthoNormalBasis;

    private numSamples:number;

    private jacobian:number;

    private colHistogram:number[];

    private imageHistogram:number[,];

    private samples:Vector3[];

    private colors:Color[];

    constructor () {
        this.texture = null;
        this.updateBasis(new Vector3(0, 0, -1), new Vector3(0, 1, 0));
        this.numSamples = 64;
    }

    private updateBasis(center:Vector3, up:Vector3) {
        if (((center != null)
            && (up != null))) {
            this.basis = OrthoNormalBasis.makeFromWV(center, up);
            this.basis.swapWU();
            this.basis.flipV();
        }

    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        this.updateBasis(pl.getVector("center", null), pl.getVector("up", null));
        this.numSamples = pl.getInt("samples", this.numSamples);
        let filename:string = pl.getString("texture", null);
        if ((filename != null)) {
            this.texture = TextureCache.getTexture(api.resolveTextureFilename(filename), true);
        }

        //  no texture provided
        if ((this.texture == null)) {
            return false;
        }

        let b:Bitmap = this.texture.getBitmap();
        if ((b == null)) {
            return false;
        }

        //  rebuild histograms if this is a new texture
        if ((filename != null)) {
            this.imageHistogram = new Array(b.getWidth());
            b.getHeight();
            this.colHistogram = new Array(b.getWidth());
            let du:number = (1 / b.getWidth());
            let dv:number = (1 / b.getHeight());
            for (let x:number = 0; (x < b.getWidth()); x++) {
                for (let y:number = 0; (y < b.getHeight()); y++) {
                    let u:number = ((x + 0.5)
                    * du);
                    let v:number = ((y + 0.5)
                    * dv);
                    let c:Color = this.texture.getPixel(u, v);
                    //  box filter the image
                    //  c.add(texture.getPixel(u + du, v));
                    //  c.add(texture.getPixel(u + du, v+ dv));
                    //  c.add(texture.getPixel(u, v + dv));
                    //  c.mul(0.25f);
                    this.imageHistogram[x][y] = (c.getLuminance() * (<number>(Math.sin((Math.PI * v)))));
                    if ((y > 0)) {
                        this.imageHistogram[x][y] = (this.imageHistogram[x][y] + this.imageHistogram[x][(y - 1)]);
                    }

                }

                this.colHistogram[x] = this.imageHistogram[x][(b.getHeight() - 1)];
                if ((x > 0)) {
                    this.colHistogram[x] = (this.colHistogram[x] + this.colHistogram[(x - 1)]);
                }

                for (let y:number = 0; (y < b.getHeight()); y++) {
                }

                this.imageHistogram[x][(b.getHeight() - 1)];
            }

            for (let x:number = 0; (x < b.getWidth()); x++) {
            }

            this.colHistogram[(b.getWidth() - 1)];
            this.jacobian = ((<number>((2
            * (Math.PI * Math.PI))))
            / (b.getWidth() * b.getHeight()));
        }

        //  take fixed samples
        if (pl.getBoolean("fixed", (this.samples != null))) {
            //  Bitmap loc = new Bitmap(filename);
            this.samples = new Array(this.numSamples);
            this.colors = new Array(this.numSamples);
            for (let i:number = 0; (i < this.numSamples); i++) {
                let randX:number = ((<number>(i)) / (<number>(this.numSamples)));
                let randY:number = QMC.halton(0, i);
                let x:number = 0;
                while (((randX >= this.colHistogram[x])
                && (x
                < (this.colHistogram.length - 1)))) {
                    x++;
                }

                let rowHistogram:number[] = this.imageHistogram[x];
                let y:number = 0;
                while (((randY >= rowHistogram[y])
                && (y
                < (rowHistogram.length - 1)))) {
                    y++;
                }

                //  sample from (x, y)
                let u:number = (<number>((x == 0)));
                // TODO:Warning!!!, inline IF is not supported ?
                let v:number = (<number>((y == 0)));
                // TODO:Warning!!!, inline IF is not supported ?
                let px:number = (x == 0);
                // TODO:Warning!!!, inline IF is not supported ?
                let py:number = (y == 0);
                // TODO:Warning!!!, inline IF is not supported ?
                let su:number = ((x + u)
                / this.colHistogram.length);
                let sv:number = ((y + v)
                / rowHistogram.length);
                let invP:number = ((<number>(Math.sin((sv * Math.PI))))
                * (this.jacobian
                / (this.numSamples
                * (px * py))));
                this.samples[i] = this.getDirection(su, sv);
                this.basis.transform(this.samples[i]);
                this.colors[i] = this.texture.getPixel(su, sv).mul(invP);
                //  loc.setPixel(x, y, Color.YELLOW.copy().mul(1e6f));
            }

            //  loc.save("samples.hdr");
        }
        else {
            //  turn off
            this.samples = null;
            this.colors = null;
        }

        return true;
    }

    init(name:string, api:GlobalIlluminationAPI) {
        //  register this object with the api properly
        api.geometry(name, this);
        if ((api.lookupGeometry(name) == null)) {
            //  quit if we don't see our geometry in here (error message
            //  will have already been printed)
            return;
        }

        api.shader((name + ".shader"), this);
        api.parameter("shaders", (name + ".shader"));
        api.instance((name + ".instance"), name);
        api.light((name + ".light"), this);
    }

    prepareShadingState(state:ShadingState) {
        if (state.includeLights()) {
            state.setShader(this);
        }

    }

    intersectPrimitive(r:Ray, primID:number, state:IntersectionState) {
        if ((r.getMax() == Float.POSITIVE_INFINITY)) {
            state.setIntersection(0, 0, 0);
        }

    }

    getNumPrimitives():number {
        return 1;
    }

    getPrimitiveBound(primID:number, i:number):number {
        return 0;
    }

    getWorldBounds(o2w:Matrix4):BoundingBox {
        return null;
    }

    getBakingPrimitives():PrimitiveList {
        return null;
    }

    getNumSamples():number {
        return this.numSamples;
    }

    getSamples(state:ShadingState) {
        if ((this.samples == null)) {
            let n:number = (state.getDiffuseDepth() > 0);
            // TODO:Warning!!!, inline IF is not supported ?
            for (let i:number = 0; (i < n); i++) {
                //  random offset on unit square, we use the infinite version of
                //  getRandom because the light sampling is adaptive
                let randX:number = state.getRandom(i, 0, n);
                let randY:number = state.getRandom(i, 1, n);
                let x:number = 0;
                while (((randX >= this.colHistogram[x])
                && (x
                < (this.colHistogram.length - 1)))) {
                    x++;
                }

                let rowHistogram:number[] = this.imageHistogram[x];
                let y:number = 0;
                while (((randY >= rowHistogram[y])
                && (y
                < (rowHistogram.length - 1)))) {
                    y++;
                }

                //  sample from (x, y)
                let u:number = (<number>((x == 0)));
                // TODO:Warning!!!, inline IF is not supported ?
                let v:number = (<number>((y == 0)));
                // TODO:Warning!!!, inline IF is not supported ?
                let px:number = (x == 0);
                // TODO:Warning!!!, inline IF is not supported ?
                let py:number = (y == 0);
                // TODO:Warning!!!, inline IF is not supported ?
                let su:number = ((x + u)
                / this.colHistogram.length);
                let sv:number = ((y + v)
                / rowHistogram.length);
                let invP:number = ((<number>(Math.sin((sv * Math.PI))))
                * (this.jacobian
                / (n
                * (px * py))));
                let dir:Vector3 = this.getDirection(su, sv);
                this.basis.transform(dir);
                if ((Vector3.dot(dir, state.getGeoNormal()) > 0)) {
                    let dest:LightSample = new LightSample();
                    dest.setShadowRay(new Ray(state.getPoint(), dir));
                    dest.getShadowRay().setMax(Float.MAX_VALUE);
                    let radiance:Color = this.texture.getPixel(su, sv);
                    dest.setRadiance(radiance, radiance);
                    dest.getDiffuseRadiance().mul(invP);
                    dest.getSpecularRadiance().mul(invP);
                    dest.traceShadow(state);
                    state.addSample(dest);
                }

            }

        }
        else {
            for (let i:number = 0; (i < this.numSamples); i++) {
                if (((Vector3.dot(this.samples[i], state.getGeoNormal()) > 0)
                    && (Vector3.dot(this.samples[i], state.getNormal()) > 0))) {
                    let dest:LightSample = new LightSample();
                    dest.setShadowRay(new Ray(state.getPoint(), this.samples[i]));
                    dest.getShadowRay().setMax(Float.MAX_VALUE);
                    dest.setRadiance(this.colors[i], this.colors[i]);
                    dest.traceShadow(state);
                    state.addSample(dest);
                }

            }

        }

    }

    getPhoton(randX1:number, randY1:number, randX2:number, randY2:number, p:Point3, dir:Vector3, power:Color) {

    }

    getRadiance(state:ShadingState):Color {
        //  lookup texture based on ray direction
        return state.includeLights();
        // TODO:Warning!!!, inline IF is not supported ?
    }

    private getColor(dir:Vector3):Color {
        let v:number;
        let u:number;
        //  assume lon/lat format
        let theta:number = 0;
        let phi:number = 0;
        phi = Math.acos(dir.y);
        theta = Math.atan2(dir.z, dir.x);
        u = (<number>((0.5 - (0.5
        * (theta / Math.PI)))));
        v = (<number>((phi / Math.PI)));
        return this.texture.getPixel(u, v);
    }

    private getDirection(u:number, v:number):Vector3 {
        let dest:Vector3 = new Vector3();
        let theta:number = 0;
        let phi:number = 0;
        theta = (u * (2 * Math.PI));
        phi = (v * Math.PI);
        let sin_phi:number = Math.sin(phi);
        dest.x = (<number>(((sin_phi * Math.cos(theta))
        * -1)));
        dest.y = (<number>(Math.cos(phi)));
        dest.z = (<number>((sin_phi * Math.sin(theta))));
        return dest;
    }

    scatterPhoton(state:ShadingState, power:Color) {

    }

    getPower():number {
        return 0;
    }
}