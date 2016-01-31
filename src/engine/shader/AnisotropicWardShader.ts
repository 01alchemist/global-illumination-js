import {Color} from "../math/Color";
import {OrthoNormalBasis} from "../math/OrthoNormalBasis";
import {ShadingState} from "../core/ShadingState";
import {Vector3} from "../math/Vector3";
import {LightSample} from "../core/LightSample";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class AnisotropicWardShader implements Shader {

    private rhoD:Color;

    //  diffuse reflectance
    private rhoS:Color;

    //  specular reflectance
    private alphaX:number;

    private alphaY:number;

    private numRays:number;

    constructor () {
        this.rhoD = Color.GRAY;
        this.rhoS = Color.GRAY;
        this.alphaX = 1;
        this.alphaY = 1;
        this.numRays = 4;
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        this.rhoD = pl.getColor("diffuse", this.rhoD);
        this.rhoS = pl.getColor("specular", this.rhoS);
        this.alphaX = pl.getFloat("roughnessX", this.alphaX);
        this.alphaY = pl.getFloat("roughnessY", this.alphaY);
        this.numRays = pl.getInt("samples", this.numRays);
        return true;
    }

    protected getDiffuse(state:ShadingState):Color {
        return this.rhoD;
    }

    private brdf(i:Vector3, o:Vector3, basis:OrthoNormalBasis):number {
        let fr:number = (4
        * ((<number>(Math.PI))
        * (this.alphaX * this.alphaY)));
        fr = (fr * (<number>(Math.sqrt((basis.untransformZ(i) * basis.untransformZ(o))))));
        let h:Vector3 = Vector3.add(i, o, new Vector3());
        basis.untransform(h);
        let hx:number = (h.x / this.alphaX);
        hx = (hx * hx);
        let hy:number = (h.y / this.alphaY);
        hy = (hy * hy);
        let hn:number = (h.z * h.z);
        fr = ((<number>(Math.exp((((hx + hy)
        / hn)
        * -1)))) / fr);
        return fr;
    }

    getRadiance(state:ShadingState):Color {
        //  make sure we are on the right side of the material
        state.faceforward();
        let onb:OrthoNormalBasis = state.getBasis();
        //  direct lighting and caustics
        state.initLightSamples();
        state.initCausticSamples();
        let lr:Color = Color.black();
        //  compute specular contribution
        if (state.includeSpecular()) {
            let _in:Vector3 = state.getRay().getDirection().negate(new Vector3());
            for (let sample:LightSample in state) {
                let cosNL:number = sample.dot(state.getNormal());
                let fr:number = this.brdf(_in, sample.getShadowRay().getDirection(), onb);
                lr.madd((cosNL * fr), sample.getSpecularRadiance());
            }

            //  indirect lighting - specular
            if ((this.numRays > 0)) {
                let n:number = (state.getDepth() == 0);
                // TODO:Warning!!!, inline IF is not supported ?
                for (let i:number = 0; (i < n); i++) {
                    //  specular indirect lighting
                    let r1:number = state.getRandom(i, 0, n);
                    let r2:number = state.getRandom(i, 1, n);
                    let alphaRatio:number = (this.alphaY / this.alphaX);
                    let phi:number = 0;
                    if ((r1 < 0.25)) {
                        let val:number = (4 * r1);
                        phi = (<number>(Math.atan((alphaRatio * Math.tan((Math.PI / (2 * val)))))));
                    }
                    else if ((r1 < 0.5)) {
                        let val:number = (1 - (4 * (0.5 - r1)));
                        phi = (<number>(Math.atan((alphaRatio * Math.tan((Math.PI / (2 * val)))))));
                        phi = ((<number>(Math.PI)) - phi);
                    }
                    else if ((r1 < 0.75)) {
                        let val:number = (4
                        * (r1 - 0.5));
                        phi = (<number>(Math.atan((alphaRatio * Math.tan((Math.PI / (2 * val)))))));
                        phi = (phi + Math.PI);
                    }
                    else {
                        let val:number = (1 - (4 * (1 - r1)));
                        phi = (<number>(Math.atan((alphaRatio * Math.tan((Math.PI / (2 * val)))))));
                        phi = ((2 * (<number>(Math.PI)))
                        - phi);
                    }

                    let cosPhi:number = (<number>(Math.cos(phi)));
                    let sinPhi:number = (<number>(Math.sin(phi)));
                    let denom:number = (((cosPhi * cosPhi)
                    / (this.alphaX * this.alphaX))
                    + ((sinPhi * sinPhi)
                    / (this.alphaY * this.alphaY)));
                    let theta:number = (<number>(Math.atan(Math.sqrt(((Math.log((1 - r2)) / denom)
                    * -1)))));
                    let sinTheta:number = (<number>(Math.sin(theta)));
                    let cosTheta:number = (<number>(Math.cos(theta)));
                    let h:Vector3 = new Vector3();
                    h.x = (sinTheta * cosPhi);
                    h.y = (sinTheta * sinPhi);
                    h.z = cosTheta;
                    onb.transform(h);
                    let o:Vector3 = new Vector3();
                    let ih:number = Vector3.dot(h, _in);
                    o.x = ((2
                    * (ih * h.x))
                    - _in.x);
                    o.y = ((2
                    * (ih * h.y))
                    - _in.y);
                    o.z = ((2
                    * (ih * h.z))
                    - _in.z);
                    let no:number = onb.untransformZ(o);
                    let ni:number = onb.untransformZ(_in);
                    let w:number = (ih
                    * (cosTheta
                    * (cosTheta
                    * (cosTheta * (<number>(Math.sqrt(Math.abs((no / ni)))))))));
                    let r:Ray = new Ray(state.getPoint(), o);
                    lr.madd((w / n), state.traceGlossy(r, i));
                }

            }

            lr.mul(this.rhoS);
        }

        //  add diffuse contribution
        lr.add(state.diffuse(this.getDiffuse(state)));
        return lr;
    }

    scatterPhoton(state:ShadingState, power:Color) {
        //  make sure we are on the right side of the material
        state.faceforward();
        let d:Color = this.getDiffuse(state);
        state.storePhoton(state.getRay().getDirection(), power, d);
        let avgD:number = d.getAverage();
        let avgS:number = this.rhoS.getAverage();
        let rnd:number = state.getRandom(0, 0, 1);
        if ((rnd < avgD)) {
            //  photon is scattered diffusely
            power.mul(d).mul((1 / avgD));
            let onb:OrthoNormalBasis = state.getBasis();
            let u:number = (2
            * (Math.PI
            * (rnd / avgD)));
            let v:number = state.getRandom(0, 1, 1);
            let s:number = (<number>(Math.sqrt(v)));
            let s1:number = (<number>(Math.sqrt((1 - v))));
            let w:Vector3 = new Vector3(((<number>(Math.cos(u))) * s), ((<number>(Math.sin(u))) * s), s1);
            w = onb.transform(w, new Vector3());
            state.traceDiffusePhoton(new Ray(state.getPoint(), w), power);
        }
        else if ((rnd
            < (avgD + avgS))) {
            //  photon is scattered specularly
            power.mul(this.rhoS).mul((1 / avgS));
            let basis:OrthoNormalBasis = state.getBasis();
            let _in:Vector3 = state.getRay().getDirection().negate(new Vector3());
            let r1:number = (rnd / avgS);
            let r2:number = state.getRandom(0, 1, 1);
            let alphaRatio:number = (this.alphaY / this.alphaX);
            let phi:number = 0;
            if ((r1 < 0.25)) {
                let val:number = (4 * r1);
                phi = (<number>(Math.atan((alphaRatio * Math.tan((Math.PI / (2 * val)))))));
            }
            else if ((r1 < 0.5)) {
                let val:number = (1 - (4 * (0.5 - r1)));
                phi = (<number>(Math.atan((alphaRatio * Math.tan((Math.PI / (2 * val)))))));
                phi = ((<number>(Math.PI)) - phi);
            }
            else if ((r1 < 0.75)) {
                let val:number = (4
                * (r1 - 0.5));
                phi = (<number>(Math.atan((alphaRatio * Math.tan((Math.PI / (2 * val)))))));
                phi = (phi + Math.PI);
            }
            else {
                let val:number = (1 - (4 * (1 - r1)));
                phi = (<number>(Math.atan((alphaRatio * Math.tan((Math.PI / (2 * val)))))));
                phi = ((2 * (<number>(Math.PI)))
                - phi);
            }

            let cosPhi:number = (<number>(Math.cos(phi)));
            let sinPhi:number = (<number>(Math.sin(phi)));
            let denom:number = (((cosPhi * cosPhi)
            / (this.alphaX * this.alphaX))
            + ((sinPhi * sinPhi)
            / (this.alphaY * this.alphaY)));
            let theta:number = (<number>(Math.atan(Math.sqrt(((Math.log((1 - r2)) / denom)
            * -1)))));
            let sinTheta:number = (<number>(Math.sin(theta)));
            let cosTheta:number = (<number>(Math.cos(theta)));
            let h:Vector3 = new Vector3();
            h.x = (sinTheta * cosPhi);
            h.y = (sinTheta * sinPhi);
            h.z = cosTheta;
            basis.transform(h);
            let o:Vector3 = new Vector3();
            let ih:number = Vector3.dot(h, _in);
            o.x = ((2
            * (ih * h.x))
            - _in.x);
            o.y = ((2
            * (ih * h.y))
            - _in.y);
            o.z = ((2
            * (ih * h.z))
            - _in.z);
            let r:Ray = new Ray(state.getPoint(), o);
            state.traceReflectionPhoton(r, power);
        }

    }
}