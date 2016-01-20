import {IFilter} from "./IFilter";
/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class BoxFilter implements IFilter{

    constructor(private size:number) {
    }
    getSize():number{
        return this.size;
    }

    get(x:number, y:number):number {
        return 1.0;
    }
}