import {Tree} from "./tree/Tree";
import {Color} from "../math/Color";
import {Shape} from "./shapes/Shape";
import {Scene} from "./Scene";
import {Material} from "./materials/Material";
import {restoreShape} from "./shapes/Shape";
/**
 * Created by r3f on 13/1/2016.
 */
export class SharedScene extends Scene{

    constructor(color:Color = new Color(),
                shapes:Shape[] = [],
                lights:Shape[] = [],
                tree:Tree=null,
                rays:number = 0) {
        super(color,shapes, lights, tree, rays);
        this.shared = true;
    }

    getMemory():Float32Array{
        console.time("getMemory");
        var memorySize:number = this.estimatedMemory + Material.estimatedMemory;
        var memory:Float32Array = new Float32Array(new SharedArrayBuffer(memorySize * Float32Array.BYTES_PER_ELEMENT));
        //var memory:Float32Array = new Float32Array(new ArrayBuffer(memorySize * Float32Array.BYTES_PER_ELEMENT));
        var offset:number = 0;
        //write materials first
        offset = Material.writeToMemory(memory, offset);

        //write scene
        memory[offset++] = this.shapes.length;
        offset = this.color.writeToMemory(memory, offset);

        this.shapes.forEach(function(shape:Shape){
            offset = shape.writeToMemory(memory, offset);
        });

        console.timeEnd("getMemory");
        return memory;
    }
    static getScene(memory:Float32Array):Scene{
        console.time("getScene");
        var scene:Scene = new Scene();

        var offset:number = Material.restore(memory);

        var numShapes:number = memory[offset++];
        offset = scene.color.read(memory, offset);

        var shapes:Shape[] = [];

        for (var i = 0; i < numShapes; i++) {
            offset = restoreShape(memory, offset, shapes);
            scene.add(shapes[i]);
        }
        console.timeEnd("getScene");
        return scene;
    }
}
