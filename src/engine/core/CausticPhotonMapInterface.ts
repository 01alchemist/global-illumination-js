/**
 * Created by Nidin Vinayakan on 22/1/2016.
 * This class is a generic interface to caustic photon mapping capabilities.
 */
export interface CausticPhotonMapInterface extends PhotonStore {
    /**
     * Retrieve caustic photons at the specified shading location and add them
     * as diffuse light samples.
     *
     * @param state
     */
    getSamples(state: ShadingState);
}