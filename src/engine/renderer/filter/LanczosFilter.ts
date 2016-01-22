import {IFilter} from "./../../core/IFilter";
/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class LanczosFilter implements IFilter{

    constructor() {

    }
    getSize():number{
        return 4.0;
    }
    
    get(x:number, y:number):number {
        return LanczosFilter.sinc1d(x * 0.5) * LanczosFilter.sinc1d(y * 0.5);
    }
    
    static sinc1d(x):number {
        x = Math.abs(x);
        if (x < 1e-5) {
            return 1;
        }
        if (x > 1.0) {
            return 0;
        }
        x *= Math.PI;
        var sinc = Math.sin(3 * x) / (3 * x);
        var lanczos = Math.sin(x) / x;
        return sinc * lanczos;
    }
}