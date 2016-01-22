/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class BlackbodySpectrum extends SpectralCurve {

    private temp: number;

    public constructor (temp: number) {
        this.temp = this.temp;
    }

    public sample(lambda: number): number {
        let wavelength: number = (lambda * 1E-09);
        return (<number>(((3.74183E-16 * Math.pow(wavelength, -5))
        / (Math.exp((0.014388
        / (wavelength * this.temp))) - 1))));
    }
}