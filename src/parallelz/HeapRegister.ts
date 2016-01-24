import {sortAscending} from "../engine/utils/ArrayUtils";
/**
 * Created by Nidin Vinayakan on 24-01-2016.
 */
export class HeapRegister {

    freeList:number[];
    usedMap:Map;
    freeMap:Map;
    recycledSize:number = 0;
    maxFreeSize:number = 0;
    currentPtr:number;
    used:number = 0;

    constructor(private maxMemory:number) {
        this.usedMap = new Map();
        this.freeMap = new Map();
        this.freeList = [];
    }

    register(size:number) {
        var ptr:number = this.allocate(size);
        this.usedMap.set(ptr, size);
        return ptr;
    }

    deregister(ptr:number):boolean {
        var size:number = this.usedMap.get(ptr);
        if (size == undefined) {
            console.warn("[deregister:" + ptr + "] Cannot deregister since pointer is not registered or already unregistered");
            return;
        }
        this.freeMap.set(ptr, size);
        this.freeList.push(ptr);
        this.recycledSize += size;
        this.maxFreeSize = size > this.maxFreeSize ? size : this.maxFreeSize;
        this.used -= size;
        return this.usedMap.delete(ptr);
    }

    private popFree(size:number):number {
        var entries:Iterator = this.freeMap.entries();
        var ptr:number = null;
        var entry:IteratorResult = entries.next();
        while (!entry.done && ptr == null) {
            if (entry.value >= size) {
                ptr = entry.key;
            }
            entry = entries.next();
        }

        if (ptr) {
            this.freeMap.delete(ptr);
            this.recycledSize -= size;
            this.usedMap.set(ptr, size);
        }

        return ptr;
    }

    private defragment(tillSize?):{found:boolean, ptr:number} {
        console.time("defragmenting...");
        sortAscending(this.freeList);
        var lastPtr = null;
        var lastSize = null;
        var result = this.freeList.some(function (ptr) {
            var size = this.freeMap.get(ptr);

            if (lastPtr && (ptr - lastSize) == lastPtr) {
                this.freeMap.delete(ptr);
                this.freeMap.set(lastPtr, lastSize + size);
            }

            if (tillSize && lastSize + size >= tillSize) {
                return true;// break the loop
            }

            lastPtr = ptr;
            lastSize = size;
            return false;//continue the loop till last element
        });
        console.timeEnd("defragmenting...");
        return {found: result, ptr: lastPtr};
    }

    private allocate(size:number):number {
        var ptr = null;
        if (this.currentPtr + size > this.maxMemory) {
            if (this.freeMap.size > 0 && this.maxFreeSize >= size) {
                ptr = this.popFree(size);
                if (!ptr) {
                    throw "Failed to claim free memory, memory requested:" + size + " bytes, used:" +
                    this.used + " bytes, recycled:" + recycledSize + ", max:" + this.maxMemory + " bytes";
                }
            } else {
                var result = this.defragment(size);
                if (result.found) {
                    ptr = result.ptr;
                } else {
                    throw "Out of memory, memory requested:" + size + " bytes, used:" + this.used + " bytes, max:" +
                    this.maxMemory + " bytes";
                }
            }
        } else {
            ptr = this.currentPtr;
            this.currentPtr += size;
        }
        this.used += size;
        return ptr;
    }
}
