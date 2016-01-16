import {Axis} from "../Axis";
import {Shape} from "../shapes/Shape";
import {Ray} from "../../math/Ray";
import {Hit} from "../../math/Hit";
import {NoHit} from "../../math/Hit";
import {append} from "../../utils/MapUtils";
import {Box} from "../shapes/Box";
import {sortAscending} from "../../utils/MapUtils";
import {MathUtils} from "../../utils/MathUtils";
import {Mesh} from "../shapes/Mesh";
import {IPointer} from "../../../pointer/IPointer";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export class SharedNode implements IPointer{

    static map:Array<SharedNode> = [];

    index:number;
    mesh:Mesh;
    size:number=0;

    constructor(public axis:Axis,
                public point:number,
                public shapes:Shape[]=null,
                public shapeIndices:number[]=null,
                public left:SharedNode=null,
                public right:SharedNode=null) {

        this.index = SharedNode.map.push(this) - 1;
    }

    write(memory:DataView, offset:number):number{
        return offset;
    }

    static newNode(shapes:Shape[]):SharedNode {
        return new SharedNode(Axis.AxisNone, 0, shapes, [], null, null);
    }

    static fromJson(node:SharedNode):SharedNode {
        return new SharedNode(node.axis, node.point, null, node.shapeIndices, node.left, node.right);
    }

    intersect(r:Ray, tmin:number, tmax:number):Hit {
        var node:SharedNode = this;
        var tsplit:number;
        var leftFirst:boolean;

        switch (node.axis) {
            case Axis.AxisNone:
                return this.intersectShapes(node, r);
            case Axis.AxisX:
                tsplit = (node.point - r.origin.x) / r.direction.x;
                leftFirst = (r.origin.x < node.point) || (r.origin.x == node.point && r.direction.x <= 0)
                break;
            case Axis.AxisY:
                tsplit = (node.point - r.origin.y) / r.direction.y;
                leftFirst = (r.origin.y < node.point) || (r.origin.y == node.point && r.direction.y <= 0)
                break;
            case Axis.AxisZ:
                tsplit = (node.point - r.origin.z) / r.direction.z;
                leftFirst = (r.origin.z < node.point) || (r.origin.z == node.point && r.direction.z <= 0)
                break;
        }
        var first:SharedNode;
        var second:SharedNode;
        if (leftFirst) {
            first = node.left;
            second = node.right;
        } else {
            first = node.right;
            second = node.left;
        }
        if (tsplit > tmax || tsplit <= 0) {
            return this.intersectNode(first, r, tmin, tmax);
        } else if (tsplit < tmin) {
            return this.intersectNode(second, r, tmin, tmax);
        } else {
            var h1:Hit = this.intersectNode(first, r, tmin, tsplit);
            if (h1.T <= tsplit) {
                return h1;
            }
            var h2:Hit = this.intersectNode(second, r, tsplit, Math.min(tmax, h1.T));
            if (h1.T <= h2.T) {
                return h1;
            } else {
                return h2;
            }
        }
    }
    intersectNode(node:SharedNode, r:Ray, tmin:number, tmax:number):Hit{
        var tsplit:number;
        var leftFirst:boolean;

        switch (node.axis) {
            case Axis.AxisNone:
                return this.intersectShapes(node, r);
            case Axis.AxisX:
                tsplit = (node.point - r.origin.x) / r.direction.x;
                leftFirst = (r.origin.x < node.point) || (r.origin.x == node.point && r.direction.x <= 0)
                break;
            case Axis.AxisY:
                tsplit = (node.point - r.origin.y) / r.direction.y;
                leftFirst = (r.origin.y < node.point) || (r.origin.y == node.point && r.direction.y <= 0)
                break;
            case Axis.AxisZ:
                tsplit = (node.point - r.origin.z) / r.direction.z;
                leftFirst = (r.origin.z < node.point) || (r.origin.z == node.point && r.direction.z <= 0)
                break;
        }
        var first:SharedNode;
        var second:SharedNode;
        if (leftFirst) {
            first = node.left;
            second = node.right;
        } else {
            first = node.right;
            second = node.left;
        }
        if (tsplit > tmax || tsplit <= 0) {
            return this.intersectNode(first, r, tmin, tmax);
        } else if (tsplit < tmin) {
            return this.intersectNode(second, r, tmin, tmax);
        } else {
            var h1:Hit = this.intersectNode(first, r, tmin, tsplit);
            if (h1.T <= tsplit) {
                return h1;
            }
            var h2:Hit = this.intersectNode(second, r, tsplit, Math.min(tmax, h1.T));
            if (h1.T <= h2.T) {
                return h1;
            } else {
                return h2;
            }
        }
    }
    intersectShapes(node:SharedNode, r:Ray):Hit {
        var hit:Hit = NoHit;
        var self = this;
        node.shapeIndices.forEach(function (shapeIndex:number) {
            var h = self.mesh.triangles[shapeIndex].intersect(r);
            if (h.T < hit.T) {
                hit = h;
            }
        });
        return hit;
    }

    partitionScore(axis:Axis, point:number):number {
        var node:SharedNode = this;
        var left = 0;
        var right = 0;
        node.shapes.forEach(function (shape) {
            var box = shape.box;
            var p = box.partition(axis, point);
            if (p.left) {
                left++
            }
            if (p.right) {
                right++
            }
        });
        if (left >= right) {
            return left;
        } else {
            return right;
        }
    }

    partition(size:number, axis:Axis, point:number):{left:Shape[], right:Shape[]} {
        var node:SharedNode = this;
        var left:Shape[] = [];
        var right:Shape[] = [];
        node.shapes.forEach(function (shape:Shape) {
            var box = shape.box;
            var p = box.partition(axis, point);
            if (p.left) {
                left = append(left, shape);
            }
            if (p.right) {
                right = append(right, shape);
            }
        });
        return {left: left, right: right};
    }

    split(depth:number) {
        var node = this;
        if (node.shapes.length < 8) {
            return;
        }
        var xs:number[] = [];
        var ys:number[] = [];
        var zs:number[] = [];
        node.shapes.forEach(function (shape:Shape) {
            var box:Box = shape.box;
            xs = append(xs, box.min.x);
            xs = append(xs, box.max.x);
            ys = append(ys, box.min.y);
            ys = append(ys, box.max.y);
            zs = append(zs, box.min.z);
            zs = append(zs, box.max.z);
        });

        sortAscending(xs);
        sortAscending(ys);
        sortAscending(zs);

        var mx = MathUtils.median(xs);
        var my = MathUtils.median(ys);
        var mz = MathUtils.median(zs);
        var best:number = Math.round(node.shapes.length * 0.85);
        var bestAxis:Axis = Axis.AxisNone;
        var bestPoint:number = 0.0;
        var sx:number = node.partitionScore(Axis.AxisX, mx);
        if (sx < best) {
            best = sx;
            bestAxis = Axis.AxisX;
            bestPoint = mx;
        }
        var sy:number = node.partitionScore(Axis.AxisY, my);
        if (sy < best) {
            best = sy;
            bestAxis = Axis.AxisY;
            bestPoint = my;
        }
        var sz:number = node.partitionScore(Axis.AxisZ, mz);
        if (sz < best) {
            best = sz;
            bestAxis = Axis.AxisZ;
            bestPoint = mz;
        }
        if (bestAxis == Axis.AxisNone) {
            var shapes:Shape[] = <Shape[]>node.shapes;
            var shapeIndices:number[] = [];
            //for shared node we only need shape indices
            shapes.forEach(function(shape:Shape){
                shapeIndices.push(shape.index);
            });
            node.shapes = null;
            node.shapeIndices = shapeIndices;
            return;
        }
        var p = node.partition(best, bestAxis, bestPoint);
        node.axis = bestAxis;
        node.point = bestPoint;
        node.left = SharedNode.newNode(p.left);
        node.right = SharedNode.newNode(p.right);

        node.left.split(depth + 1);
        node.right.split(depth + 1);

        node.shapes = null; // only needed at leaf nodes
    }
}
