/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class BoundingIntervalHierarchy implements AccelerationStructure {

    private tree: number[];

    private objects: number[];

    private primitives: PrimitiveList;

    private bounds: BoundingBox;

    private maxPrims: number;

    public constructor () {
        this.maxPrims = 2;
    }

    public build(primitives: PrimitiveList) {
        this.primitives = this.primitives;
        let n: number = this.primitives.getNumPrimitives();
        UI.printDetailed(Module.ACCEL, "Getting bounding box ...");
        this.bounds = this.primitives.getWorldBounds(null);
        this.objects = new Array(n);
        for (let i: number = 0; (i < n); i++) {
            this.objects[i] = i;
        }

        UI.printDetailed(Module.ACCEL, "Creating tree ...");
        let initialSize: number = (3
        * ((2 * (6 * n))
        + 1));
        let tempTree: IntArray = new IntArray(((initialSize + 3)
        / 4));
        let stats: BuildStats = new BuildStats();
        let t: Timer = new Timer();
        t.start();
        this.buildHierarchy(tempTree, this.objects, stats);
        t.end();
        UI.printDetailed(Module.ACCEL, "Trimming tree ...");
        this.tree = tempTree.trim();
        //  display stats
        stats.printStats();
        UI.printDetailed(Module.ACCEL, "  * Creation time:  %s", t);
        UI.printDetailed(Module.ACCEL, "  * Usage of init:  %3d%%", (100
        * (this.tree.length / initialSize)));
        UI.printDetailed(Module.ACCEL, "  * Tree memory:    %s", Memory.sizeof(this.tree));
        UI.printDetailed(Module.ACCEL, "  * Indices memory: %s", Memory.sizeof(this.objects));
    }

    class BuildStats {

    private numNodes: number;

    private numLeaves: number;

    private sumObjects: number;

    private minObjects: number;

    private maxObjects: number;

    private sumDepth: number;

    private minDepth: number;

    private maxDepth: number;

    private numLeaves0: number;

    private numLeaves1: number;

    private numLeaves2: number;

    private numLeaves3: number;

    private numLeaves4: number;

    private numLeaves4p: number;

    private numBVH2: number;

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
        this.numBVH2 = 0;
    }

    updateInner() {
        this.numNodes++;
    }

    updateBVH2() {
        this.numBVH2++;
    }

    updateLeaf(depth: number, n: number) {
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
        UI.printDetailed(Module.ACCEL, "Tree stats:");
        UI.printDetailed(Module.ACCEL, "  * Nodes:          %d", this.numNodes);
        UI.printDetailed(Module.ACCEL, "  * Leaves:         %d", this.numLeaves);
        UI.printDetailed(Module.ACCEL, "  * Objects: min    %d", this.minObjects);
        UI.printDetailed(Module.ACCEL, "             avg    %.2f", ((<number>(this.sumObjects)) / this.numLeaves));
        UI.printDetailed(Module.ACCEL, "           avg(n>0) %.2f", ((<number>(this.sumObjects))
        / (this.numLeaves - this.numLeaves0)));
        UI.printDetailed(Module.ACCEL, "             max    %d", this.maxObjects);
        UI.printDetailed(Module.ACCEL, "  * Depth:   min    %d", this.minDepth);
        UI.printDetailed(Module.ACCEL, "             avg    %.2f", ((<number>(this.sumDepth)) / this.numLeaves));
        UI.printDetailed(Module.ACCEL, "             max    %d", this.maxDepth);
        UI.printDetailed(Module.ACCEL, "  * Leaves w/: N=0  %3d%%", (100
        * (this.numLeaves0 / this.numLeaves)));
        UI.printDetailed(Module.ACCEL, "               N=1  %3d%%", (100
        * (this.numLeaves1 / this.numLeaves)));
        UI.printDetailed(Module.ACCEL, "               N=2  %3d%%", (100
        * (this.numLeaves2 / this.numLeaves)));
        UI.printDetailed(Module.ACCEL, "               N=3  %3d%%", (100
        * (this.numLeaves3 / this.numLeaves)));
        UI.printDetailed(Module.ACCEL, "               N=4  %3d%%", (100
        * (this.numLeaves4 / this.numLeaves)));
        UI.printDetailed(Module.ACCEL, "               N>4  %3d%%", (100
        * (this.numLeaves4p / this.numLeaves)));
        UI.printDetailed(Module.ACCEL, "  * BVH2 nodes:     %d (%3d%%)", this.numBVH2, (100
        * (this.numBVH2
        / (this.numNodes
        + (this.numLeaves - (2 * this.numBVH2))))));
    }
}

private buildHierarchy(tempTree: IntArray, indices: number[], stats: BuildStats) {
    //  create space for the first node
    tempTree.add((3 + 30));
    //  dummy leaf
    tempTree.add(0);
    tempTree.add(0);
    if ((this.objects.length == 0)) {
        return;
    }

    //  seed bbox
    let gridBox: number[] = [
        this.bounds.getMinimum().x,
        this.bounds.getMaximum().x,
        this.bounds.getMinimum().y,
        this.bounds.getMaximum().y,
        this.bounds.getMinimum().z,
        this.bounds.getMaximum().z];
    let nodeBox: number[] = [
        this.bounds.getMinimum().x,
        this.bounds.getMaximum().x,
        this.bounds.getMinimum().y,
        this.bounds.getMaximum().y,
        this.bounds.getMinimum().z,
        this.bounds.getMaximum().z];
    //  seed subdivide function
    this.subdivide(0, (this.objects.length - 1), tempTree, indices, gridBox, nodeBox, 0, 1, stats);
}

private createNode(tempTree: IntArray, nodeIndex: number, left: number, right: number) {
    //  write leaf node
    tempTree.set((nodeIndex + 0), ((3 + 30)
    | left));
    tempTree.set((nodeIndex + 1), ((right - left)
    + 1));
}

private subdivide(left: number, right: number, tempTree: IntArray, indices: number[], gridBox: number[], nodeBox: number[], nodeIndex: number, depth: number, stats: BuildStats) {
    if (((((right - left)
        + 1)
        <= this.maxPrims)
        || (depth >= 64))) {
        //  write leaf node
        stats.updateLeaf(depth, ((right - left)
        + 1));
        this.createNode(tempTree, nodeIndex, left, right);
        return;
    }

    //  calculate extents
    let rightOrig: number;
    let axis: number = -1;
    let prevAxis: number;
    let prevClip: number = Float.NaN;
    let clipL: number = Float.NaN;
    let clipR: number = Float.NaN;
    let prevSplit: number;
    let split: number = Float.NaN;
    let wasLeft: boolean = true;
    while (true) {
        prevAxis = axis;
        prevSplit = split;
        //  perform quick consistency checks
        let d: number[] = [
            (gridBox[1] - gridBox[0]),
            (gridBox[3] - gridBox[2]),
            (gridBox[5] - gridBox[4])];
        if (((d[0] < 0)
            || ((d[1] < 0)
            || (d[2] < 0)))) {
            throw new IllegalStateException("negative node extents");
        }

        for (let i: number = 0; (i < 3); i++) {
            if (((nodeBox[((2 * i)
                + 1)] < gridBox[(2 * i)])
                || (nodeBox[(2 * i)] > gridBox[((2 * i)
                + 1)]))) {
                UI.printError(Module.ACCEL, "Reached tree area in error - discarding node with: %d objects", ((right - left)
                + 1));
                throw new IllegalStateException("invalid node overlap");
            }

        }

        //  find longest axis
        if (((d[0] > d[1])
            && (d[0] > d[2]))) {
            axis = 0;
        }
        else if ((d[1] > d[2])) {
            axis = 1;
        }
        else {
            axis = 2;
        }

        split = (0.5
        * (gridBox[(2 * axis)] + gridBox[((2 * axis)
        + 1)]));
        //  partition L/R subsets
        clipL = Float.NEGATIVE_INFINITY;
        clipR = Float.POSITIVE_INFINITY;
        rightOrig = right;
        //  save this for later
        let nodeL: number = Float.POSITIVE_INFINITY;
        let nodeR: number = Float.NEGATIVE_INFINITY;
        for (let i: number = left; (i <= right);
        ) {
            let obj: number = indices[i];
            let minb: number = this.primitives.getPrimitiveBound(obj, ((2 * axis)
            + 0));
            let maxb: number = this.primitives.getPrimitiveBound(obj, ((2 * axis)
            + 1));
            let center: number = ((minb + maxb)
            * 0.5);
            if ((center <= split)) {
                //  stay left
                i++;
                if ((clipL < maxb)) {
                    clipL = maxb;
                }

            }
            else {
                //  move to the right most
                let t: number = indices[i];
                indices[i] = indices[right];
                indices[right] = t;
                right--;
                if ((clipR > minb)) {
                    clipR = minb;
                }

            }

            if ((nodeL > minb)) {
                nodeL = minb;
            }

            if ((nodeR < maxb)) {
                nodeR = maxb;
            }

        }

        //  check for empty space
        if (((nodeL > nodeBox[((2 * axis)
            + 0)])
            && (nodeR < nodeBox[((2 * axis)
            + 1)]))) {
            let nodeBoxW: number = (nodeBox[((2 * axis)
            + 1)] - nodeBox[((2 * axis)
            + 0)]);
            let nodeNewW: number = (nodeR - nodeL);
            //  node box is too big compare to space occupied by primitives?
            if (((1.3 * nodeNewW)
                < nodeBoxW)) {
                stats.updateBVH2();
                let nextIndex: number = tempTree.getSize();
                //  allocate child
                tempTree.add(0);
                tempTree.add(0);
                tempTree.add(0);
                //  write bvh2 clip node
                stats.updateInner();
                tempTree.set((nodeIndex + 0), ((axis + 30)
                | ((1 + 29)
                | nextIndex)));
                tempTree.set((nodeIndex + 1), Float.floatToRawIntBits(nodeL));
                tempTree.set((nodeIndex + 2), Float.floatToRawIntBits(nodeR));
                //  update nodebox and recurse
                nodeBox[((2 * axis)
                + 0)] = nodeL;
                nodeBox[((2 * axis)
                + 1)] = nodeR;
                this.subdivide(left, rightOrig, tempTree, indices, gridBox, nodeBox, nextIndex, (depth + 1), stats);
                return;
            }

        }

        //  ensure we are making progress in the subdivision
        if ((right == rightOrig)) {
            //  all left
            if ((clipL <= split)) {
                //  keep looping on left half
                gridBox[((2 * axis)
                + 1)] = split;
                prevClip = clipL;
                wasLeft = true;
                // TODO: Warning!!! continue If
            }

            if (((prevAxis == axis)
                && (prevSplit == split))) {
                //  we are stuck here - create a leaf
                stats.updateLeaf(depth, ((right - left)
                + 1));
                this.createNode(tempTree, nodeIndex, left, right);
                return;
            }

            gridBox[((2 * axis)
            + 1)] = split;
            prevClip = Float.NaN;
        }
        else if ((left > right)) {
            //  all right
            right = rightOrig;
            if ((clipR >= split)) {
                //  keep looping on right half
                gridBox[((2 * axis)
                + 0)] = split;
                prevClip = clipR;
                wasLeft = false;
                // TODO: Warning!!! continue If
            }

            if (((prevAxis == axis)
                && (prevSplit == split))) {
                //  we are stuck here - create a leaf
                stats.updateLeaf(depth, ((right - left)
                + 1));
                this.createNode(tempTree, nodeIndex, left, right);
                return;
            }

            gridBox[((2 * axis)
            + 0)] = split;
            prevClip = Float.NaN;
        }
        else {
            //  we are actually splitting stuff
            if (((prevAxis != -1)
                && !Float.isNaN(prevClip))) {
                //  second time through - lets create the previous split
                //  since it produced empty space
                let nextIndex: number = tempTree.getSize();
                //  allocate child node
                tempTree.add(0);
                tempTree.add(0);
                tempTree.add(0);
                if (wasLeft) {
                    //  create a node with a left child
                    //  write leaf node
                    stats.updateInner();
                    tempTree.set((nodeIndex + 0), ((prevAxis + 30)
                    | nextIndex));
                    tempTree.set((nodeIndex + 1), Float.floatToRawIntBits(prevClip));
                    tempTree.set((nodeIndex + 2), Float.floatToRawIntBits(Float.POSITIVE_INFINITY));
                }
                else {
                    //  create a node with a right child
                    //  write leaf node
                    stats.updateInner();
                    tempTree.set((nodeIndex + 0), ((prevAxis + 30)
                    | (nextIndex - 3)));
                    tempTree.set((nodeIndex + 1), Float.floatToRawIntBits(Float.NEGATIVE_INFINITY));
                    tempTree.set((nodeIndex + 2), Float.floatToRawIntBits(prevClip));
                }

                //  count stats for the unused leaf
                depth++;
                stats.updateLeaf(depth, 0);
                //  now we keep going as we are, with a new nodeIndex:
                nodeIndex = nextIndex;
            }

            break;
        }

    }

    //  compute index of child nodes
    let nextIndex: number = tempTree.getSize();
    //  allocate left node
    let nl: number = ((right - left)
    + 1);
    let nr: number = ((rightOrig
    - (right + 1))
    + 1);
    if ((nl > 0)) {
        tempTree.add(0);
        tempTree.add(0);
        tempTree.add(0);
    }
    else {
        nextIndex -= 3;
    }

    //  allocate right node
    if ((nr > 0)) {
        tempTree.add(0);
        tempTree.add(0);
        tempTree.add(0);
    }

    //  write leaf node
    stats.updateInner();
    tempTree.set((nodeIndex + 0), ((axis + 30)
    | nextIndex));
    tempTree.set((nodeIndex + 1), Float.floatToRawIntBits(clipL));
    tempTree.set((nodeIndex + 2), Float.floatToRawIntBits(clipR));
    //  prepare L/R child boxes
    let gridBoxL: number[] = new Array(6);
    let gridBoxR: number[] = new Array(6);
    let nodeBoxL: number[] = new Array(6);
    let nodeBoxR: number[] = new Array(6);
    for (let i: number = 0; (i < 6); i++) {
        gridBoxR[i] = gridBox[i];
        gridBoxL[i] = gridBox[i];
        nodeBoxR[i] = nodeBox[i];
        nodeBoxL[i] = nodeBox[i];
    }

    gridBoxR[(2 * axis)] = split;
    gridBoxL[((2 * axis)
    + 1)] = split;
    nodeBoxL[((2 * axis)
    + 1)] = clipL;
    nodeBoxR[((2 * axis)
    + 0)] = clipR;
    //  free memory
    nodeBox = null;
    gridBox = null;
    //  recurse
    if ((nl > 0)) {
        this.subdivide(left, right, tempTree, indices, gridBoxL, nodeBoxL, nextIndex, (depth + 1), stats);
    }
    else {
        stats.updateLeaf((depth + 1), 0);
    }

    if ((nr > 0)) {
        this.subdivide((right + 1), rightOrig, tempTree, indices, gridBoxR, nodeBoxR, (nextIndex + 3), (depth + 1), stats);
    }
    else {
        stats.updateLeaf((depth + 1), 0);
    }

}

public intersect(r: Ray, state: IntersectionState) {
    let intervalMin: number = r.getMin();
    let intervalMax: number = r.getMax();
    let orgX: number = r.ox;
    let invDirX: number = (1 / dirX);
    let dirX: number = r.dx;
    let t2: number;
    let t1: number;
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

    let orgY: number = r.oy;
    let invDirY: number = (1 / dirY);
    let dirY: number = r.dy;
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

    let orgZ: number = r.oz;
    let invDirZ: number = (1 / dirZ);
    let dirZ: number = r.dz;
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
    let offsetXFront: number;
    31;
    let offsetYFront: number;
    31;
    let offsetZFront: number;
    31;
    let offsetXBack: number = (offsetXFront | 1);
    // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
    let offsetYBack: number = (offsetYFront | 1);
    // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
    let offsetZBack: number = (offsetZFront | 1);
    // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
    let offsetXFront3: number = (offsetXFront * 3);
    let offsetYFront3: number = (offsetYFront * 3);
    let offsetZFront3: number = (offsetZFront * 3);
    let offsetXBack3: number = (offsetXBack * 3);
    let offsetYBack3: number = (offsetYBack * 3);
    let offsetZBack3: number = (offsetZBack * 3);
    //  avoid always adding 1 during the inner loop
    offsetXFront++;
    offsetYFront++;
    offsetZFront++;
    offsetXBack++;
    offsetYBack++;
    offsetZBack++;
    let stack: IntersectionState.StackNode[] = state.getStack();
    let stackTop: number = state.getStackTop();
    let stackPos: number = stackTop;
    let node: number = 0;
    while (true) {
        /* Warning! Labeled Statements are not Implemented */while (true) {
            let tn: number = this.tree[node];
            let axis: number = (tn & (7 + 29));
            let offset: number;
            (7 + 29);
            switch (axis) {
                case 0:
                    //  x axis
                    let tf: number = ((Float.intBitsToFloat(this.tree[(node + offsetXFront)]) - orgX)
                    * invDirX);
                    let tb: number = ((Float.intBitsToFloat(this.tree[(node + offsetXBack)]) - orgX)
                    * invDirX);
                    //  ray passes between clip zones
                    if (((tf < intervalMin)
                        && (tb > intervalMax))) {
                        break;
                    }

                    pushloop;
                    let back: number = (offset + offsetXBack3);
                    node = back;
                    //  ray passes through far node only
                    if ((tf < intervalMin)) {
                        intervalMin = (tb >= intervalMin);
                        // TODO: Warning!!!, inline IF is not supported ?
                        // TODO: Warning!!! continue If
                    }

                    node = (offset + offsetXFront3);
                    //  front
                    //  ray passes through near node only
                    if ((tb > intervalMax)) {
                        intervalMax = (tf <= intervalMax);
                        // TODO: Warning!!!, inline IF is not supported ?
                        // TODO: Warning!!! continue If
                    }

                    //  ray passes through both nodes
                    //  push back node
                    stack[stackPos].node = back;
                    stack[stackPos].near = (tb >= intervalMin);
                    // TODO: Warning!!!, inline IF is not supported ?
                    stack[stackPos].far = intervalMax;
                    stackPos++;
                    //  update ray interval for front node
                    intervalMax = (tf <= intervalMax);
                    // TODO: Warning!!!, inline IF is not supported ?
                    // TODO: Warning!!! continue If
                    break;
                case (1 + 30):
                    let tf: number = ((Float.intBitsToFloat(this.tree[(node + offsetYFront)]) - orgY)
                    * invDirY);
                    let tb: number = ((Float.intBitsToFloat(this.tree[(node + offsetYBack)]) - orgY)
                    * invDirY);
                    //  ray passes between clip zones
                    if (((tf < intervalMin)
                        && (tb > intervalMax))) {
                        break;
                    }

                    pushloop;
                    let back: number = (offset + offsetYBack3);
                    node = back;
                    //  ray passes through far node only
                    if ((tf < intervalMin)) {
                        intervalMin = (tb >= intervalMin);
                        // TODO: Warning!!!, inline IF is not supported ?
                        // TODO: Warning!!! continue If
                    }

                    node = (offset + offsetYFront3);
                    //  front
                    //  ray passes through near node only
                    if ((tb > intervalMax)) {
                        intervalMax = (tf <= intervalMax);
                        // TODO: Warning!!!, inline IF is not supported ?
                        // TODO: Warning!!! continue If
                    }

                    //  ray passes through both nodes
                    //  push back node
                    stack[stackPos].node = back;
                    stack[stackPos].near = (tb >= intervalMin);
                    // TODO: Warning!!!, inline IF is not supported ?
                    stack[stackPos].far = intervalMax;
                    stackPos++;
                    //  update ray interval for front node
                    intervalMax = (tf <= intervalMax);
                    // TODO: Warning!!!, inline IF is not supported ?
                    // TODO: Warning!!! continue If
                    break;
                case (2 + 30):
                    //  z axis
                    let tf: number = ((Float.intBitsToFloat(this.tree[(node + offsetZFront)]) - orgZ)
                    * invDirZ);
                    let tb: number = ((Float.intBitsToFloat(this.tree[(node + offsetZBack)]) - orgZ)
                    * invDirZ);
                    //  ray passes between clip zones
                    if (((tf < intervalMin)
                        && (tb > intervalMax))) {
                        break;
                    }

                    pushloop;
                    let back: number = (offset + offsetZBack3);
                    node = back;
                    //  ray passes through far node only
                    if ((tf < intervalMin)) {
                        intervalMin = (tb >= intervalMin);
                        // TODO: Warning!!!, inline IF is not supported ?
                        // TODO: Warning!!! continue If
                    }

                    node = (offset + offsetZFront3);
                    //  front
                    //  ray passes through near node only
                    if ((tb > intervalMax)) {
                        intervalMax = (tf <= intervalMax);
                        // TODO: Warning!!!, inline IF is not supported ?
                        // TODO: Warning!!! continue If
                    }

                    //  ray passes through both nodes
                    //  push back node
                    stack[stackPos].node = back;
                    stack[stackPos].near = (tb >= intervalMin);
                    // TODO: Warning!!!, inline IF is not supported ?
                    stack[stackPos].far = intervalMax;
                    stackPos++;
                    //  update ray interval for front node
                    intervalMax = (tf <= intervalMax);
                    // TODO: Warning!!!, inline IF is not supported ?
                    // TODO: Warning!!! continue If
                    break;
                case (3 + 30):
                    //  leaf - test some objects
                    let n: number = this.tree[(node + 1)];
                    while ((n > 0)) {
                        this.primitives.intersectPrimitive(r, this.objects[offset], state);
                        n--;
                        offset++;
                    }

                    break;
                    pushloop;
                    break;
                case (1 + 29):
                    let tf: number = ((Float.intBitsToFloat(this.tree[(node + offsetXFront)]) - orgX)
                    * invDirX);
                    let tb: number = ((Float.intBitsToFloat(this.tree[(node + offsetXBack)]) - orgX)
                    * invDirX);
                    node = offset;
                    intervalMin = (tf >= intervalMin);
                    // TODO: Warning!!!, inline IF is not supported ?
                    intervalMax = (tb <= intervalMax);
                    // TODO: Warning!!!, inline IF is not supported ?
                    if ((intervalMin > intervalMax)) {
                        break;
                    }

                    pushloop;
                    // TODO: Warning!!! continue If
                    break;
                case (3 + 29):
                    let tf: number = ((Float.intBitsToFloat(this.tree[(node + offsetYFront)]) - orgY)
                    * invDirY);
                    let tb: number = ((Float.intBitsToFloat(this.tree[(node + offsetYBack)]) - orgY)
                    * invDirY);
                    node = offset;
                    intervalMin = (tf >= intervalMin);
                    // TODO: Warning!!!, inline IF is not supported ?
                    intervalMax = (tb <= intervalMax);
                    // TODO: Warning!!!, inline IF is not supported ?
                    if ((intervalMin > intervalMax)) {
                        break;
                    }

                    pushloop;
                    // TODO: Warning!!! continue If
                    break;
                case (5 + 29):
                    let tf: number = ((Float.intBitsToFloat(this.tree[(node + offsetZFront)]) - orgZ)
                    * invDirZ);
                    let tb: number = ((Float.intBitsToFloat(this.tree[(node + offsetZBack)]) - orgZ)
                    * invDirZ);
                    node = offset;
                    intervalMin = (tf >= intervalMin);
                    // TODO: Warning!!!, inline IF is not supported ?
                    intervalMax = (tb <= intervalMax);
                    // TODO: Warning!!!, inline IF is not supported ?
                    if ((intervalMin > intervalMax)) {
                        break;
                    }

                    pushloop;
                    // TODO: Warning!!! continue If
                    break;
                default:
                    return;
                    //  should not happen
                    break;
            }

            //  switch
        }

        //  traversal loop
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
                // TODO: Warning!!! continue If
            }

            node = stack[stackPos].node;
            intervalMax = stack[stackPos].far;
            break; //Warning!!! Review that break works as 'Exit Select' as it is inside another 'breakable' statement:For
        }

    }

}
}