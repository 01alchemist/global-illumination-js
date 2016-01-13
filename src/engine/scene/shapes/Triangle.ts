import {Material} from "../materials/Material";
import {Box} from "./Box";
import {Vector3} from "../../math/Vector3";
import {Ray} from "../../math/Ray";
import {Hit} from "../../math/Hit";
import {EPS} from "../../math/Constants";
import {NoHit} from "../../math/Hit";
import {Color} from "../../math/Color";
import {Matrix4} from "../../math/Matrix4";
import {Shape} from "./Shape";
import {ShapeType} from "./Shape";
import {MaterialUtils} from "../materials/MaterialUtils";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export class Triangle implements Shape {

    static SIZE:number = Box.SIZE + (Vector3.SIZE * 9) + 2;//+1 for material index

    type:ShapeType = ShapeType.TRIANGLE;
    size:number = Triangle.SIZE;

    constructor(public material:Material = new Material(),
                public box:Box = new Box(),
                public v1:Vector3 = new Vector3(), public v2:Vector3 = new Vector3(), public v3:Vector3 = new Vector3(),
                public n1:Vector3 = new Vector3(), public n2:Vector3 = new Vector3(), public n3:Vector3 = new Vector3(),
                public t1:Vector3 = new Vector3(), public t2:Vector3 = new Vector3(), public t3:Vector3 = new Vector3()) {

    }

    static fromJson(triangles:Triangle|Triangle[]):Triangle|Triangle[] {
        if (triangles instanceof Triangle) {
            var t:Triangle = <Triangle>triangles;
            return new Triangle(
                MaterialUtils.fromJson(t.material),
                Box.fromJson(t.box),
                Vector3.fromJson(t.v1), Vector3.fromJson(t.v2), Vector3.fromJson(t.v3),
                Vector3.fromJson(t.n1), Vector3.fromJson(t.n2), Vector3.fromJson(t.n3),
                Vector3.fromJson(t.t1), Vector3.fromJson(t.t2), Vector3.fromJson(t.t3)
            )
        } else {
            var _ts:Triangle[] = [];
            var ts:Triangle[] = <Triangle[]>triangles;
            ts.forEach(function (t:Triangle) {
                _ts.push(new Triangle(
                    MaterialUtils.fromJson(t.material),
                    Box.fromJson(t.box),
                    Vector3.fromJson(t.v1), Vector3.fromJson(t.v2), Vector3.fromJson(t.v3),
                    Vector3.fromJson(t.n1), Vector3.fromJson(t.n2), Vector3.fromJson(t.n3),
                    Vector3.fromJson(t.t1), Vector3.fromJson(t.t2), Vector3.fromJson(t.t3)
                ));
            });
            return _ts;
        }
    }

    static newTriangle(v1:Vector3, v2:Vector3, v3:Vector3,
                       t1:Vector3, t2:Vector3, t3:Vector3,
                       material:Material):Triangle {
        var t = new Triangle();
        t.v1 = v1;
        t.v2 = v2;
        t.v3 = v3;
        t.t1 = t1;
        t.t2 = t2;
        t.t3 = t3;
        t.material = material;
        t.updateBox();
        t.fixNormals();
        return t;
    }

    compile() {
    }

    get vertices():Vector3[] {
        return [this.v1, this.v2, this.v3];
    }

    intersect(r:Ray):Hit {
        var t = this;
        var e1x:number = t.v2.x - t.v1.x;
        var e1y:number = t.v2.y - t.v1.y;
        var e1z:number = t.v2.z - t.v1.z;
        var e2x:number = t.v3.x - t.v1.x;
        var e2y:number = t.v3.y - t.v1.y;
        var e2z:number = t.v3.z - t.v1.z;
        var px:number = r.direction.y * e2z - r.direction.z * e2y;
        var py:number = r.direction.z * e2x - r.direction.x * e2z;
        var pz:number = r.direction.x * e2y - r.direction.y * e2x;
        var det:number = e1x * px + e1y * py + e1z * pz;
        if (det > -EPS && det < EPS) {
            return NoHit;
        }
        var inv:number = 1 / det;
        var tx:number = r.origin.x - t.v1.x;
        var ty:number = r.origin.y - t.v1.y;
        var tz:number = r.origin.z - t.v1.z;
        var u:number = (tx * px + ty * py + tz * pz) * inv;
        if (u < 0 || u > 1) {
            return NoHit;
        }
        var qx:number = ty * e1z - tz * e1y;
        var qy:number = tz * e1x - tx * e1z;
        var qz:number = tx * e1y - ty * e1x;
        var v:number = (r.direction.x * qx + r.direction.y * qy + r.direction.z * qz) * inv;
        if (v < 0 || u + v > 1) {
            return NoHit;
        }
        var d:number = (e2x * qx + e2y * qy + e2z * qz) * inv;
        if (d < EPS) {
            return NoHit
        }
        return new Hit(t, d);
    }

    getColor(p:Vector3):Color {
        var t = this;
        if (t.material.texture == null) {
            return t.material.color;
        }
        var _uvw = t.baryCentric(p);
        var u = _uvw.u;
        var v = _uvw.v;
        var w = _uvw.w;
        var n = new Vector3();
        n = n.add(t.t1.mulScalar(u));
        n = n.add(t.t2.mulScalar(v));
        n = n.add(t.t3.mulScalar(w));
        return t.material.texture.sample(n.x, n.y);
    }

    getMaterial(p:Vector3):Material {
        return this.material;
    }

    getNormal(p:Vector3):Vector3 {
        var t = this;
        var _uvw = t.baryCentric(p);
        var u = _uvw.u;
        var v = _uvw.v;
        var w = _uvw.w;
        var n:Vector3 = new Vector3();
        n = n.add(t.n1.mulScalar(u));
        n = n.add(t.n2.mulScalar(v));
        n = n.add(t.n3.mulScalar(w));
        n = n.normalize();
        if (t.material.normalTexture != null) {
            var b:Vector3 = new Vector3();
            b = b.add(t.t1.mulScalar(u));
            b = b.add(t.t2.mulScalar(v));
            b = b.add(t.t3.mulScalar(w));
            var ns:Vector3 = t.material.normalTexture.normalSample(b.x, b.y);
            var dv1:Vector3 = t.v2.sub(t.v1);
            var dv2:Vector3 = t.v3.sub(t.v1);
            var dt1:Vector3 = t.t2.sub(t.t1);
            var dt2:Vector3 = t.t3.sub(t.t1);
            var T:Vector3 = dv1.mulScalar(dt2.y).sub(dv2.mulScalar(dt1.y)).normalize();
            var B:Vector3 = dv2.mulScalar(dt1.x).sub(dv1.mulScalar(dt2.x)).normalize();
            var N:Vector3 = T.cross(B);
            var matrix = new Matrix4(
                T.x, B.x, N.x, 0,
                T.y, B.y, N.y, 0,
                T.z, B.z, N.z, 0,
                0, 0, 0, 1);
            n = matrix.mulDirection(ns);
        }
        if (t.material.bumpTexture != null) {
            var b = new Vector3();
            b = b.add(t.t1.mulScalar(u));
            b = b.add(t.t2.mulScalar(v));
            b = b.add(t.t3.mulScalar(w));
            var bump = t.material.bumpTexture.bumpSample(b.x, b.y);
            var dv1 = t.v2.sub(t.v1);
            var dv2 = t.v3.sub(t.v1);
            var dt1 = t.t2.sub(t.t1);
            var dt2 = t.t3.sub(t.t1);
            var tangent = dv1.mulScalar(dt2.y).sub(dv2.mulScalar(dt1.y)).normalize();
            var biTangent = dv2.mulScalar(dt1.x).sub(dv1.mulScalar(dt2.x)).normalize();
            n = n.add(tangent.mulScalar(bump.x * t.material.bumpMultiplier));
            n = n.add(biTangent.mulScalar(bump.y * t.material.bumpMultiplier));
        }
        n = n.normalize();
        return n;
    }

    getRandomPoint():Vector3 {
        return new Vector3(); // TODO: fix
    }

    area():number {
        var t = this;
        var e1:Vector3 = t.v2.sub(t.v1);
        var e2:Vector3 = t.v3.sub(t.v1);
        var n:Vector3 = e1.cross(e2);
        return n.length() / 2;
    }

    baryCentric(p:Vector3):{u:number, v:number, w:number} {
        var t = this;
        var v0 = t.v2.sub(t.v1);
        var v1 = t.v3.sub(t.v1);
        var v2 = p.sub(t.v1);
        var d00 = v0.dot(v0);
        var d01 = v0.dot(v1);
        var d11 = v1.dot(v1);
        var d20 = v2.dot(v0);
        var d21 = v2.dot(v1);
        var d = d00 * d11 - d01 * d01;
        var v = (d11 * d20 - d01 * d21) / d;
        var w = (d00 * d21 - d01 * d20) / d;
        var u = 1 - v - w;
        return {u: u, v: v, w: w};
    }

    updateBox() {
        var t = this;
        var min = t.v1.min(t.v2).min(t.v3);
        var max = t.v1.max(t.v2).max(t.v3);
        t.box = new Box(min, max);
    }

    fixNormals() {
        var t = this;
        var e1 = t.v2.sub(t.v1);
        var e2 = t.v3.sub(t.v1);
        var n = e1.cross(e2).normalize();
        var zero = new Vector3();
        if (t.n1 == undefined || t.n1.equals(zero)) {
            t.n1 = n;
        }
        if (t.n2 == undefined || t.n2.equals(zero)) {
            t.n2 = n;
        }
        if (t.n3 == undefined || t.n3.equals(zero)) {
            t.n3 = n;
        }
    }

    writeToMemory(memory:Float32Array, offset:number):number {
        //Not writing box
        memory[offset++] = this.type;
        memory[offset++] = this.material.materialIndex;
        offset = this.v1.writeToMemory(memory, offset);
        offset = this.v2.writeToMemory(memory, offset);
        offset = this.v3.writeToMemory(memory, offset);
        offset = this.n1.writeToMemory(memory, offset);
        offset = this.n2.writeToMemory(memory, offset);
        offset = this.n3.writeToMemory(memory, offset);

        if (this.t1) {
            offset = this.t1.writeToMemory(memory, offset);
        } else {
            offset = offset + Vector3.SIZE;
        }
        if (this.t2) {
            offset = this.t2.writeToMemory(memory, offset);
        } else {
            offset = offset + Vector3.SIZE;
        }
        if (this.t3) {
            offset = this.t3.writeToMemory(memory, offset);
        } else {
            offset = offset + Vector3.SIZE;
        }

        return offset;
    }

    read(memory:Float32Array, offset:number):number {

        var materialIndex:number = memory[offset++];
        var material:Material = Material.map[materialIndex];
        if (material) {
            this.material = material;
        }

        offset = this.v1.read(memory, offset);
        offset = this.v2.read(memory, offset);
        offset = this.v3.read(memory, offset);
        offset = this.n1.read(memory, offset);
        offset = this.n2.read(memory, offset);
        offset = this.n3.read(memory, offset);

        if (this.t1) {
            offset = this.t1.read(memory, offset);
        } else {
            offset = offset + Vector3.SIZE;
        }
        if (this.t2) {
            offset = this.t2.read(memory, offset);
        } else {
            offset = offset + Vector3.SIZE;
        }
        if (this.t3) {
            offset = this.t3.read(memory, offset);
        } else {
            offset = offset + Vector3.SIZE;
        }

        this.updateBox();

        return offset;
    }
}
