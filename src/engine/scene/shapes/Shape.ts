import {Box} from "./Box";
import {Hit} from "../../math/Hit";
import {Color} from "../../math/Color";
import {Material} from "../materials/Material";
import {Vector3} from "../../math/Vector3";
import {Ray} from "../../math/Ray";
import {Cube} from "./Cube";
import {Sphere} from "./Sphere";
import {Mesh} from "./Mesh";
import {Triangle} from "./Triangle";
import {TransformedShape} from "./TransformedShape";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export enum ShapeType{
    TRIANGLE,
    CUBE,
    SPHERE,
    MESH,
    TRANSFORMED_SHAPE
}
export interface Shape {

    type:ShapeType;
    box:Box;
    compile();
    intersect(r:Ray):Hit;
    getColor(p:Vector3):Color;
    getMaterial(p:Vector3):Material;
    getNormal(p:Vector3):Vector3;
    getRandomPoint():Vector3;
}
export function ShapesfromJson(shapes:Shape[]):Shape[] {
    var _shapes:Shape[] = [];
    shapes.forEach(function(shape:Shape){

        switch(shape.type){
            case ShapeType.CUBE:
                _shapes.push(Cube.fromJson(<Cube>shape));
                break;
            case ShapeType.SPHERE:
                _shapes.push(Sphere.fromJson(<Sphere>shape));
                break;
            case ShapeType.MESH:
                _shapes.push(Mesh.fromJson(<Mesh>shape));
                break;
            case ShapeType.TRANSFORMED_SHAPE:
                _shapes.push(TransformedShape.fromJson(<TransformedShape>shape));
                break;
            case ShapeType.TRIANGLE:
                _shapes.push(<Triangle>Triangle.fromJson(<Triangle>shape));
                break;
        }

    });
    return _shapes;
}
export function ShapefromJson(shape:Shape):Shape{
    switch(shape.type){
        case ShapeType.CUBE:
            return Cube.fromJson(<Cube>shape);
            break;
        case ShapeType.SPHERE:
            return Sphere.fromJson(<Sphere>shape);
            break;
        case ShapeType.MESH:
            return Mesh.fromJson(<Mesh>shape);
            break;
        case ShapeType.TRANSFORMED_SHAPE:
            return TransformedShape.fromJson(<TransformedShape>shape);
            break;
        case ShapeType.TRIANGLE:
            return <Triangle>Triangle.fromJson(<Triangle>shape);
            break;
    }
}