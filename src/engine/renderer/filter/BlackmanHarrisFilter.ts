import {IFilter} from "./../../core/IFilter";
/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class BlackmanHarrisFilter implements IFilter{

    private inv:number;

    constructor(private size:number) {
        this.inv = 1.0 / (size * 0.5);
    }

    getSize():number {
        return this.size;
    }

    get(x:number, y:number):number {
        return BlackmanHarrisFilter.bh1d(x * this.inv) * BlackmanHarrisFilter.bh1d(y * this.inv);
    }

    static bh1d(x:number):number {
        if (x < -1.0 || x > 1.0)
            return 0.0;
        x = (x + 1) * 0.5;
        var A0:number = 0.35875;
        var A1:number = -0.48829;
        var A2:number = 0.14128;
        var A3:number = -0.01168;
        return (A0 + A1 * Math.cos(2 * Math.PI * x) + A2 * Math.cos(4 * Math.PI * x) + A3 * Math.cos(6 * Math.PI * x));
    }
}