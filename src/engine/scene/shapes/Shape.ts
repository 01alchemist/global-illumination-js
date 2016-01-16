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
    size:number;
    box:Box;
    compile();
    intersect(r:Ray):Hit;
    getColor(p:Vector3):Color;
    getMaterial(p:Vector3):Material;
    getNormal(p:Vector3):Vector3;
    getRandomPoint():Vector3;
    writeToMemory(memory:Float32Array, offset:number):number;
    read(memory:Float32Array, offset:number):number;
}
export function ShapesfromJson(shapes:Shape[]):Shape[] {
    var _shapes:Shape[] = [];
    shapes.forEach(function (shape:Shape) {

        switch (shape.type) {
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
export function ShapefromJson(shape:Shape):Shape {
    switch (shape.type) {
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
export function restoreShape(memory:Float32Array, offset:number, container:Shape[]):number {
    var type:ShapeType = memory[offset++];
    var shape:Shape;
    switch (type) {
        case ShapeType.CUBE:
            shape = new Cube();
            offset = shape.read(memory, offset);
            break;
        case ShapeType.SPHERE:
            shape = new Sphere();
            offset = shape.read(memory, offset);
            break;
        case ShapeType.MESH:
            shape = new Mesh();
            offset = shape.read(memory, offset);
            break;
        case ShapeType.TRANSFORMED_SHAPE:
            shape = new TransformedShape();
            offset = shape.read(memory, offset);
            break;
        case ShapeType.TRIANGLE:
            shape = new Triangle();
            offset = shape.read(memory, offset);
            break;
        default:
            throw "Unknown shape";
            break;
    }

    if(container){
        container.push(shape);
    }
    return offset;
}