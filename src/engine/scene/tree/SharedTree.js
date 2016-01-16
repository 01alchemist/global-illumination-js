System.register(["../shapes/Box", "../../math/Hit", "./SharedNode"], function(exports_1) {
    var Box_1, Hit_1, SharedNode_1;
    var SharedTree;
    return {
        setters:[
            function (Box_1_1) {
                Box_1 = Box_1_1;
            },
            function (Hit_1_1) {
                Hit_1 = Hit_1_1;
            },
            function (SharedNode_1_1) {
                SharedNode_1 = SharedNode_1_1;
            }],
        execute: function() {
            SharedTree = (function () {
                function SharedTree(box, root) {
                    this.box = box;
                    this.root = root;
                }
                SharedTree.prototype.write = function (memory, offset) {
                    return offset;
                };
                SharedTree.newTree = function (shapes, box) {
                    if (box === void 0) { box = null; }
                    console.time("Building k-d tree (" + shapes.length + " shapes)... ");
                    box = box ? box : Box_1.Box.boxForShapes(shapes);
                    var node = SharedNode_1.SharedNode.newNode(shapes);
                    node.split(0);
                    console.timeEnd("Building k-d tree (" + shapes.length + " shapes)... ");
                    return new SharedTree(box, node);
                };
                SharedTree.prototype.intersect = function (r) {
                    var t = this.box.intersect(r);
                    if (t.max < t.min || t.max <= 0) {
                        return Hit_1.NoHit;
                    }
                    return this.root.intersect(r, t.min, t.max);
                };
                SharedTree.fromJson = function (tree, mesh) {
                    var box = Box_1.Box.fromJson(tree.box);
                    var node = SharedNode_1.SharedNode.fromJson(tree.root);
                    node.mesh = mesh;
                    return new SharedTree(box, node);
                };
                return SharedTree;
            })();
            exports_1("SharedTree", SharedTree);
        }
    }
});
//# sourceMappingURL=SharedTree.js.map