import {IFilter} from "./IFilter";
/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class CatmullRomFilter implements IFilter{

    constructor() {

    }
    getSize():number{
        return 4.0;
    }
    
    get(x:number, y:number):number{
        return CatmullRomFilter.catrom1d(x) * CatmullRomFilter.catrom1d(y);
    }
    
    static catrom1d(value:number) {
        value = Math.abs(value);
        var x2:number = value * value;
        var x3:number = value * x2;
        if (value >= 2)
            return 0;
        if (value < 1)
            return 3 * x3 - 5 * x2 + 2;
        return -x3 + 5 * x2 - 8 * value + 4;
    }
}