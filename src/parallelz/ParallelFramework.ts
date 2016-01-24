import {HeapRegister} from "./HeapRegister";
/**
 * Created by Nidin Vinayakan on 22-01-2016.
 */
export class ParallelFramework{

    static instance:ParallelFramework;

    private heapBuffer:SharedArrayBuffer;
    private HEAP:Uint8Array;
    private heapRegister:HeapRegister;
    private lastPointer:number;
    private defaultSize:number = 32 * 1024 * 1024;

    constructor(heapSize:number){
        if(ParallelFramework.instance){
            throw "ParallelFramework is singleton";
        }
        ParallelFramework.instance = this;
        heapSize = heapSize || defaultSize;
        this.heapBuffer = new SharedArrayBuffer(heapSize);
        this.HEAP = new Uint8Array(this.heapBuffer);
        this.heapRegister = new HeapRegister(heapSize);
    }
    alloc(size):number{
        return this.heapRegister.register(size);
    }
    free(ptr:number):boolean{
        return this.heapRegister.deregister(ptr);
    }
}
