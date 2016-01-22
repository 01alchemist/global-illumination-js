/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ConstantSpectralCurve extends SpectralCurve {

    private amp: number;

    public constructor (amp: number) {
        this.amp = this.amp;
    }

    public sample(lambda: number): number {
        return this.amp;
    }
}