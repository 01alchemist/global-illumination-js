import {Shape} from "./Shape";
import {Matrix4} from "../../math/Matrix4";
import {Box} from "./Box";
import {Hit} from "../../math/Hit";
import {Ray} from "../../math/Ray";
import {Vector3} from "../../math/Vector3";
import {Material} from "../materials/Material";
import {Color} from "../../math/Color";
import {ShapeType} from "./Shape";
import {ShapesfromJson} from "./Shape";
import {ShapefromJson} from "./Shape";
import {restoreShape} from "./Shape";
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class TransformedShape implements Shape {

    type:ShapeType = ShapeType.TRANSFORMED_SHAPE;
    index:number;

    get size():number {
        if (this.shape) {
            return this.shape.size + Matrix4.SIZE + 1;// store only one matrix
        } else {
            return 0;
        }
    };

    constructor(public shape:Shape = null,
                public matrix:Matrix4 = new Matrix4(),
                public inverse?:Matrix4) {
    }

    static fromJson(transformedShape:TransformedShape):TransformedShape {
        return new TransformedShape(
            ShapefromJson(transformedShape.shape),
            Matrix4.fromJson(transformedShape.matrix),
            Matrix4.fromJson(transformedShape.inverse)
        );
    }

    static newTransformedShape(s:Shape, m:Matrix4):Shape {
        return new TransformedShape(s, m, m.inverse());
    }

    get box():Box {
        return this.matrix.mulBox(this.shape.box);
    }

    compile() {
        this.shape.compile();
    }

    intersect(r:Ray):Hit {
        var hit:Hit = this.shape.intersect(this.inverse.mulRay(r));
        if (!hit.ok()) {
            return hit;
        }
        // if this.shape is a Mesh, the hit.Shape will be a Triangle in the Mesh
        // we need to transform this Triangle, not the Mesh itself
        var shape:TransformedShape = new TransformedShape(hit.shape, this.matrix, this.inverse);
        return new Hit(shape, hit.T);
    }

    getColor(p:Vector3):Color {
        return this.shape.getColor(this.inverse.mulPosition(p));
    }

    getMaterial(p:Vector3):Material {
        return this.shape.getMaterial(this.inverse.mulPosition(p));
    }

    getNormal(p:Vector3):Vector3 {
        return this.matrix.mulDirection(this.shape.getNormal(this.inverse.mulPosition(p)));
    }

    getRandomPoint():Vector3 {
        return this.matrix.mulPosition(this.shape.getRandomPoint());
    }

    writeToMemory(memory:Float32Array, offset:number):number {
        memory[offset++] = this.type;
        offset = this.matrix.writeToMemory(memory, offset);
        offset = this.shape.writeToMemory(memory, offset);
        return offset;
    }

    read(memory:Float32Array, offset:number):number {
        offset = this.matrix.read(memory, offset);
        this.inverse = this.matrix.inverse();
        var container:Shape[] = [];
        offset = restoreShape(memory, offset, container);
        this.shape = container[0];
        container = null;
        return offset;
    }
}
