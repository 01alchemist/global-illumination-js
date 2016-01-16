System.register(["../../math/Matrix4", "../../math/Hit", "./Shape"], function(exports_1) {
    var Matrix4_1, Hit_1, Shape_1;
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
            }],
        execute: function() {
            TransformedShape = (function () {
                function TransformedShape(shape, matrix, inverse) {
                    if (shape === void 0) { shape = null; }
                    if (matrix === void 0) { matrix = new Matrix4_1.Matrix4(); }
                    if (inverse === void 0) { inverse = new Matrix4_1.Matrix4(); }
                    this.shape = shape;
                    this.matrix = matrix;
                    this.inverse = inverse;
                    this.type = Shape_1.ShapeType.TRANSFORMED_SHAPE;
                }
                Object.defineProperty(TransformedShape.prototype, "memorySize", {
                    get: function () {
                        if (this.shape) {
                            return this.shape.memorySize + Matrix4_1.Matrix4.SIZE + 1;
                        }
                        else {
                            return 0;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                ;
                TransformedShape.prototype.directRead = function (memory, offset) {
                    offset = this.matrix.directRead(memory, offset);
                    this.inverse = this.matrix.inverse();
                    var container = [];
                    offset = Shape_1.directRestoreShape(memory, offset, container);
                    this.shape = container[0];
                    container = null;
                    return offset;
                };
                TransformedShape.prototype.directWrite = function (memory, offset) {
                    memory[offset++] = this.type;
                    offset = this.matrix.directWrite(memory, offset);
                    offset = this.shape.directWrite(memory, offset);
                    return offset;
                };
                TransformedShape.prototype.read = function (memory) {
                    this.matrix.read(memory);
                    this.inverse = this.matrix.inverse();
                    var container = [];
                    Shape_1.restoreShape(memory, container);
                    this.shape = container[0];
                    container = null;
                    return memory.position;
                };
                TransformedShape.prototype.write = function (memory) {
                    memory.writeByte(this.type);
                    this.matrix.write(memory);
                    this.shape.write(memory);
                    return memory.position;
                };
                TransformedShape.fromJson = function (transformedShape) {
                    return new TransformedShape(Shape_1.ShapefromJson(transformedShape.shape), Matrix4_1.Matrix4.fromJson(transformedShape.matrix), Matrix4_1.Matrix4.fromJson(transformedShape.inverse));
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