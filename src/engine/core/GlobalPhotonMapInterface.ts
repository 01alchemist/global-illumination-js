/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export interface GlobalPhotonMapInterface extends PhotonStore {

    getRadiance(p:Point3, n:Vector3):Color;
}