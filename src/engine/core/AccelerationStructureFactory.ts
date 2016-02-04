import {AccelerationStructure} from "./AccelerationStructure";
import {UniformGrid} from "../turbo/UniformGrid";
import {BoundingIntervalHierarchy} from "../turbo/BoundingIntervalHierarchy";
import {KDTree} from "../turbo/KDTree";
import {NullAccelerator} from "../turbo/NullAccelerator";
import {AccelerationTypes} from "./AccelerationTypes";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
class AccelerationStructureFactory {

    static create(name:string, n:int, primitives:boolean):AccelerationStructure {
        if (name == null || name == AccelerationTypes.AUTO) {
            if (primitives) {
                if (n > 20000000) {
                    return new UniformGrid();
                }
                else if (n > 2000000) {
                    return new BoundingIntervalHierarchy();
                }
                else if (n > 2) {
                    return new KDTree();
                }
                else {
                    return new NullAccelerator();
                }

            }
            else if (n > 2) {
                return new BoundingIntervalHierarchy();
            }
            else {
                return new NullAccelerator();
            }

        }
        else if (name == AccelerationTypes.UNIFORM_GRID) {
            return new UniformGrid();
        }
        else if (name == AccelerationTypes.NULL) {
            return new NullAccelerator();
        }
        else if (name == AccelerationTypes.KD_TREE) {
            return new KDTree();
        }
        else if (name == AccelerationTypes.BIH) {
            return new BoundingIntervalHierarchy();
        }
        else {
            console.warn("ACCEL", "Unrecognized intersection accelerator "+name+" - using auto");
            return AccelerationStructureFactory.create(null, n, primitives);
        }

    }
}