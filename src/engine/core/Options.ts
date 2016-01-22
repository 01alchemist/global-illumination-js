/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export /* sealed */ class Options extends ParameterList implements RenderObject {

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        //  take all attributes, and update them into the current set
        for (let e: FastHashMap.Entry<String, Parameter> in pl.list) {
            list.put(e.getKey(), e.getValue());
            e.getValue().check();
        }

        return true;
    }
}