/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export /* abstract */ class CubeGrid implements PrimitiveList {

    private nx:number;

    private ny:number;

    private nz:number;

    private voxelwx:number;

    private voxelwy:number;

    private voxelwz:number;

    private invVoxelwx:number;

    private invVoxelwy:number;

    private invVoxelwz:number;

    private bounds:BoundingBox;

    constructor () {
        this.nz = 1;
        this.ny = 1;
        this.nx = 1;
        this.ny = 1;
        this.nx = 1;
        this.bounds = new BoundingBox(1);
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        this.nx = pl.getInt("resolutionX", this.nx);
        this.ny = pl.getInt("resolutionY", this.ny);
        this.nz = pl.getInt("resolutionZ", this.nz);
        this.voxelwx = (2 / this.nx);
        this.voxelwy = (2 / this.ny);
        this.voxelwz = (2 / this.nz);
        this.invVoxelwx = (1 / this.voxelwx);
        this.invVoxelwy = (1 / this.voxelwy);
        this.invVoxelwz = (1 / this.voxelwz);
        return true;
    }

    protected abstract inside(x:number, y:number, z:number):boolean;

    getBounds():BoundingBox {
        return this.bounds;
    }

    prepareShadingState(state:ShadingState) {
        state.init();
        state.getRay().getPoint(state.getPoint());
        let parent:Instance = state.getInstance();
        let normal:Vector3;
        switch (state.getPrimitiveID()) {
            case 0:
                normal = new Vector3(-1, 0, 0);
                break;
            case 1:
                normal = new Vector3(1, 0, 0);
                break;
            case 2:
                normal = new Vector3(0, -1, 0);
                break;
            case 3:
                normal = new Vector3(0, 1, 0);
                break;
            case 4:
                normal = new Vector3(0, 0, -1);
                break;
            case 5:
                normal = new Vector3(0, 0, 1);
                break;
            default:
                normal = new Vector3(0, 0, 0);
                break;
        }

        state.getNormal().set(parent.transformNormalObjectToWorld(normal));
        state.getGeoNormal().set(state.getNormal());
        state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
        state.setShader(parent.getShader(0));
        state.setModifier(parent.getModifier(0));
    }

    intersectPrimitive(r:Ray, primID:number, state:IntersectionState) {
        let intervalMin:number = r.getMin();
        let intervalMax:number = r.getMax();
        let orgX:number = r.ox;
        let orgY:number = r.oy;
        let orgZ:number = r.oz;
        let invDirX:number = (1 / dirX);
        let dirX:number = r.dx;
        let invDirY:number = (1 / dirY);
        let dirY:number = r.dy;
        let invDirZ:number = (1 / dirZ);
        let dirZ:number = r.dz;
        let t2:number;
        let t1:number;
        t1 = (((1 - orgX)
        * -1)
        * invDirX);
        t2 = ((1 - orgX)
        * invDirX);
        let curr:number = -1;
        if ((invDirX > 0)) {
            if ((t1 > intervalMin)) {
                intervalMin = t1;
                curr = 0;
            }

            if ((t2 < intervalMax)) {
                intervalMax = t2;
            }

            if ((intervalMin > intervalMax)) {
                return;
            }

        }
        else {
            if ((t2 > intervalMin)) {
                intervalMin = t2;
                curr = 1;
            }

            if ((t1 < intervalMax)) {
                intervalMax = t1;
            }

            if ((intervalMin > intervalMax)) {
                return;
            }

        }

        t1 = (((1 - orgY)
        * -1)
        * invDirY);
        t2 = ((1 - orgY)
        * invDirY);
        if ((invDirY > 0)) {
            if ((t1 > intervalMin)) {
                intervalMin = t1;
                curr = 2;
            }

            if ((t2 < intervalMax)) {
                intervalMax = t2;
            }

            if ((intervalMin > intervalMax)) {
                return;
            }

        }
        else {
            if ((t2 > intervalMin)) {
                intervalMin = t2;
                curr = 3;
            }

            if ((t1 < intervalMax)) {
                intervalMax = t1;
            }

            if ((intervalMin > intervalMax)) {
                return;
            }

        }

        t1 = (((1 - orgZ)
        * -1)
        * invDirZ);
        t2 = ((1 - orgZ)
        * invDirZ);
        if ((invDirZ > 0)) {
            if ((t1 > intervalMin)) {
                intervalMin = t1;
                curr = 4;
            }

            if ((t2 < intervalMax)) {
                intervalMax = t2;
            }

            if ((intervalMin > intervalMax)) {
                return;
            }

        }
        else {
            if ((t2 > intervalMin)) {
                intervalMin = t2;
                curr = 5;
            }

            if ((t1 < intervalMax)) {
                intervalMax = t1;
            }

            if ((intervalMin > intervalMax)) {
                return;
            }

        }

        //  box is hit at [intervalMin, intervalMax]
        orgX = (orgX
        + (intervalMin * dirX));
        orgY = (orgY
        + (intervalMin * dirY));
        orgZ = (orgZ
        + (intervalMin * dirZ));
        //  locate starting point inside the grid
        //  and set up 3D-DDA vars
        let indxZ:number;
        let indxX:number;
        let indxY:number;
        let stepZ:number;
        let stepX:number;
        let stepY:number;
        let stopZ:number;
        let stopX:number;
        let stopY:number;
        let deltaZ:number;
        let deltaX:number;
        let deltaY:number;
        let tnextZ:number;
        let tnextX:number;
        let tnextY:number;
        //  stepping factors along X
        indxX = (<number>(((orgX + 1)
        * this.invVoxelwx)));
        if ((indxX < 0)) {
            indxX = 0;
        }
        else if ((indxX >= this.nx)) {
            indxX = (this.nx - 1);
        }

        if ((Math.abs(dirX) < 1E-06)) {
            stepX = 0;
            stopX = indxX;
            deltaX = 0;
            tnextX = Float.POSITIVE_INFINITY;
        }
        else if ((dirX > 0)) {
            stepX = 1;
            stopX = this.nx;
            deltaX = (this.voxelwx * invDirX);
            tnextX = (intervalMin
            + ((((indxX + 1)
            * this.voxelwx) - (1 - orgX))
            * invDirX));
        }
        else {
            stepX = -1;
            stopX = -1;
            deltaX = ((this.voxelwx * invDirX)
            * -1);
            tnextX = (intervalMin
            + (((indxX * this.voxelwx) - (1 - orgX))
            * invDirX));
        }

        //  stepping factors along Y
        indxY = (<number>(((orgY + 1)
        * this.invVoxelwy)));
        if ((indxY < 0)) {
            indxY = 0;
        }
        else if ((indxY >= this.ny)) {
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
            * this.voxelwy) - (1 - orgY))
            * invDirY));
        }
        else {
            stepY = -1;
            stopY = -1;
            deltaY = ((this.voxelwy * invDirY)
            * -1);
            tnextY = (intervalMin
            + (((indxY * this.voxelwy) - (1 - orgY))
            * invDirY));
        }

        //  stepping factors along Z
        indxZ = (<number>(((orgZ + 1)
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
            * this.voxelwz) - (1 - orgZ))
            * invDirZ));
        }
        else {
            stepZ = -1;
            stopZ = -1;
            deltaZ = ((this.voxelwz * invDirZ)
            * -1);
            tnextZ = (intervalMin
            + (((indxZ * this.voxelwz) - (1 - orgZ))
            * invDirZ));
        }

        //  are we starting inside the cube
        let isInside:boolean = (this.inside(indxX, indxY, indxZ) && this.bounds.contains(r.ox, r.oy, r.oz));
        //  trace through the grid
        for (
            ; ;
        ) {
            if ((this.inside(indxX, indxY, indxZ) != isInside)) {
                //  we hit a boundary
                r.setMax(intervalMin);
                //  if we are inside, the last bit needs to be flipped
                if (isInside)
                    curr ^= 1;
                state.setIntersection(curr, 0, 0);
                return;
            }

            if (((tnextX < tnextY)
                && (tnextX < tnextZ))) {
                curr = (dirX > 0);
                // TODO:Warning!!!, inline IF is not supported ?
                intervalMin = tnextX;
                if ((intervalMin > intervalMax)) {
                    return;
                }

                indxX = (indxX + stepX);
                if ((indxX == stopX)) {
                    return;
                }

                tnextX = (tnextX + deltaX);
            }
            else if ((tnextY < tnextZ)) {
                curr = (dirY > 0);
                // TODO:Warning!!!, inline IF is not supported ?
                intervalMin = tnextY;
                if ((intervalMin > intervalMax)) {
                    return;
                }

                indxY = (indxY + stepY);
                if ((indxY == stopY)) {
                    return;
                }

                tnextY = (tnextY + deltaY);
            }
            else {
                curr = (dirZ > 0);
                // TODO:Warning!!!, inline IF is not supported ?
                intervalMin = tnextZ;
                if ((intervalMin > intervalMax)) {
                    return;
                }

                indxZ = (indxZ + stepZ);
                if ((indxZ == stopZ)) {
                    return;
                }

                tnextZ = (tnextZ + deltaZ);
            }

        }

    }

    getNumPrimitives():number {
        return 1;
    }

    getPrimitiveBound(primID:number, i:number):number {
        return ((i & 1)
        == 0);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    getWorldBounds(o2w:Matrix4):BoundingBox {
        if ((o2w == null)) {
            return this.bounds;
        }

        return o2w.transform(this.bounds);
    }
}