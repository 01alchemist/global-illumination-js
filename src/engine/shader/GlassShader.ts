/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class GlassShader implements Shader {

    private eta: number;

    //  refraction index ratio
    private f0: number;

    //  fresnel normal incidence
    private color: Color;

    private absorbtionDistance: number;

    private absorbtionColor: Color;

    public constructor () {
        this.eta = 1.3;
        this.color = Color.WHITE;
        this.absorbtionDistance = 0;
        //  disabled by default
        this.absorbtionColor = Color.GRAY;
        //  50% absorbtion
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        this.color = pl.getColor("color", this.color);
        this.eta = pl.getFloat("eta", this.eta);
        this.f0 = ((1 - this.eta) / (1 + this.eta));
        this.f0 = (this.f0 * this.f0);
        this.absorbtionDistance = pl.getFloat("absorbtion.distance", this.absorbtionDistance);
        this.absorbtionColor = pl.getColor("absorbtion.color", this.absorbtionColor);
        return true;
    }

    public getRadiance(state: ShadingState): Color {
        if (!state.includeSpecular()) {
            return Color.BLACK;
        }

        let reflDir: Vector3 = new Vector3();
        let refrDir: Vector3 = new Vector3();
        state.faceforward();
        let cos: number = state.getCosND();
        let inside: boolean = state.isBehind();
        let neta: number = inside;
        // TODO: Warning!!!, inline IF is not supported ?
        let dn: number = (2 * cos);
        reflDir.x = ((dn * state.getNormal().x)
        + state.getRay().getDirection().x);
        reflDir.y = ((dn * state.getNormal().y)
        + state.getRay().getDirection().y);
        reflDir.z = ((dn * state.getNormal().z)
        + state.getRay().getDirection().z);
        //  refracted ray
        let arg: number = (1
        - (neta
        * (neta * (1
        - (cos * cos)))));
        let tir: boolean = (arg < 0);
        if (tir) {
            refrDir.z = 0;
        }
        else {
            let nK: number = ((neta * cos)
            - (<number>(Math.sqrt(arg))));
            refrDir.y = 0;
            refrDir.x = 0;
            refrDir.x = ((neta * state.getRay().dx)
            + (nK * state.getNormal().x));
            refrDir.y = ((neta * state.getRay().dy)
            + (nK * state.getNormal().y));
            refrDir.z = ((neta * state.getRay().dz)
            + (nK * state.getNormal().z));
        }

        //  compute Fresnel terms
        let cosTheta1: number = Vector3.dot(state.getNormal(), reflDir);
        let cosTheta2: number = (Vector3.dot(state.getNormal(), refrDir) * -1);
        let pPara: number = ((cosTheta1
        - (this.eta * cosTheta2))
        / (cosTheta1
        + (this.eta * cosTheta2)));
        let pPerp: number = (((this.eta * cosTheta1)
        - cosTheta2)
        / ((this.eta * cosTheta1)
        + cosTheta2));
        let kr: number = (0.5
        * ((pPara * pPara)
        + (pPerp * pPerp)));
        let kt: number = (1 - kr);
        let absorbtion: Color = null;
        if ((inside
            && (this.absorbtionDistance > 0))) {
            //  this ray is inside the object and leaving it
            //  compute attenuation that occured along the ray
            absorbtion = Color.mul(((state.getRay().getMax() / this.absorbtionDistance)
            * -1), this.absorbtionColor.copy().opposite()).exp();
            if (absorbtion.isBlack()) {
                return Color.BLACK;
            }

            //  nothing goes through
        }

        //  refracted ray
        let ret: Color = Color.black();
        if (!tir) {
            ret.madd(kt, state.traceRefraction(new Ray(state.getPoint(), refrDir), 0)).mul(this.color);
        }

        if ((!inside
            || tir)) {
            ret.add(Color.mul(kr, state.traceReflection(new Ray(state.getPoint(), reflDir), 0)).mul(this.color));
        }

        return (absorbtion != null);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    public scatterPhoton(state: ShadingState, power: Color) {
        let refr: Color = Color.mul((1 - this.f0), this.color);
        let refl: Color = Color.mul(this.f0, this.color);
        let avgR: number = refl.getAverage();
        let avgT: number = refr.getAverage();
        let rnd: number = state.getRandom(0, 0, 1);
        if ((rnd < avgR)) {
            state.faceforward();
            //  don't reflect internally
            if (state.isBehind()) {
                return;
            }

            //  photon is reflected
            let cos: number = state.getCosND();
            power.mul(refl).mul((1 / avgR));
            let dn: number = (2 * cos);
            let dir: Vector3 = new Vector3();
            dir.x = ((dn * state.getNormal().x)
            + state.getRay().getDirection().x);
            dir.y = ((dn * state.getNormal().y)
            + state.getRay().getDirection().y);
            dir.z = ((dn * state.getNormal().z)
            + state.getRay().getDirection().z);
            state.traceReflectionPhoton(new Ray(state.getPoint(), dir), power);
        }
        else if ((rnd
            < (avgR + avgT))) {
            state.faceforward();
            //  photon is refracted
            let cos: number = state.getCosND();
            let neta: number = state.isBehind();
            // TODO: Warning!!!, inline IF is not supported ?
            power.mul(refr).mul((1 / avgT));
            let wK: number = (neta * -1);
            let arg: number = (1
            - (neta
            * (neta * (1
            - (cos * cos)))));
            let dir: Vector3 = new Vector3();
            if ((state.isBehind()
                && (this.absorbtionDistance > 0))) {
                //  this ray is inside the object and leaving it
                //  compute attenuation that occured along the ray
                power.mul(Color.mul(((state.getRay().getMax() / this.absorbtionDistance)
                * -1), this.absorbtionColor.copy().opposite()).exp());
            }

            if ((arg < 0)) {
                //  TIR
                let dn: number = (2 * cos);
                dir.x = ((dn * state.getNormal().x)
                + state.getRay().getDirection().x);
                dir.y = ((dn * state.getNormal().y)
                + state.getRay().getDirection().y);
                dir.z = ((dn * state.getNormal().z)
                + state.getRay().getDirection().z);
                state.traceReflectionPhoton(new Ray(state.getPoint(), dir), power);
            }
            else {
                let nK: number = ((neta * cos)
                - (<number>(Math.sqrt(arg))));
                dir.x = (((wK * state.getRay().dx)
                * -1)
                + (nK * state.getNormal().x));
                dir.y = (((wK * state.getRay().dy)
                * -1)
                + (nK * state.getNormal().y));
                dir.z = (((wK * state.getRay().dz)
                * -1)
                + (nK * state.getNormal().z));
                state.traceRefractionPhoton(new Ray(state.getPoint(), dir), power);
            }

        }

    }
}