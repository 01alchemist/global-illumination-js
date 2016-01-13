import {Box} from "../shapes/Box";
import {Shape} from "../shapes/Shape";
import {Hit} from "../../math/Hit";
import {Ray} from "../../math/Ray";
import {NoHit} from "../../math/Hit";
import {SharedNode} from "./SharedNode";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export class SharedTree{

    constructor(
        public box:Box,
        public root:SharedNode
    ){

    }
    static compileAndWriteToMemory(memory:Float32Array, shapes:Shape[], offset):number{
        console.time("Building k-d tree ("+shapes.length+" shapes)... ");
        offset = SharedNode.compileAndWriteToMemory(memory, shapes, offset);
        console.timeEnd("Building k-d tree ("+shapes.length+" shapes)... ");
        return offset;
    }
    intersect(r:Ray):Hit {
        var t = this.box.intersect(r);
        if(t.max < t.min || t.max <= 0){
            return NoHit;
        }
        return this.root.intersect(r, t.min, t.max);
    }
}
