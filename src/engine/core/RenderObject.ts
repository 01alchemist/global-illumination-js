/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export interface RenderObject {

    update(pl: ParameterList, api: SunflowAPI): boolean;
}