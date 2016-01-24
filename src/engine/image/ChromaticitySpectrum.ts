/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ChromaticitySpectrum extends SpectralCurve {

    private static S0Amplitudes:float[] = [0.04, 6.0, 29.6, 55.3,
        57.3, 61.8, 61.5, 68.8, 63.4, 65.8, 94.8, 104.8, 105.9,
        96.8, 113.9, 125.6, 125.5, 121.3, 121.3, 113.5, 113.1,
        110.8, 106.5, 108.8, 105.3, 104.4, 100.0, 96.0, 95.1,
        89.1, 90.5, 90.3, 88.4, 84.0, 85.1, 81.9, 82.6, 84.9,
        81.3, 71.9, 74.3, 76.4, 63.3, 71.7, 77.0, 65.2, 47.7,
        68.6, 65.0, 66.0, 61.0, 53.3, 58.9, 61.9];

    private static S1Amplitudes:float[] = [0.02, 4.5, 22.4, 42.0,
        40.6, 41.6, 38.0, 42.4, 38.5, 35.0, 43.4, 46.3, 43.9,
        37.1, 36.7, 35.9, 32.6, 27.9, 24.3, 20.1, 16.2, 13.2,
        8.6, 6.1, 4.2, 1.9, 0.0, -1.6, -3.5, -3.5, -5.8, -7.2,
        -8.6, -9.5, -10.9, -10.7, -12.0, -14.0, -13.6, -12.0,
        -13.3, -12.9, -10.6, -11.6, -12.2, -10.2, -7.8, -11.2,
        -10.4, -10.6, -9.7, -8.3, -9.3, -9.8];

    private static S2Amplitudes:float[] = [0.0, 2.0, 4.0, 8.5, 7.8,
        6.7, 5.3, 6.1, 3.0, 1.2, -1.1, -0.5, -0.7, -1.2, -2.6,
        -2.9, -2.8, -2.6, -2.6, -1.8, -1.5, -1.3, -1.2, -1.0,
        -0.5, -0.3, 0.0, 0.2, 0.5, 2.1, 3.2, 4.1, 4.7, 5.1, 6.7,
        7.3, 8.6, 9.8, 10.2, 8.3, 9.6, 8.5, 7.0, 7.6, 8.0, 6.7,
        5.2, 7.4, 6.8, 7.0, 6.4, 5.5, 6.1, 6.5];

    private static kS0Spectrum:RegularSpectralCurve = new RegularSpectralCurve(S0Amplitudes, 300, 830);

    private static kS1Spectrum:RegularSpectralCurve = new RegularSpectralCurve(S1Amplitudes, 300, 830);

    private static kS2Spectrum:RegularSpectralCurve = new RegularSpectralCurve(S2Amplitudes, 300, 830);

    private static S0xyz:XYZColor = kS0Spectrum.toXYZ();

    private static S1xyz:XYZColor = kS1Spectrum.toXYZ();

    private static S2xyz:XYZColor = kS2Spectrum.toXYZ();

    private M1:number;

    private M2:number;

    constructor(x:number, y:number) {
        this.M1 = ((((1.3515 - (1.7703 * x))
        * -1) + (5.9114 * y)) / (0.0241
        + ((0.2562 * x) - (0.7341 * y))));
        this.M2 = (((0.03 - (31.4424 * x)) + (30.0717 * y)) / (0.0241
        + ((0.2562 * x) - (0.7341 * y))));
    }

    sample(lambda:number):number {
        return (kS0Spectrum.sample(lambda)
        + ((this.M1 * kS1Spectrum.sample(lambda))
        + (this.M2 * kS2Spectrum.sample(lambda))));
    }

    static get(x:number, y:number):XYZColor {
        let M1:number = ((((1.3515 - (1.7703 * x))
        * -1) + (5.9114 * y)) / (0.0241
        + ((0.2562 * x) - (0.7341 * y))));
        let M2:number = (((0.03 - (31.4424 * x)) + (30.0717 * y)) / (0.0241
        + ((0.2562 * x) - (0.7341 * y))));
        let X:number = (S0xyz.getX()
        + ((this.M1 * S1xyz.getX())
        + (this.M2 * S2xyz.getX())));
        let Y:number = (S0xyz.getY()
        + ((this.M1 * S1xyz.getY())
        + (this.M2 * S2xyz.getY())));
        let Z:number = (S0xyz.getZ()
        + ((this.M1 * S1xyz.getZ())
        + (this.M2 * S2xyz.getZ())));
        return new XYZColor(X, Y, Z);
    }
}