/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export interface Shader extends RenderObject {

    getRadiance(state:ShadingState):Color;

    scatterPhoton(state:ShadingState, power:Color);
}