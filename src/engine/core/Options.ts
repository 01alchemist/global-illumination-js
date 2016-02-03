import {FastHashMap} from "../utils/FastHashMap";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Options extends ParameterList implements RenderObject {

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        //  take all attributes, and update them into the current set
        for (let e:FastHashMap.Entry<string, Parameter> in pl.list) {
            list.put(e.getKey(), e.getValue());
            e.getValue().check();
        }

        return true;
    }
}