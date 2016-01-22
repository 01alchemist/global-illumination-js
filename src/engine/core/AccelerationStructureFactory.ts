/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
class AccelerationStructureFactory {

    static create(name: String, n: number, primitives: boolean): AccelerationStructure {
        if (((name == null)
            || name.equals("auto"))) {
            if (primitives) {
                if ((n > 20000000)) {
                    return new UniformGrid();
                }
                else if ((n > 2000000)) {
                    return new BoundingIntervalHierarchy();
                }
                else if ((n > 2)) {
                    return new KDTree();
                }
                else {
                    return new NullAccelerator();
                }

            }
            else if ((n > 2)) {
                return new BoundingIntervalHierarchy();
            }
            else {
                return new NullAccelerator();
            }

        }
        else if (name.equals("uniformgrid")) {
            return new UniformGrid();
        }
        else if (name.equals("null")) {
            return new NullAccelerator();
        }
        else if (name.equals("kdtree")) {
            return new KDTree();
        }
        else if (name.equals("bih")) {
            return new BoundingIntervalHierarchy();
        }
        else {
            UI.printWarning(Module.ACCEL, "Unrecognized intersection accelerator \""%s\"" - using auto", name);
            return AccelerationStructureFactory.create(null, n, primitives);
        }

    }
}