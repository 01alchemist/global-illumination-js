import {IFilter} from "./../../core/IFilter";
/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class MitchellFilter implements IFilter {

    constructor() {

    }

    getSize():number {
        return 4.0;
    }

    get(x:number, y:number):number {
        return MitchellFilter.mitchell(x) * MitchellFilter.mitchell(y);
    }

    static mitchell(value:number):number {
        var B:number = 1 / 3.0;
        var C:number = 1 / 3.0;
        var SIXTH:number = 1 / 6.0;
        value = Math.abs(value);
        var value2:number = value * value;
        if (value > 1.0) {
            return ((-B - 6 * C) * value * value2 + (6 * B + 30 * C) * value2 + (-12 * B - 48 * C) * value + (8 * B + 24 * C)) * SIXTH;
        }
        return ((12 - 9 * B - 6 * C) * value * value2 + (-18 + 12 * B + 6 * C) * value2 + (6 - 2 * B)) * SIXTH;
    }
}