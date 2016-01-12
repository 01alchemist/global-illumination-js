System.register(["../shapes/Box", "./Node", "../../math/Hit"], function(exports_1) {
    var Box_1, Node_1, Hit_1;
    var Tree;
    return {
        setters:[
            function (Box_1_1) {
                Box_1 = Box_1_1;
            },
            function (Node_1_1) {
                Node_1 = Node_1_1;
            },
            function (Hit_1_1) {
                Hit_1 = Hit_1_1;
            }],
        execute: function() {
            Tree = (function () {
                function Tree(box, root) {
                    this.box = box;
                    this.root = root;
                }
                Tree.newTree = function (shapes) {
                    console.log("Building k-d tree (" + shapes.length + " shapes)... ");
                    var box = Box_1.Box.boxForShapes(shapes);
                    var node = Node_1.Node.newNode(shapes);
                    node.split(0);
                    return new Tree(box, node);
                };
                Tree.prototype.intersect = function (r) {
                    var t = this.box.intersect(r);
                    if (t.max < t.min || t.max <= 0) {
                        return Hit_1.NoHit;
                    }
                    return this.root.intersect(r, t.min, t.max);
                };
                return Tree;
            })();
            exports_1("Tree", Tree);
        }
    }
});
//# sourceMappingURL=Tree.js.map