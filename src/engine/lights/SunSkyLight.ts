/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */

export class SunSkyLight implements LightSource, PrimitiveList, Shader {

    // sunflow parameters
    private int numSkySamples;
    private OrthoNormalBasis basis;
    // parameters to the model
    private Vector3 sunDirWorld;
    private float turbidity;
    // derived quantities
    private Vector3 sunDir;
    private SpectralCurve sunSpectralRadiance;
    private Color sunColor;
    private float sunTheta;
    private zenithY:double, zenithx:double, zenithy:double;
    private perezY:double[] = new double[5];
    private perezx:double[] = new double[5];
    private perezy:double[] = new double[5];
    private jacobian:float;
    private colHistogram:float[];
    private imageHistogram:float[][];
    // constant data
    private static solAmplitudes:float[] = [ 165.5f, 162.3f, 211.2f,
    258.8f, 258.2f, 242.3f, 267.6f, 296.6f, 305.4f, 300.6f, 306.6f,
    288.3f, 287.1f, 278.2f, 271.0f, 272.3f, 263.6f, 255.0f, 250.6f,
    253.1f, 253.5f, 251.3f, 246.3f, 241.7f, 236.8f, 232.1f, 228.2f,
    223.4f, 219.7f, 215.3f, 211.0f, 207.3f, 202.4f, 198.7f, 194.3f,
    190.7f, 186.3f, 182.6f ];
    private static RegularSpectralCurve solCurve = new RegularSpectralCurve(solAmplitudes, 380, 750);
    private static float[] k_oWavelengths = { 300, 305, 310, 315, 320,
    325, 330, 335, 340, 345, 350, 355, 445, 450, 455, 460, 465, 470,
    475, 480, 485, 490, 495, 500, 505, 510, 515, 520, 525, 530, 535,
    540, 545, 550, 555, 560, 565, 570, 575, 580, 585, 590, 595, 600,
    605, 610, 620, 630, 640, 650, 660, 670, 680, 690, 700, 710, 720,
    730, 740, 750, 760, 770, 780, 790, };
    private static float[] k_oAmplitudes = { 10.0f, 4.8f, 2.7f, 1.35f,
    .8f, .380f, .160f, .075f, .04f, .019f, .007f, .0f, .003f, .003f,
    .004f, .006f, .008f, .009f, .012f, .014f, .017f, .021f, .025f,
    .03f, .035f, .04f, .045f, .048f, .057f, .063f, .07f, .075f, .08f,
    .085f, .095f, .103f, .110f, .12f, .122f, .12f, .118f, .115f, .12f,
    .125f, .130f, .12f, .105f, .09f, .079f, .067f, .057f, .048f, .036f,
    .028f, .023f, .018f, .014f, .011f, .010f, .009f, .007f, .004f, .0f,
    .0f };
    private static float[] k_gWavelengths = { 759, 760, 770, 771 };
    private static float[] k_gAmplitudes = { 0, 3.0f, 0.210f, 0 };
    private static float[] k_waWavelengths = { 689, 690, 700, 710, 720,
    730, 740, 750, 760, 770, 780, 790, 800 };
    private static float[] k_waAmplitudes = { 0f, 0.160e-1f, 0.240e-1f,
    0.125e-1f, 0.100e+1f, 0.870f, 0.610e-1f, 0.100e-2f, 0.100e-4f,
    0.100e-4f, 0.600e-3f, 0.175e-1f, 0.360e-1f };

    private static k_oCurve: IrregularSpectralCurve = new IrregularSpectralCurve(k_oWavelengths, k_oAmplitudes);

    private static k_gCurve: IrregularSpectralCurve = new IrregularSpectralCurve(k_gWavelengths, k_gAmplitudes);

    private static k_waCurve: IrregularSpectralCurve = new IrregularSpectralCurve(k_waWavelengths, k_waAmplitudes);

    public constructor () {
        this.numSkySamples = 64;
        this.sunDirWorld = new Vector3(1, 1, 1);
        this.turbidity = 6;
        this.basis = OrthoNormalBasis.makeFromWV(new Vector3(0, 0, 1), new Vector3(0, 1, 0));
        this.initSunSky();
    }

    private computeAttenuatedSunlight(theta: number, turbidity: number): SpectralCurve {
        let data: number[] = new Array(91);
        //  holds the sunsky curve data
        let alpha: number = 1.3;
        let lozone: number = 0.35;
        let w: number = 2;
        let beta: number = ((0.0460836582205 * this.turbidity)
        - 0.04586025928522);
        //  Relative optical mass
        let m: number = (1
        / (Math.cos(theta) + (0.00094 * Math.pow((1.6386 - theta), -1.253))));
        for (let lambda: number = 350; (lambda <= 800); i++) {
        }

        let i: number = 0;
        lambda += 5;
        //  Rayleigh scattering
        let tauR: number = Math.exp(((m * (0.008735 * Math.pow(((<number>(lambda)) / 1000), -4.08)))
        * -1));
        //  Aerosol (water + dust) attenuation
        let tauA: number = Math.exp(((m
        * (beta * Math.pow(((<number>(lambda)) / 1000), (alpha * -1))))
        * -1));
        //  Attenuation due to ozone absorption
        let tauO: number = Math.exp(((m
        * (k_oCurve.sample(lambda) * lozone))
        * -1));
        //  Attenuation due to mixed gases absorption
        let tauG: number = Math.exp(((1.41
        * (k_gCurve.sample(lambda)
        * (m / Math.pow((1 + (118.93
        * (k_gCurve.sample(lambda) * m))), 0.45))))
        * -1));
        //  Attenuation due to water vapor absorption
        let tauWA: number = Math.exp(((0.2385
        * (k_waCurve.sample(lambda)
        * (w
        * (m / Math.pow((1 + (20.07
        * (k_waCurve.sample(lambda)
        * (w * m)))), 0.45)))))
        * -1));
        //  100.0 comes from solAmplitudes begin in wrong units.
        let amp: number = (solCurve.sample(lambda)
        * (tauR
        * (tauA
        * (tauO
        * (tauG * tauWA)))));
        data[i] = (<number>(amp));
        return new RegularSpectralCurve(data, 350, 800);
    }

    private perezFunction(lam: number[], theta: number, gamma: number, lvz: number): number {
        let den: number = ((1
        + (lam[0] * Math.exp(lam[1]))) * (1
        + ((lam[2] * Math.exp((lam[3] * this.sunTheta)))
        + (lam[4]
        * (Math.cos(this.sunTheta) * Math.cos(this.sunTheta))))));
        let num: number = ((1
        + (lam[0] * Math.exp((lam[1] / Math.cos(theta))))) * (1
        + ((lam[2] * Math.exp((lam[3] * gamma)))
        + (lam[4]
        * (Math.cos(gamma) * Math.cos(gamma))))));
        return (lvz
        * (num / den));
    }

    private initSunSky() {
        //  perform all the required initialization of constants
        this.sunDirWorld.normalize();
        this.sunDir = this.basis.untransform(this.sunDirWorld, new Vector3());
        this.sunDir.normalize();
        this.sunTheta = (<number>(Math.acos(MathUtils.clamp(this.sunDir.z, -1, 1))));
        if ((this.sunDir.z > 0)) {
            this.sunSpectralRadiance = this.computeAttenuatedSunlight(this.sunTheta, this.turbidity);
            //  produce color suitable for rendering
            this.sunColor = RGBSpace.SRGB.convertXYZtoRGB(this.sunSpectralRadiance.toXYZ().mul(0.0001)).constrainRGB();
        }
        else {
            this.sunSpectralRadiance = new ConstantSpectralCurve(0);
        }

        //  sunSolidAngle = (float) (0.25 * Math.PI * 1.39 * 1.39 / (150 * 150));
        let theta2: number = (this.sunTheta * this.sunTheta);
        let theta3: number = (this.sunTheta * theta2);
        let T: number = this.turbidity;
        let T2: number = (this.turbidity * this.turbidity);
        let chi: number = (((4 / 9)
        - (T / 120))
        * (Math.PI - (2 * this.sunTheta)));
        this.zenithY = (((((4.0453 * T)
        - 4.971)
        * Math.tan(chi)) - (0.2155 * T))
        + 2.4192);
        this.zenithY = (this.zenithY * 1000);
        this.zenithx = (((((0.00165 * theta3) - (0.00374 * theta2))
        + ((0.00208 * this.sunTheta)
        + 0))
        * T2)
        + (((((0.02902 * theta3)
        * -1)
        + (((0.06377 * theta2) - (0.03202 * this.sunTheta))
        + 0.00394))
        * T)
        + (((0.11693 * theta3) - (0.21196 * theta2))
        + ((0.06052 * this.sunTheta)
        + 0.25885))));
        this.zenithy = (((((0.00275 * theta3) - (0.0061 * theta2))
        + ((0.00316 * this.sunTheta)
        + 0))
        * T2)
        + (((((0.04212 * theta3)
        * -1)
        + (((0.0897 * theta2) - (0.04153 * this.sunTheta))
        + 0.00515))
        * T)
        + (((0.15346 * theta3) - (0.26756 * theta2))
        + ((0.06669 * this.sunTheta)
        + 0.26688))));
        this.perezY[0] = ((0.17872 * T)
        - 1.46303);
        this.perezY[1] = (((0.3554 * T)
        * -1)
        + 0.42749);
        this.perezY[2] = (((0.02266 * T)
        * -1)
        + 5.32505);
        this.perezY[3] = ((0.12064 * T)
        - 2.57705);
        this.perezY[4] = (((0.06696 * T)
        * -1)
        + 0.37027);
        this.perezx[0] = (((0.01925 * T)
        - 0.25922)
        * -1);
        this.perezx[1] = (((0.06651 * T)
        * -1)
        + 0.00081);
        this.perezx[2] = (((0.00041 * T)
        * -1)
        + 0.21247);
        this.perezx[3] = (((0.06409 * T)
        - 0.89887)
        * -1);
        this.perezx[4] = (((0.00325 * T)
        * -1)
        + 0.04517);
        this.perezy[0] = (((0.01669 * T)
        - 0.26078)
        * -1);
        this.perezy[1] = (((0.09495 * T)
        * -1)
        + 0.00921);
        this.perezy[2] = (((0.00792 * T)
        * -1)
        + 0.21023);
        this.perezy[3] = (((0.04405 * T)
        - 1.65369)
        * -1);
        this.perezy[4] = (((0.01092 * T)
        * -1)
        + 0.05291);
        let h: number = 32;
        let w: number = 32;
        this.imageHistogram = new Array(w);
        h;
        this.colHistogram = new Array(w);
        let du: number = (1 / w);
        let dv: number = (1 / h);
        for (let x: number = 0; (x < w); x++) {
            for (let y: number = 0; (y < h); y++) {
                let u: number = ((x + 0.5)
                * du);
                let v: number = ((y + 0.5)
                * dv);
                let c: Color = this.getSkyRGB(this.getDirection(u, v));
                this.imageHistogram[x][y] = (c.getLuminance() * (<number>(Math.sin((Math.PI * v)))));
                if ((y > 0)) {
                    this.imageHistogram[x][y] = (this.imageHistogram[x][y] + this.imageHistogram[x][(y - 1)]);
                }

            }

            this.colHistogram[x] = this.imageHistogram[x][(h - 1)];
            if ((x > 0)) {
                this.colHistogram[x] = (this.colHistogram[x] + this.colHistogram[(x - 1)]);
            }

            for (let y: number = 0; (y < h); y++) {
            }

            this.imageHistogram[x][(h - 1)];
        }

        for (let x: number = 0; (x < w); x++) {
        }

        this.colHistogram[(w - 1)];
        this.jacobian = ((<number>((2
        * (Math.PI * Math.PI))))
        / (w * h));
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        let up: Vector3 = pl.getVector("up", null);
        let east: Vector3 = pl.getVector("east", null);
        if (((up != null)
            && (east != null))) {
            this.basis = OrthoNormalBasis.makeFromWV(up, east);
        }
        else if ((up != null)) {
            this.basis = OrthoNormalBasis.makeFromW(up);
        }

        this.numSkySamples = pl.getInt("samples", this.numSkySamples);
        this.sunDirWorld = pl.getVector("sundir", this.sunDirWorld);
        this.turbidity = pl.getFloat("turbidity", this.turbidity);
        //  recompute model
        this.initSunSky();
        return true;
    }

    public init(name: String, api: SunflowAPI) {
        //  register this object with the api properly
        api.geometry(name, this);
        api.shader((name + ".shader"), this);
        api.parameter("shaders", (name + ".shader"));
        api.instance((name + ".instance"), name);
        api.light((name + ".light"), this);
    }

    private getSkyRGB(dir: Vector3): Color {
        if ((dir.z < 0)) {
            return Color.BLACK;
        }

        if ((dir.z < 0.001)) {
            dir.z = 0.001;
        }

        dir.normalize();
        let theta: number = Math.acos(MathUtils.clamp(dir.z, -1, 1));
        let gamma: number = Math.acos(MathUtils.clamp(Vector3.dot(dir, this.sunDir), -1, 1));
        let x: number = this.perezFunction(this.perezx, theta, gamma, this.zenithx);
        let y: number = this.perezFunction(this.perezy, theta, gamma, this.zenithy);
        let Y: number = (this.perezFunction(this.perezY, theta, gamma, this.zenithY) * 0.0001);
        let c: XYZColor = ChromaticitySpectrum.get((<number>(x)), (<number>(y)));
        //  XYZColor c = new ChromaticitySpectrum((float) x, (float) y).toXYZ();
        let X: number = (<number>((c.getX()
        * (Y / c.getY()))));
        let Z: number = (<number>((c.getZ()
        * (Y / c.getY()))));
        return RGBSpace.SRGB.convertXYZtoRGB(X, (<number>(Y)), Z);
    }

    public getNumSamples(): number {
        return (1 + this.numSkySamples);
    }

    public getPhoton(randX1: number, randY1: number, randX2: number, randY2: number, p: Point3, dir: Vector3, power: Color) {
        //  FIXME: not implemented
    }

    public getPower(): number {
        return 0;
    }

    public getSamples(state: ShadingState) {
        if (((Vector3.dot(this.sunDirWorld, state.getGeoNormal()) > 0)
            && (Vector3.dot(this.sunDirWorld, state.getNormal()) > 0))) {
            let dest: LightSample = new LightSample();
            dest.setShadowRay(new Ray(state.getPoint(), this.sunDirWorld));
            dest.getShadowRay().setMax(Float.MAX_VALUE);
            dest.setRadiance(this.sunColor, this.sunColor);
            dest.traceShadow(state);
            state.addSample(dest);
        }

        let n: number = (state.getDiffuseDepth() > 0);
        // TODO: Warning!!!, inline IF is not supported ?
        for (let i: number = 0; (i < n); i++) {
            //  random offset on unit square, we use the infinite version of
            //  getRandom because the light sampling is adaptive
            let randX: number = state.getRandom(i, 0, n);
            let randY: number = state.getRandom(i, 1, n);
            let x: number = 0;
            while (((randX >= this.colHistogram[x])
            && (x
            < (this.colHistogram.length - 1)))) {
                x++;
            }

            let rowHistogram: number[] = this.imageHistogram[x];
            let y: number = 0;
            while (((randY >= rowHistogram[y])
            && (y
            < (rowHistogram.length - 1)))) {
                y++;
            }

            //  sample from (x, y)
            let u: number = (<number>((x == 0)));
            // TODO: Warning!!!, inline IF is not supported ?
            let v: number = (<number>((y == 0)));
            // TODO: Warning!!!, inline IF is not supported ?
            let px: number = (x == 0);
            // TODO: Warning!!!, inline IF is not supported ?
            let py: number = (y == 0);
            // TODO: Warning!!!, inline IF is not supported ?
            let su: number = ((x + u)
            / this.colHistogram.length);
            let sv: number = ((y + v)
            / rowHistogram.length);
            let invP: number = ((<number>(Math.sin((sv * Math.PI))))
            * (this.jacobian
            / (n
            * (px * py))));
            let localDir: Vector3 = this.getDirection(su, sv);
            let dir: Vector3 = this.basis.transform(localDir, new Vector3());
            if (((Vector3.dot(dir, state.getGeoNormal()) > 0)
                && (Vector3.dot(dir, state.getNormal()) > 0))) {
                let dest: LightSample = new LightSample();
                dest.setShadowRay(new Ray(state.getPoint(), dir));
                dest.getShadowRay().setMax(Float.MAX_VALUE);
                let radiance: Color = this.getSkyRGB(localDir);
                dest.setRadiance(radiance, radiance);
                dest.getDiffuseRadiance().mul(invP);
                dest.getSpecularRadiance().mul(invP);
                dest.traceShadow(state);
                state.addSample(dest);
            }

        }

    }

    public getBakingPrimitives(): PrimitiveList {
        return null;
    }

    public getNumPrimitives(): number {
        return 1;
    }

    public getPrimitiveBound(primID: number, i: number): number {
        return 0;
    }

    public getWorldBounds(o2w: Matrix4): BoundingBox {
        return null;
    }

    public intersectPrimitive(r: Ray, primID: number, state: IntersectionState) {
        if ((r.getMax() == Float.POSITIVE_INFINITY)) {
            state.setIntersection(0, 0, 0);
        }

    }

    public prepareShadingState(state: ShadingState) {
        if (state.includeLights()) {
            state.setShader(this);
        }

    }

    public getRadiance(state: ShadingState): Color {
        return this.getSkyRGB(this.basis.untransform(state.getRay().getDirection())).constrainRGB();
    }

    public scatterPhoton(state: ShadingState, power: Color) {
        //  let photon escape
    }

    private getDirection(u: number, v: number): Vector3 {
        let dest: Vector3 = new Vector3();
        let theta: number = 0;
        let phi: number = 0;
        theta = (u * (2 * Math.PI));
        phi = (v * Math.PI);
        let sin_phi: number = Math.sin(phi);
        dest.x = (<number>(((sin_phi * Math.cos(theta))
        * -1)));
        dest.y = (<number>(Math.cos(phi)));
        dest.z = (<number>((sin_phi * Math.sin(theta))));
        return dest;
    }
}