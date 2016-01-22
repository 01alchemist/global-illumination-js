/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export /* sealed */ class RGBSpace {

    public static ADOBE: RGBSpace = new RGBSpace(0.64, 0.33, 0.21, 0.71, 0.15, 0.06, 0.31271, 0.32902, 2.2, 0);

    public static APPLE: RGBSpace = new RGBSpace(0.625, 0.34, 0.28, 0.595, 0.155, 0.07, 0.31271, 0.32902, 1.8, 0);

    public static NTSC: RGBSpace = new RGBSpace(0.67, 0.33, 0.21, 0.71, 0.14, 0.08, 0.3101, 0.3162, (20 / 9), 0.018);

    public static HDTV: RGBSpace = new RGBSpace(0.64, 0.33, 0.3, 0.6, 0.15, 0.06, 0.31271, 0.32902, (20 / 9), 0.018);

    public static SRGB: RGBSpace = new RGBSpace(0.64, 0.33, 0.3, 0.6, 0.15, 0.06, 0.31271, 0.32902, 2.4, 0.00304);

    public static CIE: RGBSpace = new RGBSpace(0.735, 0.265, 0.274, 0.717, 0.167, 0.009, (1 / 3), (1 / 3), 2.2, 0);

    public static EBU: RGBSpace = new RGBSpace(0.64, 0.33, 0.29, 0.6, 0.15, 0.06, 0.31271, 0.32902, (20 / 9), 0.018);

    public static SMPTE_C: RGBSpace = new RGBSpace(0.63, 0.34, 0.31, 0.595, 0.155, 0.07, 0.31271, 0.32902, (20 / 9), 0.018);

    public static SMPTE_240M: RGBSpace = new RGBSpace(0.63, 0.34, 0.31, 0.595, 0.155, 0.07, 0.31271, 0.32902, (20 / 9), 0.018);

    public static WIDE_GAMUT: RGBSpace = new RGBSpace(0.7347, 0.2653, 0.1152, 0.8264, 0.1566, 0.0177, 0.3457, 0.3585, 2.2, 0);

    private gamma: number;

    private breakPoint: number;

    private slope: number;

    private slopeMatch: number;

    private segmentOffset: number;

    private xr: number;

    private yr: number;

    private zr: number;

    private xg: number;

    private yg: number;

    private zg: number;

    private xb: number;

    private yb: number;

    private zb: number;

    private xw: number;

    private yw: number;

    private zw: number;

    private rx: number;

    private ry: number;

    private rz: number;

    private gx: number;

    private gy: number;

    private gz: number;

    private bx: number;

    private by: number;

    private bz: number;

    private rw: number;

    private gw: number;

    private bw: number;

    private GAMMA_CURVE: number[];

    private INV_GAMMA_CURVE: number[];

    public constructor (xRed: number, yRed: number, xGreen: number, yGreen: number, xBlue: number, yBlue: number, xWhite: number, yWhite: number, gamma: number, breakPoint: number) {
        this.gamma = this.gamma;
        this.breakPoint = this.breakPoint;
        if ((this.breakPoint > 0)) {
            this.slope = (1
            / (((this.gamma / (<number>(Math.pow(this.breakPoint, ((1 / this.gamma)
            - 1)))))
            - (this.gamma * this.breakPoint))
            + this.breakPoint));
            this.slopeMatch = (this.gamma
            * (this.slope / (<number>(Math.pow(this.breakPoint, ((1 / this.gamma)
            - 1))))));
            this.segmentOffset = ((this.slopeMatch * (<number>(Math.pow(this.breakPoint, (1 / this.gamma)))))
            - (this.slope * this.breakPoint));
        }
        else {
            this.slope = 1;
            this.slopeMatch = 1;
            this.segmentOffset = 0;
        }

        //  prepare gamma curves
        this.GAMMA_CURVE = new Array(256);
        this.INV_GAMMA_CURVE = new Array(256);
        for (let i: number = 0; (i < 256); i++) {
            let c: number = (i / 255);
            this.GAMMA_CURVE[i] = MathUtils.clamp((<number>(((this.gammaCorrect(c) * 255)
            + 0.5))), 0, 255);
            this.INV_GAMMA_CURVE[i] = MathUtils.clamp((<number>(((this.ungammaCorrect(c) * 255)
            + 0.5))), 0, 255);
        }

        let xr: number = xRed;
        let yr: number = yRed;
        let zr: number = (1
        - (this.xr + this.yr));
        let xg: number = xGreen;
        let yg: number = yGreen;
        let zg: number = (1
        - (this.xg + this.yg));
        let xb: number = xBlue;
        let yb: number = yBlue;
        let zb: number = (1
        - (this.xb + this.yb));
        this.xw = xWhite;
        this.yw = yWhite;
        this.zw = (1
        - (this.xw + this.yw));
        //  xyz -> rgb matrix, before scaling to white.
        let rx: number = ((this.yg * this.zb)
        - (this.yb * this.zg));
        let ry: number = ((this.xb * this.zg)
        - (this.xg * this.zb));
        let rz: number = ((this.xg * this.yb)
        - (this.xb * this.yg));
        let gx: number = ((this.yb * this.zr)
        - (this.yr * this.zb));
        let gy: number = ((this.xr * this.zb)
        - (this.xb * this.zr));
        let gz: number = ((this.xb * this.yr)
        - (this.xr * this.yb));
        let bx: number = ((this.yr * this.zg)
        - (this.yg * this.zr));
        let by: number = ((this.xg * this.zr)
        - (this.xr * this.zg));
        let bz: number = ((this.xr * this.yg)
        - (this.xg * this.yr));
        //  White scaling factors
        //  Dividing by yw scales the white luminance to unity, as conventional
        this.rw = (((this.rx * this.xw)
        + ((this.ry * this.yw)
        + (this.rz * this.zw)))
        / this.yw);
        this.gw = (((this.gx * this.xw)
        + ((this.gy * this.yw)
        + (this.gz * this.zw)))
        / this.yw);
        this.bw = (((this.bx * this.xw)
        + ((this.by * this.yw)
        + (this.bz * this.zw)))
        / this.yw);
        //  xyz -> rgb matrix, correctly scaled to white
        this.rx = (this.rx / this.rw);
        this.ry = (this.ry / this.rw);
        this.rz = (this.rz / this.rw);
        this.gx = (this.gx / this.gw);
        this.gy = (this.gy / this.gw);
        this.gz = (this.gz / this.gw);
        this.bx = (this.bx / this.bw);
        this.by = (this.by / this.bw);
        this.bz = (this.bz / this.bw);
        //  invert matrix again to get proper rgb -> xyz matrix
        let s: number = (1
        / (((this.rx
        * ((this.gy * this.bz)
        - (this.by * this.gz)))
        - (this.ry
        * ((this.gx * this.bz)
        - (this.bx * this.gz))))
        + (this.rz
        * ((this.gx * this.by)
        - (this.bx * this.gy)))));
        this.xr = (s
        * ((this.gy * this.bz)
        - (this.gz * this.by)));
        this.xg = (s
        * ((this.rz * this.by)
        - (this.ry * this.bz)));
        this.xb = (s
        * ((this.ry * this.gz)
        - (this.rz * this.gy)));
        this.yr = (s
        * ((this.gz * this.bx)
        - (this.gx * this.bz)));
        this.yg = (s
        * ((this.rx * this.bz)
        - (this.rz * this.bx)));
        this.yb = (s
        * ((this.rz * this.gx)
        - (this.rx * this.gz)));
        this.zr = (s
        * ((this.gx * this.by)
        - (this.gy * this.bx)));
        this.zg = (s
        * ((this.ry * this.bx)
        - (this.rx * this.by)));
        this.zb = (s
        * ((this.rx * this.gy)
        - (this.ry * this.gx)));
    }

    public convertXYZtoRGB(c: XYZColor): Color {
        return this.convertXYZtoRGB(c.getX(), c.getY(), c.getZ());
    }

    public convertXYZtoRGB(X: number, Y: number, Z: number): Color {
        let r: number = ((this.rx * X)
        + ((this.ry * Y)
        + (this.rz * Z)));
        let g: number = ((this.gx * X)
        + ((this.gy * Y)
        + (this.gz * Z)));
        let b: number = ((this.bx * X)
        + ((this.by * Y)
        + (this.bz * Z)));
        return new Color(r, g, b);
    }

    public convertRGBtoXYZ(c: Color): XYZColor {
        let rgb: number[] = c.getRGB();
        let X: number = ((this.xr * rgb[0])
        + ((this.xg * rgb[1])
        + (this.xb * rgb[2])));
        let Y: number = ((this.yr * rgb[0])
        + ((this.yg * rgb[1])
        + (this.yb * rgb[2])));
        let Z: number = ((this.zr * rgb[0])
        + ((this.zg * rgb[1])
        + (this.zb * rgb[2])));
        return new XYZColor(X, Y, Z);
    }

    public insideGamut(r: number, g: number, b: number): boolean {
        return ((r >= 0)
        && ((g >= 0)
        && (b >= 0)));
    }

    public gammaCorrect(v: number): number {
        if ((v <= 0)) {
            return 0;
        }
        else if ((v >= 1)) {
            return 1;
        }
        else if ((v <= this.breakPoint)) {
            return (this.slope * v);
        }
        else {
            return ((this.slopeMatch * (<number>(Math.pow(v, (1 / this.gamma)))))
            - this.segmentOffset);
        }

    }

    public ungammaCorrect(vp: number): number {
        if ((vp <= 0)) {
            return 0;
        }
        else if ((vp >= 1)) {
            return 1;
        }
        else if ((vp
            <= (this.breakPoint * this.slope))) {
            return (vp / this.slope);
        }
        else {
            return (<number>(Math.pow(((vp + this.segmentOffset)
            / this.slopeMatch), this.gamma)));
        }

    }

    public rgbToNonLinear(rgb: number): number {
        //  gamma correct 24bit rgb value via tables
        let rp: number = this.GAMMA_CURVE[((rgb + 16)
        & 255)];
        let gp: number = this.GAMMA_CURVE[((rgb + 8)
        & 255)];
        let bp: number = this.GAMMA_CURVE[(rgb & 255)];
        return ((rp + 16)
        | ((gp + 8)
        | bp));
    }

    public rgbToLinear(rgb: number): number {
        //  convert a packed RGB triplet to a linearized
        //  one by applying the proper LUT
        let rp: number = this.INV_GAMMA_CURVE[((rgb + 16)
        & 255)];
        let gp: number = this.INV_GAMMA_CURVE[((rgb + 8)
        & 255)];
        let bp: number = this.INV_GAMMA_CURVE[(rgb & 255)];
        return ((rp + 16)
        | ((gp + 8)
        | bp));
    }

    public toString(): String {
        let info: String = "Gamma function parameters:
        ";
        info = (info + String.format("  * Gamma:          %7.4f
        ", this.gamma));
        info = (info + String.format("  * Breakpoint:     %7.4f
        ", this.breakPoint));
        info = (info + String.format("  * Slope:          %7.4f
        ", this.slope));
        info = (info + String.format("  * Slope Match:    %7.4f
        ", this.slopeMatch));
        info = (info + String.format("  * Segment Offset: %7.4f
        ", this.segmentOffset));
        info += "XYZ -> RGB Matrix:
        ";
        info = (info + String.format("| %7.4f %7.4f %7.4f|
        ", this.rx, this.ry, this.rz));
        info = (info + String.format("| %7.4f %7.4f %7.4f|
        ", this.gx, this.gy, this.gz));
        info = (info + String.format("| %7.4f %7.4f %7.4f|
        ", this.bx, this.by, this.bz));
        info += "RGB -> XYZ Matrix:
        ";
        info = (info + String.format("| %7.4f %7.4f %7.4f|
        ", this.xr, this.xg, this.xb));
        info = (info + String.format("| %7.4f %7.4f %7.4f|
        ", this.yr, this.yg, this.yb));
        info = (info + String.format("| %7.4f %7.4f %7.4f|
        ", this.zr, this.zg, this.zb));
        return info;
    }

    public static main(args: String[]) {
        System.out.println(SRGB.toString());
        System.out.println(HDTV.toString());
        System.out.println(WIDE_GAMUT.toString());
    }
}