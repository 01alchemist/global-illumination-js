import {Tree} from "./tree/Tree";
import {Color} from "../math/Color";
import {Shape} from "./shapes/Shape";
import {Scene} from "./Scene";
import {Material} from "./materials/Material";
import {restoreShape} from "./shapes/Shape";
import {SharedTree} from "./tree/SharedTree";
import {ShapeType} from "./shapes/Shape";
import {Mesh} from "./shapes/Mesh";
/**
 * Created by r3f on 13/1/2016.
 */
interface TextEncoder{
    new();
    encode(value:string):Uint8Array;
}
export class SharedScene extends Scene{

    sharedTreeMap:SharedTree[];

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
        offset = Material.directWrite(memory, offset);

        //write scene
        memory[offset++] = this.shapes.length;
        offset = this.color.directWrite(memory, offset);

        var self = this;

        this.shapes.forEach(function(shape:Shape, index:number){

            offset = shape.directWrite(memory, offset);

            if(shape.type == ShapeType.MESH){
                if(self.sharedTreeMap == null){
                    self.sharedTreeMap = [];
                }
                self.sharedTreeMap[index] = <SharedTree>(<Mesh>shape).tree;
            }
        });

        console.timeEnd("getMemory");
        return memory;
    }
    getKDTreeMemory():Uint8Array{
        return new TextEncoder().encode(JSON.stringify(this.sharedTreeMap));
    }
    static getScene(memory:Float32Array, tree:SharedTree[]=null):Scene{
        console.time("getScene");
        console.log(tree);
        var scene:Scene = new Scene();

        var offset:number = Material.restore(memory);

        var numShapes:number = memory[offset++];
        offset = scene.color.directRead(memory, offset);

        var shapes:Shape[] = [];

        for (var i = 0; i < numShapes; i++) {
            offset = restoreShape(memory, offset, shapes);
            var shape:Shape = shapes[i];
            scene.add(shape);
            if(shape.type == ShapeType.MESH){
                (<Mesh>shape).tree = SharedTree.fromJson(tree[i], <Mesh>shape);
            }
        }
        console.timeEnd("getScene");
        return scene;
    }
}
