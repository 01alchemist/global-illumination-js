import {PrimitiveList} from "../core/PrimitiveList";
import {BoundingBox} from "../math/BoundingBox";
import {Color} from "../math/Color";
import {IntArray} from "../../system/utils/IntArray";
import {Float} from "../../utils/BrowserPlatform";
import {assert} from "../../utils/assert";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
class BuildStats {

    private numNodes:number;
    private numLeaves:number;
    private sumObjects:number;
    private minObjects:number;
    private maxObjects:number;
    private sumDepth:number;
    private minDepth:number;
    private maxDepth:number;
    private numLeaves0:number;
    private numLeaves1:number;
    private numLeaves2:number;
    private numLeaves3:number;
    private numLeaves4:number;
    private numLeaves4p:number;

    constructor () {
        this.numLeaves = 0;
        this.numNodes = 0;
        this.numNodes = 0;
        this.sumObjects = 0;
        this.minObjects = Integer.MAX_VALUE;
        this.maxObjects = Integer.MIN_VALUE;
        this.sumDepth = 0;
        this.minDepth = Integer.MAX_VALUE;
        this.maxDepth = Integer.MIN_VALUE;
        this.numLeaves0 = 0;
        this.numLeaves1 = 0;
        this.numLeaves2 = 0;
        this.numLeaves3 = 0;
        this.numLeaves4 = 0;
        this.numLeaves4p = 0;
    }

    updateInner() {
        this.numNodes++;
    }

    updateLeaf(depth:number, n:number) {
        this.numLeaves++;
        this.minDepth = Math.min(depth, this.minDepth);
        this.maxDepth = Math.max(depth, this.maxDepth);
        this.sumDepth = (this.sumDepth + depth);
        this.minObjects = Math.min(n, this.minObjects);
        this.maxObjects = Math.max(n, this.maxObjects);
        this.sumObjects = (this.sumObjects + n);
        switch (n) {
            case 0:
                this.numLeaves0++;
                break;
            case 1:
                this.numLeaves1++;
                break;
            case 2:
                this.numLeaves2++;
                break;
            case 3:
                this.numLeaves3++;
                break;
            case 4:
                this.numLeaves4++;
                break;
            default:
                this.numLeaves4p++;
                break;
        }

    }

    printStats() {
        console.log("KDTree stats:");
        console.log("  * Nodes:         "+ this.numNodes);
        console.log("  * Leaves:        "+ this.numLeaves);
        console.log("  * Objects:min    "+ this.minObjects);
        console.log("             avg    "+ this.sumObjects / this.numLeaves);
        console.log("           avg(n>0) "+ this.sumObjects / this.numLeaves - this.numLeaves0);
        console.log("             max    "+ this.maxObjects);
        console.log("  * Depth:  min    "+ this.minDepth);
        console.log("             avg    "+ this.sumDepth / this.numLeaves);
        console.log("             max    "+ this.maxDepth);
        console.log("  * Leaves w/:N=0  "+ (100 * (this.numLeaves0 / this.numLeaves)));
        console.log("               N=1  "+ (100 * (this.numLeaves1 / this.numLeaves)));
        console.log("               N=2  "+ (100 * (this.numLeaves2 / this.numLeaves)));
        console.log("               N=3  "+ (100 * (this.numLeaves3 / this.numLeaves)));
        console.log("               N=4  "+ (100 * (this.numLeaves4 / this.numLeaves)));
        console.log("               N>4  "+ (100 * (this.numLeaves4p / this.numLeaves)));
    }
}
class BuildTask {

    splits:long[];
    numObjects:number;
    n:number;
    leftRightTable:number[];

    constructor (numObjects:number) {
        this.splits = [];//new long[]((6 * this.numObjects));
        this.numObjects = numObjects;
        this.n = 0;
        //  2 bits per object
        this.leftRightTable = [];//new long(((this.numObjects + 3) / 4));
    }

    constructor (numObjects:number, parent:BuildTask) {
        this.splits = [];//new long[]((6 * this.numObjects));
        this.numObjects = numObjects;
        this.n = 0;
        this.leftRightTable = parent.leftRightTable;
    }
}
export class KDTree implements IAccelerationStructure {

    private tree:number[];
    private primitives:number[];
    private primitiveList:PrimitiveList;
    private bounds:BoundingBox;
    private maxPrims:number;
    private static INTERSECT_COST:number = 0.5;
    private static TRAVERSAL_COST:number = 1;
    private static EMPTY_BONUS:number = 0.2;
    private static MAX_DEPTH:number = 64;
    private static dump:boolean = false;
    private static dumpPrefix:string = "kdtree";

constructor (maxPrims:number) {
    this.maxPrims = maxPrims;
}



static setDumpMode(dump:boolean, prefix:string) {
    KDTree.dump = dump;
    KDTree.dumpPrefix = prefix;
}

build(primitives:PrimitiveList) {
    console.log("KDTree settings");
    console.log("  * Max Leaf Size: "+ this.maxPrims);
    console.log("  * Max Depth:     "+ MAX_DEPTH);
    console.log("  * Traversal cost:%.2f", TRAVERSAL_COST);
    console.log("  * Intersect cost:%.2f", INTERSECT_COST);
    console.log("  * Empty bonus:   %.2f", EMPTY_BONUS);
    console.log("  * Dump leaves:   %s", dump);
    // TODO:Warning!!!, inline IF is not supported ?
    let total:Timer = new Timer();
    total.start();
    this.primitiveList = this.primitives;
    //  get the object space bounds
    this.bounds = this.primitives.getWorldBounds(null);
    let nSplits:number = 0;
    let nPrim:number = this.primitiveList.getNumPrimitives();
    let task:BuildTask = new BuildTask(nPrim);
    let prepare:Timer = new Timer();
    prepare.start();
    for (let i:number = 0; (i < nPrim); i++) {
        for (let axis:number = 0; (axis < 3); axis++) {
            let ls:number = this.primitiveList.getPrimitiveBound(i, ((2 * axis)));
            let rs:number = this.primitiveList.getPrimitiveBound(i, ((2 * axis) + 1));
            if ((ls == rs)) {
                //  flat in this dimension
                task.splits[nSplits] = pack(ls, PLANAR, axis, i);
                nSplits++;
            }
            else {
                task.splits[(nSplits)] = pack(ls, OPENED, axis, i);
                task.splits[(nSplits + 1)] = pack(rs, CLOSED, axis, i);
                nSplits += 2;
            }

        }

    }

    task.n = nSplits;
    prepare.end();
    let t:Timer = new Timer();
    let tempTree:IntArray = new IntArray();
    let tempList:IntArray = new IntArray();
    tempTree.add(0);
    tempTree.add(1);
    t.start();
    //  sort it
    let sorting:Timer = new Timer();
    sorting.start();
    radix12(task.splits, task.n);
    sorting.end();
    //  build the actual tree
    let stats:BuildStats = new BuildStats();
    this.buildTree(this.bounds.getMinimum().x, this.bounds.getMaximum().x, this.bounds.getMinimum().y, this.bounds.getMaximum().y, this.bounds.getMinimum().z, this.bounds.getMaximum().z, task, 1, tempTree, 0, tempList, stats);
    t.end();
    //  write out final arrays
    //  free some memory
    task = null;
    this.tree = tempTree.trim();
    tempTree = null;
    this.primitives = tempList.trim();
    tempList = null;
    total.end();
    //  display some extra info
    stats.printStats();
    console.log("  * Node memory:   %s", Memory.sizeof(this.tree));
    console.log("  * Object memory: %s", Memory.sizeof(this.primitives));
    console.log("  * Prepare time:  %s", prepare);
    console.log("  * Sorting time:  %s", sorting);
    console.log("  * Tree creation: %s", t);
    console.log("  * Build time:    %s", total);
    if (dump) {
        /*try {
            console.log("Dumping mtls to "+dumpPrefix+".mtl ...");
            let mtlFile:FileWriter = new FileWriter((dumpPrefix + ".mtl"));
            let maxN:number = stats.maxObjects;
            for (let n:number = 0; (n <= maxN); n++) {
                let blend:number = ((<number>(n)) / (<number>(maxN)));
                let nc:Color;
                if ((blend < 0.25)) {
                    nc = Color.blend(Color.BLUE, Color.GREEN, (blend / 0.25));
                }
                else if ((blend < 0.5)) {
                    nc = Color.blend(Color.GREEN, Color.YELLOW, ((blend - 0.25)
                    / 0.25));
                }
                else if ((blend < 0.75)) {
                    nc = Color.blend(Color.YELLOW, Color.RED, ((blend - 0.5)
                    / 0.25));
                }
                else {
                    nc = Color.MAGENTA;
                }

                mtlFile.write(String.format("newmtl mtl%d", n));
                let rgb:float[] = nc.getRGB();
                mtlFile.write("Ka 0.1 0.1 0.1");
                mtlFile.write(String.format("Kd %.12g %.12g %.12g", rgb[0], rgb[1], rgb[2]));
                mtlFile.write("illum 1");
            }

            let objFile:FileWriter = new FileWriter((dumpPrefix + ".obj"));
            console.log("Dumping tree to %s.obj ...", dumpPrefix);
            this.dumpObj(0, 0, maxN, new BoundingBox(this.bounds), objFile, mtlFile);
            objFile.close();
            mtlFile.close();
        }
        catch (e) {
            console.error(e);
        }*/
    }

}

private dumpObj(offset:number, vertOffset:number, maxN:number, bounds:BoundingBox, file:FileWriter, mtlFile:FileWriter):number {
    if ((offset == 0)) {
        file.write(String.format("mtllib %s.mtl", dumpPrefix));
    }

    let nextOffset:number = this.tree[offset];
    if (((nextOffset & (3 + 30)) == (3 + 30))) {
        //  leaf
        let n:number = this.tree[(offset + 1)];
        if ((n > 0)) {
            //  output the current voxel to the file
            let min:Point3 = this.bounds.getMinimum();
            let max:Point3 = this.bounds.getMaximum();
            file.write(String.format("o node%d", offset));
            file.write(String.format("v %g %g %g", max.x, max.y, min.z));
            file.write(String.format("v %g %g %g", max.x, min.y, min.z));
            file.write(String.format("v %g %g %g", min.x, min.y, min.z));
            file.write(String.format("v %g %g %g", min.x, max.y, min.z));
            file.write(String.format("v %g %g %g", max.x, max.y, max.z));
            file.write(String.format("v %g %g %g", max.x, min.y, max.z));
            file.write(String.format("v %g %g %g", min.x, min.y, max.z));
            file.write(String.format("v %g %g %g", min.x, max.y, max.z));
            let v0:number = vertOffset;
            file.write(String.format("usemtl mtl%d", n));
            file.write("s off");
            file.write(String.format("f %d %d %d %d", (v0 + 1), (v0 + 2), (v0 + 3), (v0 + 4)));
            file.write(String.format("f %d %d %d %d", (v0 + 5), (v0 + 8), (v0 + 7), (v0 + 6)));
            file.write(String.format("f %d %d %d %d", (v0 + 1), (v0 + 5), (v0 + 6), (v0 + 2)));
            file.write(String.format("f %d %d %d %d", (v0 + 2), (v0 + 6), (v0 + 7), (v0 + 3)));
            file.write(String.format("f %d %d %d %d", (v0 + 3), (v0 + 7), (v0 + 8), (v0 + 4)));
            file.write(String.format("f %d %d %d %d", (v0 + 5), (v0 + 1), (v0 + 4), (v0 + 8)));
            vertOffset += 8;
        }

        return vertOffset;
    }
    else {
        //  node, recurse
        let v0:number;
        let axis:number = (nextOffset & (3 + 30));
        let max:number;
        let split:float = Float.intBitsToFloat(this.tree[(offset + 1)]);
        let min:number;
        nextOffset &= ~(3 << 30);
        switch (axis) {
            case 0:
                max = this.bounds.getMaximum().x;
                this.bounds.getMaximum().x = split;
                v0 = this.dumpObj(nextOffset, vertOffset, maxN, this.bounds, file, mtlFile);
                //  restore and go to other side
                this.bounds.getMaximum().x = max;
                min = this.bounds.getMinimum().x;
                this.bounds.getMinimum().x = split;
                v0 = this.dumpObj((nextOffset + 2), v0, maxN, this.bounds, file, mtlFile);
                this.bounds.getMinimum().x = min;
                break;
            case 1 << 30:
                max = this.bounds.getMaximum().y;
                this.bounds.getMaximum().y = split;
                v0 = this.dumpObj(nextOffset, vertOffset, maxN, this.bounds, file, mtlFile);
                //  restore and go to other side
                this.bounds.getMaximum().y = max;
                min = this.bounds.getMinimum().y;
                this.bounds.getMinimum().y = split;
                v0 = this.dumpObj((nextOffset + 2), v0, maxN, this.bounds, file, mtlFile);
                this.bounds.getMinimum().y = min;
                break;
            case 2 << 30:
                max = this.bounds.getMaximum().z;
                this.bounds.getMaximum().z = split;
                v0 = this.dumpObj(nextOffset, vertOffset, maxN, this.bounds, file, mtlFile);
                //  restore and go to other side
                this.bounds.getMaximum().z = max;
                min = this.bounds.getMinimum().z;
                this.bounds.getMinimum().z = split;
                v0 = this.dumpObj((nextOffset + 2), v0, maxN, this.bounds, file, mtlFile);
                //  restore and go to other side
                this.bounds.getMinimum().z = min;
                break;
            default:
                v0 = vertOffset;
                break;
        }

        return v0;
    }

}

//  type is encoded as 2 shifted bits
private static CLOSED:long = 0 << 30;
private static PLANAR:long = 1 << 30;
private static OPENED:long = 2 << 30;
private static TYPE_MASK:long = 3 << 30;

//  pack split values into a 64bit integer
private static pack(split:float, type:long, axis:int, object:int):number {
    //  pack float in sortable form
    let f:number = Float.floatToRawIntBits(split);
    let top:number = f ^ ((f >> 31) | 0x80000000);
    // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
    let p:number = (top & 0xFFFFFFFF) << 32;
    p |= type;//  encode type as 2 bits
    p |= (<long>axis + 28) << 28;//  encode axis as 2 bits
    p |= (object & 0xFFFFFFF);//  pack object number
    return p;
}

private static unpackObject(p:long):int {
    return p & 0xFFFFFFF;
}

private static unpackAxis(p:number):int {
    return (p >>> 28) & 3;
}

private static unpackSplitType(p:number):number {
    return p & KDTree.TYPE_MASK;
}

private static unpackSplit(p:number):number {
    var f:int = Math.round((p >>> 32) & 0xFFFFFFFF);
    var m:int = ((f >>> 31) - 1) | 0x80000000;
    return Float.intBitsToFloat(f ^ m);
}

//  radix sort on top 36 bits - returns sorted result
private static radix12(splits:long[], n:int) {
    //  allocate working memory
    let hist:Int32Array = new Int32Array(2048);
    let sorted:long[] = [];//Int64Array(n);
    //  parallel histogramming pass
    for (let i:int = 0; (i < n); i++) {
        let pi:long = splits[i];
        hist[0x000 + ((int) (pi >>> 28) & 0x1FF)]++;
        hist[0x200 + ((int) (pi >>> 37) & 0x1FF)]++;
        hist[0x400 + ((int) (pi >>> 46) & 0x1FF)]++;
        hist[0x600 + ((int) (pi >>> 55))]++;
    }

    //  sum the histograms - each histogram entry records the number of
    //  values preceding itself.
    let sum3:int = 0;
    let sum0:int = 0;
    let sum1:int = 0;
    let sum2:int = 0;
    let tsum:int;
    for (let i:int = 0; (i < 512); i++) {
        tsum = hist[0x000 + i] + sum0;
        hist[0x000 + i] = sum0 - 1;
        sum0 = tsum;
        tsum = hist[0x200 + i] + sum1;
        hist[0x200 + i] = sum1 - 1;
        sum1 = tsum;
        tsum = hist[0x400 + i] + sum2;
        hist[0x400 + i] = sum2 - 1;
        sum2 = tsum;
        tsum = hist[0x600 + i] + sum3;
        hist[0x600 + i] = sum3 - 1;
        sum3 = tsum;
    }

    //  read/write histogram passes
    for (let i:int = 0; (i < n); i++) {
        var pi:long = splits[i];
        var pos:int = (int) (pi >>> 28) & 0x1FF;
        sorted[++hist[0x000 + pos]] = pi;
    }

    for (let i:int = 0; (i < n); i++) {
        var pi:long = sorted[i];
        var pos:int = (int) (pi >>> 37) & 0x1FF;
        splits[++hist[0x200 + pos]] = pi;
    }

    for (let i:int = 0; (i < n); i++) {
        var pi:long = splits[i];
        var pos:int = (int) (pi >>> 46) & 0x1FF;
        sorted[++hist[0x400 + pos]] = pi;
    }

    for (let i:number = 0; (i < n); i++) {
        var pi:long = sorted[i];
        var pos:int = (int) (pi >>> 55);
        splits[++hist[0x600 + pos]] = pi;
    }

}
private buildTree(minx:number, maxx:number, miny:number, maxy:number, minz:number, maxz:number, task:BuildTask, depth:number, tempTree:IntArray, offset:number, tempList:IntArray, stats:BuildStats) {
    //  get node bounding box extents
    if (task.numObjects > this.maxPrims && depth < KDTree.MAX_DEPTH) {
        let dx:float = maxx - minx;
        let dy:float = maxy - miny;
        let dz:float = maxz - minz;
        //  search for best possible split
        let bestCost:float = KDTree.INTERSECT_COST * task.numObjects;
        let bestAxis:int = -1;
        let bestOffsetStart:int = -1;
        let bestOffsetEnd:int = -1;
        let bestSplit:float = 0;
        let bestPlanarLeft:boolean = false;
        let bnr:int = 0;
        let bnl:int = 0;
        //  inverse area of the bounding box (factor of 2 ommitted)
        let area:float = ((dx * dy) + ((dy * dz) + (dz * dx)));
        let ISECT_COST:number = (INTERSECT_COST / area);
        //  setup counts for each axis
        let nl:number[] = [
            0,
            0,
            0];
        let nr:number[] = [
            task.numObjects,
            task.numObjects,
            task.numObjects];
        //  setup bounds for each axis
        let dp:number[] = [
            (dy * dz),
            (dz * dx),
            (dx * dy)];
        let ds:number[] = [
            (dy + dz),
            (dz + dx),
            (dx + dy)];
        let nodeMin:number[] = [
            minx,
            miny,
            minz];
        let nodeMax:number[] = [
            maxx,
            maxy,
            maxz];
        //  search for best cost
        let nSplits:number = task.n;
        let splits:number[] = task.splits;
        let lrtable:number[] = task.leftRightTable;
        for (let i:number = 0; (i < nSplits);) {
            //  extract current split
            let ptr:number = splits[i];
            let split:number = unpackSplit(ptr);
            let axis:number = unpackAxis(ptr);
            //  mark current position
            let currentOffset:number = i;
            //  count number of primitives start/stopping/lying on the
            //  current plane
            let pOpened:number = 0;
            let pClosed:number = 0;
            let pPlanar:number = 0;
            let ptrMasked:number = ptr & (~KDTree.TYPE_MASK & 0xFFFFFFFFF0000000);
            let ptrClosed:number = (ptrMasked | KDTree.CLOSED);
            let ptrPlanar:number = (ptrMasked | KDTree.PLANAR);
            let ptrOpened:number = (ptrMasked | KDTree.OPENED);

            while (i < nSplits && (splits[i] & 0xFFFFFFFFF0000000) == ptrClosed) {
                var obj:int = unpackObject(splits[i]);
                lrtable[obj >>> 2] = 0;
                pClosed++;
                i++;
            }
            while (i < nSplits && (splits[i] & 0xFFFFFFFFF0000000) == ptrPlanar) {
                var obj:int = unpackObject(splits[i]);
                lrtable[obj >>> 2] = 0;
                pPlanar++;
                i++;
            }
            while (i < nSplits && (splits[i] & 0xFFFFFFFFF0000000) == ptrOpened) {
                var obj:int = unpackObject(splits[i]);
                lrtable[obj >>> 2] = 0;
                pOpened++;
                i++;
            }

            //  now we have summed all contributions from this plane
            nr[axis] -= pPlanar + pClosed;
            //  compute cost
            if (((split >= nodeMin[axis])
                && (split <= nodeMax[axis]))) {
                //  left and right surface area (factor of 2 ommitted)
                let dl:number = (split - nodeMin[axis]);
                let dr:number = (nodeMax[axis] - split);
                let lp:number = (dp[axis]
                + (dl * ds[axis]));
                let rp:number = (dp[axis]
                + (dr * ds[axis]));
                //  planar prims go to smallest cell always
                let planarLeft:boolean = (dl < dr);
                let numLeft:number = (nl[axis] + planarLeft);
                // TODO:Warning!!!, inline IF is not supported ?
                let numRight:number = (nr[axis] + planarLeft);
                // TODO:Warning!!!, inline IF is not supported ?
                let eb:number = (((numLeft == 0)
                && (dl > 0))
                || ((numRight == 0)
                && (dr > 0)));
                // TODO:Warning!!!, inline IF is not supported ?
                let cost:number = (TRAVERSAL_COST
                + (ISECT_COST
                * ((1 - eb)
                * ((lp * numLeft)
                + (rp * numRight)))));
                if ((cost < bestCost)) {
                    bestCost = cost;
                    bestAxis = axis;
                    bestSplit = split;
                    bestOffsetStart = currentOffset;
                    bestOffsetEnd = i;
                    bnl = numLeft;
                    bnr = numRight;
                    bestPlanarLeft = planarLeft;
                }

            }

            //  move objects left
            nl[axis] = (nl[axis]
            + (pOpened + pPlanar));
        }

        //  debug check for correctness of the scan
        for (let axis:number = 0; (axis < 3); axis++) {
            let numLeft:number = nl[axis];
            let numRight:number = nr[axis];
            if (((numLeft != task.numObjects)
                || (numRight != 0))) {
                console.error("Didn't scan full range of objects @depth=%d. Left overs for axis %d:[L:%d] [R:%d]", depth, axis, numLeft, numRight);
            }

        }

        //  found best split?
        if (bestAxis != -1) {
            // allocate space for child nodes
            var taskL:BuildTask = new BuildTask(bnl, task);
            var taskR:BuildTask = new BuildTask(bnr, task);
            var lk:int = 0, rk = 0;
            for (var i:int = 0; i < bestOffsetStart; i++) {
                var ptr:long = splits[i];
                if (unpackAxis(ptr) == bestAxis) {
                    if (unpackSplitType(ptr) != CLOSED) {
                        var obj = unpackObject(ptr);
                        lrtable[obj >>> 2] |= 1 << ((obj & 3) << 1);
                        lk++;
                    }
                }
            }
            for (var i:int = bestOffsetStart; i < bestOffsetEnd; i++) {
                var ptr:long = splits[i];
                assert(unpackAxis(ptr) == bestAxis);
                if (unpackSplitType(ptr) == PLANAR) {
                    if (bestPlanarLeft) {
                        var obj:int = unpackObject(ptr);
                        lrtable[obj >>> 2] |= 1 << ((obj & 3) << 1);
                        lk++;
                    } else {
                        var obj:int = unpackObject(ptr);
                        lrtable[obj >>> 2] |= 2 << ((obj & 3) << 1);
                        rk++;
                    }
                }
            }
            for (var i:int = bestOffsetEnd; i < nSplits; i++) {
                var ptr:long = splits[i];
                if (unpackAxis(ptr) == bestAxis) {
                    if (unpackSplitType(ptr) != OPENED) {
                        var obj:int = unpackObject(ptr);
                        lrtable[obj >>> 2] |= 2 << ((obj & 3) << 1);
                        rk++;
                    }
                }
            }
            // output new splits while maintaining order
            var splitsL:long[] = taskL.splits;
            var splitsR:long[] = taskR.splits;
            var nsl:int = 0, nsr = 0;
            for (var i:int = 0; i < nSplits; i++) {
                var ptr:long = splits[i];
                var obj = unpackObject(ptr);
                var idx = obj >>> 2;
                var mask = 1 << ((obj & 3) << 1);
                if ((lrtable[idx] & mask) != 0) {
                    splitsL[nsl] = ptr;
                    nsl++;
                }
                if ((lrtable[idx] & (mask << 1)) != 0) {
                    splitsR[nsr] = ptr;
                    nsr++;
                }
            }
            taskL.n = nsl;
            taskR.n = nsr;
            // free more memory
            task.splits = splits = splitsL = splitsR = null;
            task = null;
            // allocate child nodes
            var nextOffset:int = tempTree.getSize();
            tempTree.add(0);
            tempTree.add(0);
            tempTree.add(0);
            tempTree.add(0);
            // create current node
            tempTree.set(offset, (bestAxis << 30) | nextOffset);
            tempTree.set(offset + 1, Float.floatToRawIntBits(bestSplit));
            // recurse for child nodes - free object arrays after each step
            stats.updateInner();
            switch (bestAxis) {
                case 0:
                    buildTree(minx, bestSplit, miny, maxy, minz, maxz, taskL, depth + 1, tempTree, nextOffset, tempList, stats);
                    taskL = null;
                    buildTree(bestSplit, maxx, miny, maxy, minz, maxz, taskR, depth + 1, tempTree, nextOffset + 2, tempList, stats);
                    taskR = null;
                    return;
                case 1:
                    buildTree(minx, maxx, miny, bestSplit, minz, maxz, taskL, depth + 1, tempTree, nextOffset, tempList, stats);
                    taskL = null;
                    buildTree(minx, maxx, bestSplit, maxy, minz, maxz, taskR, depth + 1, tempTree, nextOffset + 2, tempList, stats);
                    taskR = null;
                    return;
                case 2:
                    buildTree(minx, maxx, miny, maxy, minz, bestSplit, taskL, depth + 1, tempTree, nextOffset, tempList, stats);
                    taskL = null;
                    buildTree(minx, maxx, miny, maxy, bestSplit, maxz, taskR, depth + 1, tempTree, nextOffset + 2, tempList, stats);
                    taskR = null;
                    return;
                default:
                    assert(false);
            }
        }

    }

    //  create leaf node
    let listOffset:number = tempList.getSize();
    let n:number = 0;
    for (let i:number = 0; (i < task.n); i++) {
        let ptr:number = task.splits[i];
        if (((unpackAxis(ptr) == 0)
            && (unpackSplitType(ptr) != CLOSED))) {
            tempList.add(unpackObject(ptr));
            n++;
        }

    }

    stats.updateLeaf(depth, n);
    if ((n != task.numObjects)) {
        console.error("Error creating leaf node - expecting "+task.numObjects+" found "+ n);
    }

    tempTree.set((offset + 0), ((3 + 30)
    | listOffset));
    tempTree.set((offset + 1), task.numObjects);
    //  free some memory
    task.splits = null;
}

intersect(r:Ray, state:IntersectionState) {
    let intervalMin:number = r.getMin();
    let intervalMax:number = r.getMax();
    let orgX:number = r.ox;
    let invDirX:number = (1 / dirX);
    let dirX:number = r.dx;
    let t2:number;
    let t1:number;
    t1 = ((this.bounds.getMinimum().x - orgX)
    * invDirX);
    t2 = ((this.bounds.getMaximum().x - orgX)
    * invDirX);
    if ((invDirX > 0)) {
        if ((t1 > intervalMin)) {
            intervalMin = t1;
        }

        if ((t2 < intervalMax)) {
            intervalMax = t2;
        }

    }
    else {
        if ((t2 > intervalMin)) {
            intervalMin = t2;
        }

        if ((t1 < intervalMax)) {
            intervalMax = t1;
        }

    }

    if ((intervalMin > intervalMax)) {
        return;
    }

    let orgY:number = r.oy;
    let invDirY:number = (1 / dirY);
    let dirY:number = r.dy;
    t1 = ((this.bounds.getMinimum().y - orgY)
    * invDirY);
    t2 = ((this.bounds.getMaximum().y - orgY)
    * invDirY);
    if ((invDirY > 0)) {
        if ((t1 > intervalMin)) {
            intervalMin = t1;
        }

        if ((t2 < intervalMax)) {
            intervalMax = t2;
        }

    }
    else {
        if ((t2 > intervalMin)) {
            intervalMin = t2;
        }

        if ((t1 < intervalMax)) {
            intervalMax = t1;
        }

    }

    if ((intervalMin > intervalMax)) {
        return;
    }

    let orgZ:number = r.oz;
    let invDirZ:number = (1 / dirZ);
    let dirZ:number = r.dz;
    t1 = ((this.bounds.getMinimum().z - orgZ)
    * invDirZ);
    t2 = ((this.bounds.getMaximum().z - orgZ)
    * invDirZ);
    if ((invDirZ > 0)) {
        if ((t1 > intervalMin)) {
            intervalMin = t1;
        }

        if ((t2 < intervalMax)) {
            intervalMax = t2;
        }

    }
    else {
        if ((t2 > intervalMin)) {
            intervalMin = t2;
        }

        if ((t1 < intervalMax)) {
            intervalMax = t1;
        }

    }

    if ((intervalMin > intervalMax)) {
        return;
    }

    //  compute custom offsets from direction sign bit
    let offsetXFront:number;
    30;
    let offsetYFront:number;
    30;
    let offsetZFront:number;
    30;
    let offsetXBack:number = (offsetXFront | 2);
    // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
    let offsetYBack:number = (offsetYFront | 2);
    // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
    let offsetZBack:number = (offsetZFront | 2);
    // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
    let stack:IntersectionState.StackNode[] = state.getStack();
    let stackTop:number = state.getStackTop();
    let stackPos:number = stackTop;
    let node:number = 0;
    while (true) {
        let tn:number = this.tree[node];
        let axis:number = (tn & (3 + 30));
        let offset:number;
        (3 + 30);
        switch (axis) {
            case 0:
                let d:number = ((Float.intBitsToFloat(this.tree[(node + 1)]) - orgX)
                * invDirX);
                let back:number = (offset + offsetXBack);
                node = back;
                if ((d < intervalMin)) {
                    // TODO:Warning!!! continue If
                }

                node = (offset + offsetXFront);
                //  front
                if ((d > intervalMax)) {
                    // TODO:Warning!!! continue If
                }

                //  push back node
                stack[stackPos].node = back;
                stack[stackPos].near = (d >= intervalMin);
                // TODO:Warning!!!, inline IF is not supported ?
                stack[stackPos].far = intervalMax;
                stackPos++;
                //  update ray interval for front node
                intervalMax = (d <= intervalMax);
                // TODO:Warning!!!, inline IF is not supported ?
                // TODO:Warning!!! continue If
                break;
            case (1 + 30):
                //  y axis
                let d:number = ((Float.intBitsToFloat(this.tree[(node + 1)]) - orgY)
                * invDirY);
                let back:number = (offset + offsetYBack);
                node = back;
                if ((d < intervalMin)) {
                    // TODO:Warning!!! continue If
                }

                node = (offset + offsetYFront);
                //  front
                if ((d > intervalMax)) {
                    // TODO:Warning!!! continue If
                }

                //  push back node
                stack[stackPos].node = back;
                stack[stackPos].near = (d >= intervalMin);
                // TODO:Warning!!!, inline IF is not supported ?
                stack[stackPos].far = intervalMax;
                stackPos++;
                //  update ray interval for front node
                intervalMax = (d <= intervalMax);
                // TODO:Warning!!!, inline IF is not supported ?
                // TODO:Warning!!! continue If
                break;
            case (2 + 30):
                //  z axis
                let d:number = ((Float.intBitsToFloat(this.tree[(node + 1)]) - orgZ)
                * invDirZ);
                let back:number = (offset + offsetZBack);
                node = back;
                if ((d < intervalMin)) {
                    // TODO:Warning!!! continue If
                }

                node = (offset + offsetZFront);
                //  front
                if ((d > intervalMax)) {
                    // TODO:Warning!!! continue If
                }

                //  push back node
                stack[stackPos].node = back;
                stack[stackPos].near = (d >= intervalMin);
                // TODO:Warning!!!, inline IF is not supported ?
                stack[stackPos].far = intervalMax;
                stackPos++;
                //  update ray interval for front node
                intervalMax = (d <= intervalMax);
                // TODO:Warning!!!, inline IF is not supported ?
                // TODO:Warning!!! continue If
                break;
            default:
                //  leaf - test some objects
                let n:number = this.tree[(node + 1)];
                while ((n > 0)) {
                    this.primitiveList.intersectPrimitive(r, this.primitives[offset], state);
                    n--;
                    offset++;
                }

                if ((r.getMax() < intervalMax)) {
                    return;
                }

                for (
                    ; true;
                ) {
                    //  stack is empty?
                    if ((stackPos == stackTop)) {
                        return;
                    }

                    //  move back up the stack
                    stackPos--;
                    intervalMin = stack[stackPos].near;
                    if ((r.getMax() < intervalMin)) {
                        // TODO:Warning!!! continue If
                    }

                    node = stack[stackPos].node;
                    intervalMax = stack[stackPos].far;
                    break; //Warning!!! Review that break works as 'Exit Select' as it is inside another 'breakable' statement:For
                }

                break;
        }

        //  switch
    }

    //  traversal loop
}
}