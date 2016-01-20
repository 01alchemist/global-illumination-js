import {IFilter} from "./IFilter";
/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class TriangleFilter implements IFilter{

    private inv:number;

    constructor(private size:number) {
        this.inv = 1.0 / (this.size * 0.5);
    }

    getSize():number {
        return this.size;
    }

    get(x:number, y:number):number {
        return (1.0 - Math.abs(x * this.inv)) * (1.0 - Math.abs(y * this.inv));
    }
}