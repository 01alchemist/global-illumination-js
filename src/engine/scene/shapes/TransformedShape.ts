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
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class TransformedShape implements Shape{

    type:ShapeType = ShapeType.TRANSFORMED_SHAPE;

    constructor(public shape:Shape,
                public matrix:Matrix4,
                public inverse:Matrix4) {
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
    compile(){
        this.shape.compile();
    }
    intersect(r:Ray):Hit {
        var hit:Hit = this.shape.intersect(this.inverse.mulRay(r));
        if(!hit.ok()){
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
}
