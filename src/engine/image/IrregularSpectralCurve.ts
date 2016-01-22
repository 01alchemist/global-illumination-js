/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class IrregularSpectralCurve extends SpectralCurve {

    private wavelengths: number[];

    private amplitudes: number[];

    public constructor (wavelengths: number[], amplitudes: number[]) {
        this.wavelengths = this.wavelengths;
        this.amplitudes = this.amplitudes;
        if ((this.wavelengths.length != this.amplitudes.length)) {
            throw new RuntimeException(String.format("Error creating irregular spectral curve: %d wavelengths and %d amplitudes", this.wavelengths.length, this.amplitudes.length));
        }

        for (let i: number = 1; (i < this.wavelengths.length); i++) {
            if ((this.wavelengths[(i - 1)] >= this.wavelengths[i])) {
                throw new RuntimeException(String.format("Error creating irregular spectral curve: values are not sorted - error at index %d", i));
            }

        }

    }

    public sample(lambda: number): number {
        if ((this.wavelengths.length == 0)) {
            return 0;
        }

        //  no data
        if (((this.wavelengths.length == 1)
            || (lambda <= this.wavelengths[0]))) {
            return this.amplitudes[0];
        }

        if ((lambda >= this.wavelengths[(this.wavelengths.length - 1)])) {
            return this.amplitudes[(this.wavelengths.length - 1)];
        }

        for (let i: number = 1; (i < this.wavelengths.length); i++) {
            if ((lambda < this.wavelengths[i])) {
                let dx: number = ((lambda - this.wavelengths[(i - 1)])
                / (this.wavelengths[i] - this.wavelengths[(i - 1)]));
                return (((1 - dx)
                * this.amplitudes[(i - 1)])
                + (dx * this.amplitudes[i]));
            }

        }

        return this.amplitudes[(this.wavelengths.length - 1)];
    }
}