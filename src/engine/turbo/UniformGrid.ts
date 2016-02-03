import {BoundingBox} from "../math/BoundingBox";
import {PrimitiveList} from "../core/PrimitiveList";
import {AccelerationStructure} from "../core/AccelerationStructure";
import {Vector3} from "../math/Vector3";
import {MathUtils} from "../../system/utils/MathUtils";
import {IntArray} from "../../system/utils/IntArray";
import {Ray} from "../core/Ray";
import {IntersectionState} from "../core/IntersectionState";
import {Float} from "../../utils/BrowserPlatform";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class UniformGrid implements AccelerationStructure {

    private nx:int;
    private ny:int;
    private nz:int;
    private primitives:PrimitiveList;
    private bounds:BoundingBox;
    private cells:Int32Array[];
    private voxelwx:float;
    private voxelwy:float;
    private voxelwz:float;
    private invVoxelwx:float;
    private invVoxelwy:float;
    private invVoxelwz:float;

    constructor() {
        this.nz = 0;
        this.ny = 0;
        this.nx = 0;
        this.ny = 0;
        this.nx = 0;
        this.bounds = null;
        this.cells = null;
        this.voxelwz = 0;
        this.voxelwy = 0;
        this.voxelwx = 0;
        this.invVoxelwz = 0;
        this.invVoxelwy = 0;
        this.invVoxelwx = 0;
    }

    build(primitives:PrimitiveList):void {
        let t:number = performance.now();
        this.primitives = primitives;
        let n:number = primitives.getNumPrimitives();
        //  compute bounds
        this.bounds = primitives.getWorldBounds(null);
        //  create grid from number of objects
        this.bounds.enlargeUlps();
        let w:Vector3 = this.bounds.getExtents();
        let s:number = Math.pow(((w.x * (w.y * w.z)) / n), (1 / 3));
        this.nx = MathUtils.clamp(Math.round((w.x / s) + 0.5), 1, 128);
        this.ny = MathUtils.clamp(Math.round((w.y / s) + 0.5), 1, 128);
        this.nz = MathUtils.clamp(Math.round((w.z / s) + 0.5), 1, 128);
        this.voxelwx = (w.x / this.nx);
        this.voxelwy = (w.y / this.ny);
        this.voxelwz = (w.z / this.nz);
        this.invVoxelwx = (1 / this.voxelwx);
        this.invVoxelwy = (1 / this.voxelwy);
        this.invVoxelwz = (1 / this.voxelwz);
        console.log("Creating grid:" + this.nx + "x" + this.ny + "x" + this.nz + " ...");
        let buildCells:IntArray[] = [];//new IntArray[](this.nx * this.ny * this.nz);
        //  add all objects into the grid cells they overlap
        let imin:Int32Array = new Int32Array(3);
        let imax:Int32Array = new Int32Array(3);
        let numCellsPerObject:int = 0;
        for (let i:int = 0; (i < n); i++) {
            this.getGridIndex(this.primitives.getPrimitiveBound(i, 0), this.primitives.getPrimitiveBound(i, 2), this.primitives.getPrimitiveBound(i, 4), imin);
            this.getGridIndex(this.primitives.getPrimitiveBound(i, 1), this.primitives.getPrimitiveBound(i, 3), this.primitives.getPrimitiveBound(i, 5), imax);
            for (let ix:int = imin[0]; (ix <= imax[0]); ix++) {

                for (let iy:int = imin[1]; (iy <= imax[1]); iy++) {

                    for (let iz:int = imin[2]; (iz <= imax[2]); iz++) {

                        let idx:int = (ix + ((this.nx * iy) + (this.nx * (this.ny * iz))));

                        if (buildCells[idx] == null) {
                            buildCells[idx] = new IntArray();
                        }

                        buildCells[idx].add(i);
                        numCellsPerObject++;
                    }
                }
            }
        }

        console.log("Building cells ...");
        let numEmpty:int = 0;
        let numInFull:int = 0;
        this.cells = [];//new Int32Array[](this.nx * this.ny * this.nz);
        let i:int = 0;
        buildCells.forEach(function (cell:IntArray) {
            if (cell != null) {
                if (cell.getSize() == 0) {
                    numEmpty++;
                    cell = null;
                }
                else {
                    this.cells[i] = cell.trim();
                    numInFull = numInFull + cell.getSize();
                }
            }
            else {
                numEmpty++;
            }
            i++;
        });

        t = performance.now() - t;
        console.log("Uniform grid statistics:");
        console.log("  * Grid cells:         " + this.cells.length);
        console.log("  * Used cells:         " + this.cells.length - numEmpty);
        console.log("  * Empty cells:        " + numEmpty);
        console.log("  * Occupancy:          " + 100 * (this.cells.length - numEmpty) / this.cells.length);
        console.log("  * Objects/Cell:       " + numInFull / this.cells.length);
        console.log("  * Objects/Used Cell:  " + numInFull / this.cells.length - numEmpty);
        console.log("  * Cells/Object:       " + numCellsPerObject / n);
        console.log("  * Build time:         " + t.toString());
    }

    intersect(r:Ray, state:IntersectionState) {
        let intervalMin:float = r.getMin();
        let intervalMax:float = r.getMax();
        let orgX:float = r.ox;
        let dirX:float = r.dx;
        let invDirX:float = (1 / dirX);
        let t1:float = (this.bounds.getMinimum().x - orgX) * invDirX;
        let t2:float = (this.bounds.getMaximum().x - orgX) * invDirX;

        if (invDirX > 0) {
            if (t1 > intervalMin) {
                intervalMin = t1;
            }

            if (t2 < intervalMax) {
                intervalMax = t2;
            }

        }
        else {
            if (t2 > intervalMin) {
                intervalMin = t2;
            }

            if (t1 < intervalMax) {
                intervalMax = t1;
            }

        }

        if (intervalMin > intervalMax) {
            return;
        }

        let orgY:number = r.oy;
        let dirY:number = r.dy;
        let invDirY:number = (1 / dirY);
        t1 = (this.bounds.getMinimum().y - orgY) * invDirY;
        t2 = (this.bounds.getMaximum().y - orgY) * invDirY;
        if (invDirY > 0) {
            if (t1 > intervalMin) {
                intervalMin = t1;
            }

            if (t2 < intervalMax) {
                intervalMax = t2;
            }

        }
        else {
            if (t2 > intervalMin) {
                intervalMin = t2;
            }

            if (t1 < intervalMax) {
                intervalMax = t1;
            }

        }

        if (intervalMin > intervalMax) {
            return;
        }

        let orgZ:number = r.oz;
        let dirZ:number = r.dz;
        let invDirZ:number = (1 / dirZ);
        t1 = (this.bounds.getMinimum().z - orgZ) * invDirZ;
        t2 = (this.bounds.getMaximum().z - orgZ) * invDirZ;
        if (invDirZ > 0) {
            if (t1 > intervalMin) {
                intervalMin = t1;
            }

            if (t2 < intervalMax) {
                intervalMax = t2;
            }

        }
        else {
            if (t2 > intervalMin) {
                intervalMin = t2;
            }

            if (t1 < intervalMax) {
                intervalMax = t1;
            }

        }

        if (intervalMin > intervalMax) {
            return;
        }

        //  box is hit at [intervalMin, intervalMax]
        orgX += intervalMin * dirX;
        orgY += intervalMin * dirY;
        orgZ += intervalMin * dirZ;
        //  locate starting point inside the grid
        //  and set up 3D-DDA vars
        let indxZ:int;
        let indxX:int;
        let indxY:int;
        let stepZ:int;
        let stepX:int;
        let stepY:int;
        let stopZ:int;
        let stopX:int;
        let stopY:int;
        let deltaZ:float;
        let deltaX:float;
        let deltaY:float;
        let tnextZ:float;
        let tnextX:float;
        let tnextY:float;
        //  stepping factors along X
        indxX = Math.round((orgX - this.bounds.getMinimum().x) * this.invVoxelwx);
        if (indxX < 0) {
            indxX = 0;
        }
        else if (indxX >= this.nx) {
            indxX = (this.nx - 1);
        }

        if (Math.abs(dirX) < 1e-06) {
            stepX = 0;
            stopX = indxX;
            deltaX = 0;
            tnextX = Float.POSITIVE_INFINITY;
        }
        else if (dirX > 0) {
            stepX = 1;
            stopX = this.nx;
            deltaX = this.voxelwx * invDirX;
            tnextX = intervalMin + ((((indxX + 1) * this.voxelwx) + (this.bounds.getMinimum().x - orgX)) * invDirX);
        }
        else {
            stepX = -1;
            stopX = -1;
            deltaX = (this.voxelwx * invDirX) * -1;
            tnextX = intervalMin + (((indxX * this.voxelwx) + (this.bounds.getMinimum().x - orgX)) * invDirX);
        }

        //  stepping factors along Y
        indxY = Math.round((orgY - this.bounds.getMinimum().y) * this.invVoxelwy);
        if (indxY < 0) {
            indxY = 0;
        }
        else if (indxY >= this.ny) {
            indxY = (this.ny - 1);
        }

        if ((Math.abs(dirY) < 1E-06)) {
            stepY = 0;
            stopY = indxY;
            deltaY = 0;
            tnextY = Float.POSITIVE_INFINITY;
        }
        else if ((dirY > 0)) {
            stepY = 1;
            stopY = this.ny;
            deltaY = (this.voxelwy * invDirY);
            tnextY = (intervalMin
            + ((((indxY + 1)
            * this.voxelwy)
            + (this.bounds.getMinimum().y - orgY))
            * invDirY));
        }
        else {
            stepY = -1;
            stopY = -1;
            deltaY = ((this.voxelwy * invDirY)
            * -1);
            tnextY = (intervalMin
            + (((indxY * this.voxelwy)
            + (this.bounds.getMinimum().y - orgY))
            * invDirY));
        }

        //  stepping factors along Z
        indxZ = (<number>(((orgZ - this.bounds.getMinimum().z)
        * this.invVoxelwz)));
        if ((indxZ < 0)) {
            indxZ = 0;
        }
        else if ((indxZ >= this.nz)) {
            indxZ = (this.nz - 1);
        }

        if ((Math.abs(dirZ) < 1E-06)) {
            stepZ = 0;
            stopZ = indxZ;
            deltaZ = 0;
            tnextZ = Float.POSITIVE_INFINITY;
        }
        else if ((dirZ > 0)) {
            stepZ = 1;
            stopZ = this.nz;
            deltaZ = (this.voxelwz * invDirZ);
            tnextZ = (intervalMin
            + ((((indxZ + 1)
            * this.voxelwz)
            + (this.bounds.getMinimum().z - orgZ))
            * invDirZ));
        }
        else {
            stepZ = -1;
            stopZ = -1;
            deltaZ = ((this.voxelwz * invDirZ)
            * -1);
            tnextZ = (intervalMin
            + (((indxZ * this.voxelwz)
            + (this.bounds.getMinimum().z - orgZ))
            * invDirZ));
        }

        let cellstepX:number = stepX;
        let cellstepY:number = (stepY * this.nx);
        let cellstepZ:number = (stepZ * (this.ny * this.nx));
        let cell:number = (indxX + ((indxY * this.nx) + (indxZ * (this.ny * this.nx))));
        //  trace through the grid
        for (; ;) {
            if (((tnextX < tnextY)
                && (tnextX < tnextZ))) {
                if ((this.cells[cell] != null)) {
                    for (let i:number in this.cells[cell]) {
                        this.primitives.intersectPrimitive(r, i, state);
                    }

                    if ((state.hit()
                        && ((r.getMax() < tnextX)
                        && (r.getMax() < intervalMax)))) {
                        return;
                    }

                }

                intervalMin = tnextX;
                if ((intervalMin > intervalMax)) {
                    return;
                }

                indxX = (indxX + stepX);
                if ((indxX == stopX)) {
                    return;
                }

                tnextX = (tnextX + deltaX);
                cell = (cell + cellstepX);
            }
            else if ((tnextY < tnextZ)) {
                if ((this.cells[cell] != null)) {
                    for (let i:number in this.cells[cell]) {
                        this.primitives.intersectPrimitive(r, i, state);
                    }

                    if ((state.hit()
                        && ((r.getMax() < tnextY)
                        && (r.getMax() < intervalMax)))) {
                        return;
                    }

                }

                intervalMin = tnextY;
                if ((intervalMin > intervalMax)) {
                    return;
                }

                indxY = (indxY + stepY);
                if ((indxY == stopY)) {
                    return;
                }

                tnextY = (tnextY + deltaY);
                cell = (cell + cellstepY);
            }
            else {
                if ((this.cells[cell] != null)) {
                    for (let i:number in this.cells[cell]) {
                        this.primitives.intersectPrimitive(r, i, state);
                    }

                    if ((state.hit()
                        && ((r.getMax() < tnextZ)
                        && (r.getMax() < intervalMax)))) {
                        return;
                    }

                }

                intervalMin = tnextZ;
                if ((intervalMin > intervalMax)) {
                    return;
                }

                indxZ = (indxZ + stepZ);
                if ((indxZ == stopZ)) {
                    return;
                }

                tnextZ = (tnextZ + deltaZ);
                cell = (cell + cellstepZ);
            }

        }

    }

    private getGridIndex(x:number, y:number, z:number, i:number[]) {
        i[0] = MathUtils.clamp((<number>(((x - this.bounds.getMinimum().x)
        * this.invVoxelwx))), 0, (this.nx - 1));
        i[1] = MathUtils.clamp((<number>(((y - this.bounds.getMinimum().y)
        * this.invVoxelwy))), 0, (this.ny - 1));
        i[2] = MathUtils.clamp((<number>(((z - this.bounds.getMinimum().z)
        * this.invVoxelwz))), 0, (this.nz - 1));
    }
}