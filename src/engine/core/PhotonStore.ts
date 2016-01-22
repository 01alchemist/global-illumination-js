/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export interface PhotonStore {

    numEmit(): number;

    prepare(sceneBounds: BoundingBox);

    store(state: ShadingState, dir: Vector3, power: Color, diffuse: Color);

    init();

    allowDiffuseBounced(): boolean;

    allowReflectionBounced(): boolean;

    allowRefractionBounced(): boolean;
}