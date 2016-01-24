/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class UberShader implements Shader {

    private diff:Color;

    private spec:Color;

    private diffmap:Texture;

    private specmap:Texture;

    private diffBlend:number;

    private specBlend:number;

    private glossyness:number;

    private numSamples:number;

    constructor () {
        this.spec = Color.GRAY;
        this.diff = Color.GRAY;
        this.diff = Color.GRAY;
        this.specmap = null;
        this.diffmap = null;
        this.specBlend = 1;
        this.diffBlend = 1;
        this.glossyness = 0;
        this.numSamples = 4;
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        this.diff = pl.getColor("diffuse", this.diff);
        this.spec = pl.getColor("specular", this.spec);
        let filename:string;
        filename = pl.getString("diffuse.texture", null);
        if ((filename != null)) {
            this.diffmap = TextureCache.getTexture(api.resolveTextureFilename(filename), false);
        }

        filename = pl.getString("specular.texture", null);
        if ((filename != null)) {
            this.specmap = TextureCache.getTexture(api.resolveTextureFilename(filename), false);
        }

        this.diffBlend = MathUtils.clamp(pl.getFloat("diffuse.blend", this.diffBlend), 0, 1);
        this.specBlend = MathUtils.clamp(pl.getFloat("specular.blend", this.diffBlend), 0, 1);
        this.glossyness = MathUtils.clamp(pl.getFloat("glossyness", this.glossyness), 0, 1);
        this.numSamples = pl.getInt("samples", this.numSamples);
        return true;
    }

    getDiffuse(state:ShadingState):Color {
        return (this.diffmap == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    getSpecular(state:ShadingState):Color {
        return (this.specmap == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    getRadiance(state:ShadingState):Color {
        //  make sure we are on the right side of the material
        state.faceforward();
        //  direct lighting
        state.initLightSamples();
        state.initCausticSamples();
        let d:Color = this.getDiffuse(state);
        let lr:Color = state.diffuse(d);
        if (!state.includeSpecular()) {
            return lr;
        }

        if ((this.glossyness == 0)) {
            let cos:number = state.getCosND();
            let dn:number = (2 * cos);
            let refDir:Vector3 = new Vector3();
            refDir.x = ((dn * state.getNormal().x)
            + state.getRay().getDirection().x);
            refDir.y = ((dn * state.getNormal().y)
            + state.getRay().getDirection().y);
            refDir.z = ((dn * state.getNormal().z)
            + state.getRay().getDirection().z);
            let refRay:Ray = new Ray(state.getPoint(), refDir);
            //  compute Fresnel term
            cos = (1 - cos);
            let cos2:number = (cos * cos);
            let cos5:number = (cos2
            * (cos2 * cos));
            let ret:Color = Color.white();
            ret.sub(this.spec);
            ret.mul(cos5);
            ret.add(this.spec);
            return lr.add(ret.mul(state.traceReflection(refRay, 0)));
        }
        else {
            return lr.add(state.specularPhong(this.getSpecular(state), (2 / this.glossyness), this.numSamples));
        }

    }

    scatterPhoton(state:ShadingState, power:Color) {
        let specular:Color;
        let diffuse:Color;
        //  make sure we are on the right side of the material
        state.faceforward();
        diffuse = this.getDiffuse(state);
        specular = this.getSpecular(state);
        state.storePhoton(state.getRay().getDirection(), power, diffuse);
        let d:number = diffuse.getAverage();
        let r:number = specular.getAverage();
        let rnd:number = state.getRandom(0, 0, 1);
        if ((rnd < d)) {
            //  photon is scattered
            power.mul(diffuse).mul((1 / d));
            let onb:OrthoNormalBasis = state.getBasis();
            let u:number = (2
            * (Math.PI
            * (rnd / d)));
            let v:number = state.getRandom(0, 1, 1);
            let s:number = (<number>(Math.sqrt(v)));
            let s1:number = (<number>(Math.sqrt((1 - v))));
            let w:Vector3 = new Vector3(((<number>(Math.cos(u))) * s), ((<number>(Math.sin(u))) * s), s1);
            w = onb.transform(w, new Vector3());
            state.traceDiffusePhoton(new Ray(state.getPoint(), w), power);
        }
        else if ((rnd
            < (d + r))) {
            if ((this.glossyness == 0)) {
                let cos:number = (Vector3.dot(state.getNormal(), state.getRay().getDirection()) * -1);
                power.mul(diffuse).mul((1 / d));
                //  photon is reflected
                let dn:number = (2 * cos);
                let dir:Vector3 = new Vector3();
                dir.x = ((dn * state.getNormal().x)
                + state.getRay().getDirection().x);
                dir.y = ((dn * state.getNormal().y)
                + state.getRay().getDirection().y);
                dir.z = ((dn * state.getNormal().z)
                + state.getRay().getDirection().z);
                state.traceReflectionPhoton(new Ray(state.getPoint(), dir), power);
            }
            else {
                let dn:number = (2 * state.getCosND());
                //  reflected direction
                let refDir:Vector3 = new Vector3();
                refDir.x = ((dn * state.getNormal().x)
                + state.getRay().dx);
                refDir.y = ((dn * state.getNormal().y)
                + state.getRay().dy);
                refDir.z = ((dn * state.getNormal().z)
                + state.getRay().dz);
                power.mul(this.spec).mul((1 / r));
                let onb:OrthoNormalBasis = state.getBasis();
                let u:number = (2
                * (Math.PI
                * ((rnd - r)
                / r)));
                let v:number = state.getRandom(0, 1, 1);
                let s:number = (<number>(Math.pow(v, (1
                / ((1 / this.glossyness)
                + 1)))));
                let s1:number = (<number>(Math.sqrt((1
                - (s * s)))));
                let w:Vector3 = new Vector3(((<number>(Math.cos(u))) * s1), ((<number>(Math.sin(u))) * s1), s);
                w = onb.transform(w, new Vector3());
                state.traceReflectionPhoton(new Ray(state.getPoint(), w), power);
            }

        }

    }
}