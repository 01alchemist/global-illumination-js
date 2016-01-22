/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export interface SceneParser {

    parse(filename: String, api: SunflowAPI): boolean;
}
