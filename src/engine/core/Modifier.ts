/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export interface Modifier extends RenderObject {

    modify(state: ShadingState);
}