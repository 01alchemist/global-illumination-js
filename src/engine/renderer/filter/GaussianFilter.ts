import {IFilter} from "./IFilter";
/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class GaussianFilter implements IFilter{

    private es2:number;

    constructor(private size:number) {
        this.es2 = -Math.exp(-size * size);
    }

    getSize():number{
        return this.size;
    }

    get(x:number, y:number):number{
        var gx:number = Math.exp(-x * x) + this.es2;
        var gy:number = Math.exp(-y * y) + this.es2;
        return gx * gy;
    }
}