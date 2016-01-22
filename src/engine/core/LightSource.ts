/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export interface LightSource extends RenderObject {

    getNumSamples(): number;

    getSamples(state: ShadingState);

    getPhoton(randX1: number, randY1: number, randX2: number, randY2: number, p: Point3, dir: Vector3, power: Color);

    getPower(): number;
}