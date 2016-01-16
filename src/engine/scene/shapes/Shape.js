System.register(["./Cube", "./Sphere", "./Mesh", "./Triangle", "./TransformedShape"], function(exports_1) {
    var Cube_1, Sphere_1, Mesh_1, Triangle_1, TransformedShape_1;
    var ShapeType;
    function ShapesfromJson(shapes) {
        var _shapes = [];
        shapes.forEach(function (shape) {
            switch (shape.type) {
                case ShapeType.CUBE:
                    _shapes.push(Cube_1.Cube.fromJson(shape));
                    break;
                case ShapeType.SPHERE:
                    _shapes.push(Sphere_1.Sphere.fromJson(shape));
                    break;
                case ShapeType.MESH:
                    _shapes.push(Mesh_1.Mesh.fromJson(shape));
                    break;
                case ShapeType.TRANSFORMED_SHAPE:
                    _shapes.push(TransformedShape_1.TransformedShape.fromJson(shape));
                    break;
                case ShapeType.TRIANGLE:
                    _shapes.push(Triangle_1.Triangle.fromJson(shape));
                    break;
            }
        });
        return _shapes;
    }
    exports_1("ShapesfromJson", ShapesfromJson);
    function ShapefromJson(shape) {
        switch (shape.type) {
            case ShapeType.CUBE:
                return Cube_1.Cube.fromJson(shape);
                break;
            case ShapeType.SPHERE:
                return Sphere_1.Sphere.fromJson(shape);
                break;
            case ShapeType.MESH:
                return Mesh_1.Mesh.fromJson(shape);
                break;
            case ShapeType.TRANSFORMED_SHAPE:
                return TransformedShape_1.TransformedShape.fromJson(shape);
                break;
            case ShapeType.TRIANGLE:
                return Triangle_1.Triangle.fromJson(shape);
                break;
        }
    }
    exports_1("ShapefromJson", ShapefromJson);
    function restoreShape(memory, offset, container) {
        var type = memory[offset++];
        var shape;
        switch (type) {
            case ShapeType.CUBE:
                shape = new Cube_1.Cube();
                offset = shape.read(memory, offset);
                break;
            case ShapeType.SPHERE:
                shape = new Sphere_1.Sphere();
                offset = shape.read(memory, offset);
                break;
            case ShapeType.MESH:
                shape = new Mesh_1.Mesh();
                offset = shape.read(memory, offset);
                break;
            case ShapeType.TRANSFORMED_SHAPE:
                shape = new TransformedShape_1.TransformedShape();
                offset = shape.read(memory, offset);
                break;
            case ShapeType.TRIANGLE:
                shape = new Triangle_1.Triangle();
                offset = shape.read(memory, offset);
                break;
            default:
                throw "Unknown shape";
                break;
        }
        if (container) {
            container.push(shape);
        }
        return offset;
    }
    exports_1("restoreShape", restoreShape);
    return {
        setters:[
            function (Cube_1_1) {
                Cube_1 = Cube_1_1;
            },
            function (Sphere_1_1) {
                Sphere_1 = Sphere_1_1;
            },
            function (Mesh_1_1) {
                Mesh_1 = Mesh_1_1;
            },
            function (Triangle_1_1) {
                Triangle_1 = Triangle_1_1;
            },
            function (TransformedShape_1_1) {
                TransformedShape_1 = TransformedShape_1_1;
            }],
        execute: function() {
            (function (ShapeType) {
                ShapeType[ShapeType["TRIANGLE"] = 0] = "TRIANGLE";
                ShapeType[ShapeType["CUBE"] = 1] = "CUBE";
                ShapeType[ShapeType["SPHERE"] = 2] = "SPHERE";
                ShapeType[ShapeType["MESH"] = 3] = "MESH";
                ShapeType[ShapeType["TRANSFORMED_SHAPE"] = 4] = "TRANSFORMED_SHAPE";
            })(ShapeType || (ShapeType = {}));
            exports_1("ShapeType", ShapeType);
        }
    }
});
//# sourceMappingURL=Shape.js.map