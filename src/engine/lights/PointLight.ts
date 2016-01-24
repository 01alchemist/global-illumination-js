/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class PointLight implements LightSource {

    private lightPoint:Point3;

    private power:Color;

    constructor () {
        this.lightPoint = new Point3(0, 0, 0);
        this.power = Color.WHITE;
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        this.lightPoint = pl.getPoint("center", this.lightPoint);
        this.power = pl.getColor("power", this.power);
        return true;
    }

    getNumSamples():number {
        return 1;
    }

    getSamples(state:ShadingState) {
        let d:Vector3 = Point3.sub(this.lightPoint, state.getPoint(), new Vector3());
        if (((Vector3.dot(d, state.getNormal()) > 0)
            && (Vector3.dot(d, state.getGeoNormal()) > 0))) {
            let dest:LightSample = new LightSample();
            //  prepare shadow ray
            dest.setShadowRay(new Ray(state.getPoint(), this.lightPoint));
            let scale:number = (1 / (<number>((4
            * (Math.PI * this.lightPoint.distanceToSquared(state.getPoint()))))));
            dest.setRadiance(this.power, this.power);
            dest.getDiffuseRadiance().mul(scale);
            dest.getSpecularRadiance().mul(scale);
            dest.traceShadow(state);
            state.addSample(dest);
        }

    }

    getPhoton(randX1:number, randY1:number, randX2:number, randY2:number, p:Point3, dir:Vector3, power:Color) {
        p.set(this.lightPoint);
        let phi:number = (<number>((2
        * (Math.PI * randX1))));
        let s:number = (<number>(Math.sqrt((randY1 * (1 - randY1)))));
        dir.x = ((<number>(Math.cos(phi))) * s);
        dir.y = ((<number>(Math.sin(phi))) * s);
        dir.z = (<number>((1 - (2 * randY1))));
        this.power.set(this.power);
    }

    getPower():number {
        return this.power.getLuminance();
    }
}