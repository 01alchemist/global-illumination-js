import {IPointer} from "./IPointer";
import {ByteArrayBase} from "./ByteArrayBase";
/**
 * Created by Nidin Vinayakan on 15/1/2016.
 * C Like pointer to keep objects in shared memory
 * This class is highly experimental
 */
export class Pointer{

    static offset:number;
    static heap:Uint8Array;
    static memory:ByteArrayBase;
    static init(){
        var maxMemory:number = 512 * 1024 * 1024;//512MB
        Pointer.heap = new Uint8Array(new SharedArrayBuffer(maxMemory));
        Pointer.memory = new ByteArrayBase(Pointer.heap.buffer);
    }


    private beginLocation:number;
    private currentLocation:number;

    constructor(obj:IPointer){
        if(!Pointer.heap){
            Pointer.init();
        }
        Pointer.offset = obj.write(Pointer.memory, Pointer.offset);

    }
}