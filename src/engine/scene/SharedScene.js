System.register(["../math/Color", "./Scene", "./materials/Material", "./shapes/Shape", "./tree/SharedTree"], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var Color_1, Scene_1, Material_1, Shape_1, SharedTree_1, Shape_2;
    var SharedScene;
    return {
        setters:[
            function (Color_1_1) {
                Color_1 = Color_1_1;
            },
            function (Scene_1_1) {
                Scene_1 = Scene_1_1;
            },
            function (Material_1_1) {
                Material_1 = Material_1_1;
            },
            function (Shape_1_1) {
                Shape_1 = Shape_1_1;
                Shape_2 = Shape_1_1;
            },
            function (SharedTree_1_1) {
                SharedTree_1 = SharedTree_1_1;
            }],
        execute: function() {
            SharedScene = (function (_super) {
                __extends(SharedScene, _super);
                function SharedScene(color, shapes, lights, tree, rays) {
                    if (color === void 0) { color = new Color_1.Color(); }
                    if (shapes === void 0) { shapes = []; }
                    if (lights === void 0) { lights = []; }
                    if (tree === void 0) { tree = null; }
                    if (rays === void 0) { rays = 0; }
                    _super.call(this, color, shapes, lights, tree, rays);
                    this.shared = true;
                }
                SharedScene.prototype.getMemory = function () {
                    console.time("getMemory");
                    var memorySize = this.estimatedMemory + Material_1.Material.estimatedMemory;
                    var memory = new Float32Array(new SharedArrayBuffer(memorySize * Float32Array.BYTES_PER_ELEMENT));
                    var offset = 0;
                    offset = Material_1.Material.directWrite(memory, offset);
                    memory[offset++] = this.shapes.length;
                    offset = this.color.directWrite(memory, offset);
                    var self = this;
                    this.shapes.forEach(function (shape, index) {
                        offset = shape.directWrite(memory, offset);
                        if (shape.type == Shape_2.ShapeType.MESH) {
                            if (self.sharedTreeMap == null) {
                                self.sharedTreeMap = [];
                            }
                            self.sharedTreeMap[index] = shape.tree;
                        }
                    });
                    console.timeEnd("getMemory");
                    return memory;
                };
                SharedScene.prototype.getKDTreeMemory = function () {
                    return new TextEncoder().encode(JSON.stringify(this.sharedTreeMap));
                };
                SharedScene.getScene = function (memory, tree) {
                    if (tree === void 0) { tree = null; }
                    console.time("getScene");
                    console.log(tree);
                    var scene = new Scene_1.Scene();
                    var offset = Material_1.Material.restore(memory);
                    var numShapes = memory[offset++];
                    offset = scene.color.directRead(memory, offset);
                    var shapes = [];
                    for (var i = 0; i < numShapes; i++) {
                        offset = Shape_1.restoreShape(memory, offset, shapes);
                        var shape = shapes[i];
                        scene.add(shape);
                        if (shape.type == Shape_2.ShapeType.MESH) {
                            shape.tree = SharedTree_1.SharedTree.fromJson(tree[i], shape);
                        }
                    }
                    console.timeEnd("getScene");
                    return scene;
                };
                return SharedScene;
            })(Scene_1.Scene);
            exports_1("SharedScene", SharedScene);
        }
    }
});
//# sourceMappingURL=SharedScene.js.map