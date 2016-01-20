import {IFilter} from "./IFilter";
/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class SincFilter implements IFilter {

    constructor(private size:number) {

    }

    getSize():number {
        return this.size;
    }

    get(x:number, y:number):number {
        return SincFilter.sinc1d(x) * SincFilter.sinc1d(y);
    }

    static sinc1d(x):number {
        x = Math.abs(x);
        if (x < 0.0001) {
            return 1.0;
        }
        x *= Math.PI;
        return Math.sin(x) / x;
    }
}