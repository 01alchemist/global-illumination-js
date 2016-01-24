/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class RegularSpectralCurve extends SpectralCurve {

    private spectrum:number[];

    private lambdaMin:number;

    private lambdaMax:number;

    private delta:number;

    private invDelta:number;

    constructor (spectrum:number[], lambdaMin:number, lambdaMax:number) {
        this.lambdaMin = this.lambdaMin;
        this.lambdaMax = this.lambdaMax;
        this.spectrum = this.spectrum;
        this.delta = ((this.lambdaMax - this.lambdaMin)
        / (this.spectrum.length - 1));
        this.invDelta = (1 / this.delta);
    }

    sample(lambda:number):number {
        //  reject wavelengths outside the valid range
        if (((lambda < this.lambdaMin)
            || (lambda > this.lambdaMax))) {
            return 0;
        }

        //  interpolate the two closest samples linearly
        let x:number = ((lambda - this.lambdaMin)
        * this.invDelta);
        let b0:number = (<number>(x));
        let b1:number = Math.min((b0 + 1), (this.spectrum.length - 1));
        let dx:number = (x - b0);
        return (((1 - dx)
        * this.spectrum[b0])
        + (dx * this.spectrum[b1]));
    }
}