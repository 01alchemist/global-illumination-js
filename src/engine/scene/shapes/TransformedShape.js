System.register(["../../math/Matrix4", "../../math/Hit", "./Shape"], function(exports_1) {
    var Matrix4_1, Hit_1, Shape_1, Shape_2;
    var TransformedShape;
    return {
        setters:[
            function (Matrix4_1_1) {
                Matrix4_1 = Matrix4_1_1;
            },
            function (Hit_1_1) {
                Hit_1 = Hit_1_1;
            },
            function (Shape_1_1) {
                Shape_1 = Shape_1_1;
                Shape_2 = Shape_1_1;
            }],
        execute: function() {
            TransformedShape = (function () {
                function TransformedShape(shape, matrix, inverse) {
                    this.shape = shape;
                    this.matrix = matrix;
                    this.inverse = inverse;
                    this.type = Shape_1.ShapeType.TRANSFORMED_SHAPE;
                }
                TransformedShape.fromJson = function (transformedShape) {
                    return new TransformedShape(Shape_2.ShapefromJson(transformedShape.shape), Matrix4_1.Matrix4.fromJson(transformedShape.matrix), Matrix4_1.Matrix4.fromJson(transformedShape.inverse));
                };
                TransformedShape.newTransformedShape = function (s, m) {
                    return new TransformedShape(s, m, m.inverse());
                };
                Object.defineProperty(TransformedShape.prototype, "box", {
                    get: function () {
                        return this.matrix.mulBox(this.shape.box);
                    },
                    enumerable: true,
                    configurable: true
                });
                TransformedShape.prototype.compile = function () {
                    this.shape.compile();
                };
                TransformedShape.prototype.intersect = function (r) {
                    var hit = this.shape.intersect(this.inverse.mulRay(r));
                    if (!hit.ok()) {
                        return hit;
                    }
                    var shape = new TransformedShape(hit.shape, this.matrix, this.inverse);
                    return new Hit_1.Hit(shape, hit.T);
                };
                TransformedShape.prototype.getColor = function (p) {
                    return this.shape.getColor(this.inverse.mulPosition(p));
                };
                TransformedShape.prototype.getMaterial = function (p) {
                    return this.shape.getMaterial(this.inverse.mulPosition(p));
                };
                TransformedShape.prototype.getNormal = function (p) {
                    return this.matrix.mulDirection(this.shape.getNormal(this.inverse.mulPosition(p)));
                };
                TransformedShape.prototype.getRandomPoint = function () {
                    return this.matrix.mulPosition(this.shape.getRandomPoint());
                };
                return TransformedShape;
            })();
            exports_1("TransformedShape", TransformedShape);
        }
    }
});
//# sourceMappingURL=TransformedShape.js.map