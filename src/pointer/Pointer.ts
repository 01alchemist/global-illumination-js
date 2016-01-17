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
    static initialized:boolean;
    static init(){
        if(Pointer.initialized){
            return;
        }
        var maxMemory:number = 512 * 1024 * 1024;//512MB
        Pointer.heap = new Uint8Array(new SharedArrayBuffer(maxMemory));
        Pointer.memory = new ByteArrayBase(Pointer.heap.buffer);
        Pointer.initialized = true;
    }


    private beginLocation:number;
    private currentLocation:number;

    constructor(private reference:IPointer){
        if(!Pointer.heap){
            Pointer.init();
        }
        this.beginLocation = Pointer.offset;
        this.currentLocation = Pointer.offset;
        Pointer.offset = reference.write(Pointer.memory);
    }
    read():IPointer{
        Pointer.offset = this.reference.read(Pointer.memory);
        return this.reference;
    }
}
export function sizeof(ptr:IPointer):number{
    return ptr.memorySize;
}