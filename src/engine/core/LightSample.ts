/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class LightSample {

    private shadowRay: Ray;

    //  ray to be used to evaluate if the point is in
    //  shadow
    private ldiff: Color;

    private lspec: Color;

    next: LightSample;

    //  pointer to next item in a linked list of samples
    public constructor () {
        this.lspec = null;
        this.ldiff = null;
        this.ldiff = null;
        this.shadowRay = null;
        this.next = null;
    }

    isValid(): boolean {
        return ((this.ldiff != null)
        && ((this.lspec != null)
        && (this.shadowRay != null)));
    }

    public setShadowRay(shadowRay: Ray) {
        this.shadowRay = this.shadowRay;
    }

    public traceShadow(state: ShadingState) {
        let opacity: Color = state.traceShadow(this.shadowRay);
        Color.blend(this.ldiff, Color.BLACK, opacity, this.ldiff);
        Color.blend(this.lspec, Color.BLACK, opacity, this.lspec);
    }

    public getShadowRay(): Ray {
        return this.shadowRay;
    }

    public getDiffuseRadiance(): Color {
        return this.ldiff;
    }

    public getSpecularRadiance(): Color {
        return this.lspec;
    }

    public setRadiance(d: Color, s: Color) {
        this.ldiff = d.copy();
        this.lspec = s.copy();
    }

    public dot(v: Vector3): number {
        return this.shadowRay.dot(v);
    }
}