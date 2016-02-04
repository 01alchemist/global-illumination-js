import {Vector3} from "./Vector3";
import {Box} from "../scene/shapes/Box";
import {Ray} from "./Ray";
import {ByteArrayBase} from "../../pointer/ByteArrayBase";
import {DirectMemory} from "../../pointer/DirectMemory";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export class Matrix4 {

    static SIZE:number = 16;

    m:Float32Array;

    // matrix elements, m(row,col)
    /**
     * Creates a matrix with the specified elements
     *
     * @param m00 value at row 0, col 0
     * @param m01 value at row 0, col 1
     * @param m02 value at row 0, col 2
     * @param m03 value at row 0, col 3
     * @param m10 value at row 1, col 0
     * @param m11 value at row 1, col 1
     * @param m12 value at row 1, col 2
     * @param m13 value at row 1, col 3
     * @param m20 value at row 2, col 0
     * @param m21 value at row 2, col 1
     * @param m22 value at row 2, col 2
     * @param m23 value at row 2, col 3
     * @param m30 value at row 3, col 0
     * @param m31 value at row 3, col 1
     * @param m32 value at row 3, col 2
     * @param m33 value at row 3, col 3
     */
    constructor(public m00:float = 0, public m01:float = 0, public m02:float = 0, public m03:float = 0,
                public m10:float = 0, public m11:float = 0, public m12:float = 0, public m13:float = 0,
                public m20:float = 0, public m21:float = 0, public m22:float = 0, public m23:float = 0,
                public m30:float = 0, public m31:float = 0, public m32:float = 0, public m33:float = 0) {

        if(arguments.length == 2){
            this.m = arguments[0];
            let rowMajor = arguments[1];
            if (rowMajor) {
                m00 = m[0];
                m01 = m[1];
                m02 = m[2];
                m03 = m[3];
                m10 = m[4];
                m11 = m[5];
                m12 = m[6];
                m13 = m[7];
                m20 = m[8];
                m21 = m[9];
                m22 = m[10];
                m23 = m[11];
                m30 = m[12];
                m31 = m[13];
                m32 = m[14];
                m33 = m[15];
            } else {
                m00 = m[0];
                m01 = m[4];
                m02 = m[8];
                m03 = m[12];
                m10 = m[1];
                m11 = m[5];
                m12 = m[9];
                m13 = m[13];
                m20 = m[2];
                m21 = m[6];
                m22 = m[10];
                m23 = m[14];
                m30 = m[3];
                m31 = m[7];
                m32 = m[11];
                m33 = m[15];
            }
        }else {
            this.m = new Float32Array([
                m00, m01, m02, m03,
                m10, m11, m12, m13,
                m20, m21, m22, m23,
                m30, m31, m32, m33
            ]);
        }
    }

    directRead(memory:Float32Array, offset:number):number {
        var m:Matrix4 = this;
        m.m00 = memory[offset++];
        m.m01 = memory[offset++];
        m.m02 = memory[offset++];
        m.m03 = memory[offset++];
        m.m10 = memory[offset++];
        m.m11 = memory[offset++];
        m.m12 = memory[offset++];
        m.m13 = memory[offset++];
        m.m20 = memory[offset++];
        m.m21 = memory[offset++];
        m.m22 = memory[offset++];
        m.m23 = memory[offset++];
        m.m30 = memory[offset++];
        m.m31 = memory[offset++];
        m.m32 = memory[offset++];
        m.m33 = memory[offset++];
        return offset;
    }

    directWrite(memory:Float32Array, offset:number):number {
        var m:Matrix4 = this;
        memory[offset++] = m.m00;
        memory[offset++] = m.m01;
        memory[offset++] = m.m02;
        memory[offset++] = m.m03;
        memory[offset++] = m.m10;
        memory[offset++] = m.m11;
        memory[offset++] = m.m12;
        memory[offset++] = m.m13;
        memory[offset++] = m.m20;
        memory[offset++] = m.m21;
        memory[offset++] = m.m22;
        memory[offset++] = m.m23;
        memory[offset++] = m.m30;
        memory[offset++] = m.m31;
        memory[offset++] = m.m32;
        memory[offset++] = m.m33;
        return offset;
    }

    read(memory:ByteArrayBase|DirectMemory):number {
        this.m00 = memory.readFloat();
        this.m01 = memory.readFloat();
        this.m02 = memory.readFloat();
        this.m03 = memory.readFloat();
        this.m10 = memory.readFloat();
        this.m11 = memory.readFloat();
        this.m12 = memory.readFloat();
        this.m13 = memory.readFloat();
        this.m20 = memory.readFloat();
        this.m21 = memory.readFloat();
        this.m22 = memory.readFloat();
        this.m23 = memory.readFloat();
        this.m30 = memory.readFloat();
        this.m31 = memory.readFloat();
        this.m32 = memory.readFloat();
        this.m33 = memory.readFloat();
        return memory.position;
    }

    write(memory:ByteArrayBase|DirectMemory):number {
        memory.writeFloat(this.m00);
        memory.writeFloat(this.m01);
        memory.writeFloat(this.m02);
        memory.writeFloat(this.m03);
        memory.writeFloat(this.m10);
        memory.writeFloat(this.m11);
        memory.writeFloat(this.m12);
        memory.writeFloat(this.m13);
        memory.writeFloat(this.m20);
        memory.writeFloat(this.m21);
        memory.writeFloat(this.m22);
        memory.writeFloat(this.m23);
        memory.writeFloat(this.m30);
        memory.writeFloat(this.m31);
        memory.writeFloat(this.m32);
        memory.writeFloat(this.m33);
        return memory.position;
    }

    asRowMajor():Float32Array {
        return new Float32Array([
            this.m00, this.m01, this.m02, this.m03,
            this.m10, this.m11, this.m12, this.m13,
            this.m20, this.m21, this.m22, this.m23,
            this.m30, this.m31, this.m32, this.m33
        ]);
    }

    asColMajor():Float32Array {
        return new Float32Array([
            this.m00, this.m10, this.m20, this.m30,
            this.m01, this.m11, this.m21, this.m31,
            this.m02, this.m12, this.m22, this.m32,
            this.m03, this.m13, this.m23, this.m33
        ]);
    }

    static fromJson(m:Matrix4):Matrix4 {
        return new Matrix4(
            m.m00, m.m01, m.m02, m.m03,
            m.m10, m.m11, m.m12, m.m13,
            m.m20, m.m21, m.m22, m.m23,
            m.m30, m.m31, m.m32, m.m33
        )
    }

    static identity():Matrix4 {
        return new Matrix4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1)
    }

    static translate(v:Vector3):Matrix4 {
        return new Matrix4(
            1, 0, 0, v.m,
            0, 1, 0, v.y,
            0, 0, 1, v.z,
            0, 0, 0, 1)
    }

    static scale(v:Vector3):Matrix4 {
        return new Matrix4(
            v.m, 0, 0, 0,
            0, v.y, 0, 0,
            0, 0, v.z, 0,
            0, 0, 0, 1);
    }

    static rotate(v:Vector3, a:number):Matrix4 {
        v = v.normalize();
        var s = Math.sin(a);
        var c = Math.cos(a);
        var m = 1 - c;
        return new Matrix4(
            m * v.m * v.m + c, m * v.m * v.y + v.z * s, m * v.z * v.m - v.y * s, 0,
            m * v.m * v.y - v.z * s, m * v.y * v.y + c, m * v.y * v.z + v.m * s, 0,
            m * v.z * v.m + v.y * s, m * v.y * v.z - v.m * s, m * v.z * v.z + c, 0,
            0, 0, 0, 1);
    }

    static frustum(l:number, r:number, b:number, t:number, n:number, f:number):Matrix4 {
        var t1 = 2 * n;
        var t2 = r - l;
        var t3 = t - b;
        var t4 = f - n;
        return new Matrix4(
            t1 / t2, 0, (r + l) / t2, 0,
            0, t1 / t3, (t + b) / t3, 0,
            0, 0, (-f - n) / t4, (-t1 * f) / t4,
            0, 0, -1, 0);
    }

    static orthographic(l:number, r:number, b:number, t:number, n:number, f:number):Matrix4 {
        return new Matrix4(
            2 / (r - l), 0, 0, -(r + l) / (r - l),
            0, 2 / (t - b), 0, -(t + b) / (t - b),
            0, 0, -2 / (f - n), -(f + n) / (f - n),
            0, 0, 0, 1);
    }

    static perspective(fov:number, aspect:number, near:number, far:number):Matrix4 {
        var ymax:number = near * Math.tan(fov * Math.PI / 360);
        var xmax:number = ymax * aspect;
        return Matrix4.frustum(-xmax, xmax, -ymax, ymax, near, far);
    }

    translate(v:Vector3):Matrix4 {
        return Matrix4.translate(v).mul(this);
    }

    scale(v:Vector3):Matrix4 {
        return Matrix4.scale(v).mul(this);
    }

    rotate(v:Vector3, a:number):Matrix4 {
        return Matrix4.rotate(v, a).mul(this);
    }

    frustum(l:number, r:number, b:number, t:number, n:number, f:number):Matrix4 {
        return Matrix4.frustum(l, r, b, t, n, f).mul(this);
    }

    orthographic(l:number, r:number, b:number, t:number, n:number, f:number):Matrix4 {
        return Matrix4.orthographic(l, r, b, t, n, f).mul(this);
    }

    perspective(fov, aspect, near, far:number):Matrix4 {
        return Matrix4.perspective(fov, aspect, near, far).mul(this);
    }

    mul(b:Matrix4):Matrix4 {
        var a:Matrix4 = this;
        var m:Matrix4 = new Matrix4();
        m.m00 = a.m00 * b.m00 + a.m01 * b.m10 + a.m02 * b.m20 + a.m03 * b.m30;
        m.m10 = a.m10 * b.m00 + a.m11 * b.m10 + a.m12 * b.m20 + a.m13 * b.m30;
        m.m20 = a.m20 * b.m00 + a.m21 * b.m10 + a.m22 * b.m20 + a.m23 * b.m30;
        m.m30 = a.m30 * b.m00 + a.m31 * b.m10 + a.m32 * b.m20 + a.m33 * b.m30;
        m.m01 = a.m00 * b.m01 + a.m01 * b.m11 + a.m02 * b.m21 + a.m03 * b.m31;
        m.m11 = a.m10 * b.m01 + a.m11 * b.m11 + a.m12 * b.m21 + a.m13 * b.m31;
        m.m21 = a.m20 * b.m01 + a.m21 * b.m11 + a.m22 * b.m21 + a.m23 * b.m31;
        m.m31 = a.m30 * b.m01 + a.m31 * b.m11 + a.m32 * b.m21 + a.m33 * b.m31;
        m.m02 = a.m00 * b.m02 + a.m01 * b.m12 + a.m02 * b.m22 + a.m03 * b.m32;
        m.m12 = a.m10 * b.m02 + a.m11 * b.m12 + a.m12 * b.m22 + a.m13 * b.m32;
        m.m22 = a.m20 * b.m02 + a.m21 * b.m12 + a.m22 * b.m22 + a.m23 * b.m32;
        m.m32 = a.m30 * b.m02 + a.m31 * b.m12 + a.m32 * b.m22 + a.m33 * b.m32;
        m.m03 = a.m00 * b.m03 + a.m01 * b.m13 + a.m02 * b.m23 + a.m03 * b.m33;
        m.m13 = a.m10 * b.m03 + a.m11 * b.m13 + a.m12 * b.m23 + a.m13 * b.m33;
        m.m23 = a.m20 * b.m03 + a.m21 * b.m13 + a.m22 * b.m23 + a.m23 * b.m33;
        m.m33 = a.m30 * b.m03 + a.m31 * b.m13 + a.m32 * b.m23 + a.m33 * b.m33;
        return m
    }

    mulPosition(b:Vector3):Vector3 {
        var a:Matrix4 = this;
        var x:number = a.m00 * b.m + a.m01 * b.y + a.m02 * b.z + a.m03;
        var y:number = a.m10 * b.m + a.m11 * b.y + a.m12 * b.z + a.m13;
        var z:number = a.m20 * b.m + a.m21 * b.y + a.m22 * b.z + a.m23;
        return new Vector3(x, y, z);
    }

    mulDirection(b:Vector3):Vector3 {
        var a:Matrix4 = this;
        var x:number = a.m00 * b.m + a.m01 * b.y + a.m02 * b.z;
        var y:number = a.m10 * b.m + a.m11 * b.y + a.m12 * b.z;
        var z:number = a.m20 * b.m + a.m21 * b.y + a.m22 * b.z;
        return new Vector3(x, y, z).normalize();
    }

    mulRay(b:Ray):Ray {
        var a:Matrix4 = this;
        return new Ray(a.mulPosition(b.origin), a.mulDirection(b.direction));
    }

    mulBox(b:Box):Box {
        // http://dev.theomader.com/transform-bounding-boxes/
        var a:Matrix4 = this;
        var minx = b.min.m;
        var maxx = b.max.m;
        var miny = b.min.y;
        var maxy = b.max.y;
        var minz = b.min.z;
        var maxz = b.max.z;
        var xa = a.m00 * minx + a.m10 * minx + a.m20 * minx + a.m30 * minx;
        var xb = a.m00 * maxx + a.m10 * maxx + a.m20 * maxx + a.m30 * maxx;
        var ya = a.m01 * miny + a.m11 * miny + a.m21 * miny + a.m31 * miny;
        var yb = a.m01 * maxy + a.m11 * maxy + a.m21 * maxy + a.m31 * maxy;
        var za = a.m02 * minz + a.m12 * minz + a.m22 * minz + a.m32 * minz;
        var zb = a.m02 * maxz + a.m12 * maxz + a.m22 * maxz + a.m32 * maxz;
        minx = Math.min(xa, xb);
        maxx = Math.max(xa, xb);
        miny = Math.min(ya, yb);
        maxy = Math.max(ya, yb);
        minz = Math.min(za, zb);
        maxz = Math.max(za, zb);
        var min:Vector3 = new Vector3(minx + a.m03, miny + a.m13, minz + a.m23);
        var max:Vector3 = new Vector3(maxx + a.m03, maxy + a.m13, maxz + a.m23);
        return new Box(min, max);
    }

    transpose():Matrix4 {
        var a:Matrix4 = this;
        return new Matrix4(
            a.m00, a.m10, a.m20, a.m30,
            a.m01, a.m11, a.m21, a.m31,
            a.m02, a.m12, a.m22, a.m32,
            a.m03, a.m13, a.m23, a.m33)
    }

    determinant():number {
        var a:Matrix4 = this;
        return (a.m00 * a.m11 * a.m22 * a.m33 - a.m00 * a.m11 * a.m23 * a.m32 +
        a.m00 * a.m12 * a.m23 * a.m31 - a.m00 * a.m12 * a.m21 * a.m33 +
        a.m00 * a.m13 * a.m21 * a.m32 - a.m00 * a.m13 * a.m22 * a.m31 -
        a.m01 * a.m12 * a.m23 * a.m30 + a.m01 * a.m12 * a.m20 * a.m33 -
        a.m01 * a.m13 * a.m20 * a.m32 + a.m01 * a.m13 * a.m22 * a.m30 -
        a.m01 * a.m10 * a.m22 * a.m33 + a.m01 * a.m10 * a.m23 * a.m32 +
        a.m02 * a.m13 * a.m20 * a.m31 - a.m02 * a.m13 * a.m21 * a.m30 +
        a.m02 * a.m10 * a.m21 * a.m33 - a.m02 * a.m10 * a.m23 * a.m31 +
        a.m02 * a.m11 * a.m23 * a.m30 - a.m02 * a.m11 * a.m20 * a.m33 -
        a.m03 * a.m10 * a.m21 * a.m32 + a.m03 * a.m10 * a.m22 * a.m31 -
        a.m03 * a.m11 * a.m22 * a.m30 + a.m03 * a.m11 * a.m20 * a.m32 -
        a.m03 * a.m12 * a.m20 * a.m31 + a.m03 * a.m12 * a.m21 * a.m30)
    }

    inverse():Matrix4 {
        var a:Matrix4 = this;
        var m:Matrix4 = new Matrix4();
        var d:number = a.determinant();
        m.m00 = (a.m12 * a.m23 * a.m31 - a.m13 * a.m22 * a.m31 + a.m13 * a.m21 * a.m32 - a.m11 * a.m23 * a.m32 - a.m12 * a.m21 * a.m33 + a.m11 * a.m22 * a.m33) / d;
        m.m01 = (a.m03 * a.m22 * a.m31 - a.m02 * a.m23 * a.m31 - a.m03 * a.m21 * a.m32 + a.m01 * a.m23 * a.m32 + a.m02 * a.m21 * a.m33 - a.m01 * a.m22 * a.m33) / d;
        m.m02 = (a.m02 * a.m13 * a.m31 - a.m03 * a.m12 * a.m31 + a.m03 * a.m11 * a.m32 - a.m01 * a.m13 * a.m32 - a.m02 * a.m11 * a.m33 + a.m01 * a.m12 * a.m33) / d;
        m.m03 = (a.m03 * a.m12 * a.m21 - a.m02 * a.m13 * a.m21 - a.m03 * a.m11 * a.m22 + a.m01 * a.m13 * a.m22 + a.m02 * a.m11 * a.m23 - a.m01 * a.m12 * a.m23) / d;
        m.m10 = (a.m13 * a.m22 * a.m30 - a.m12 * a.m23 * a.m30 - a.m13 * a.m20 * a.m32 + a.m10 * a.m23 * a.m32 + a.m12 * a.m20 * a.m33 - a.m10 * a.m22 * a.m33) / d;
        m.m11 = (a.m02 * a.m23 * a.m30 - a.m03 * a.m22 * a.m30 + a.m03 * a.m20 * a.m32 - a.m00 * a.m23 * a.m32 - a.m02 * a.m20 * a.m33 + a.m00 * a.m22 * a.m33) / d;
        m.m12 = (a.m03 * a.m12 * a.m30 - a.m02 * a.m13 * a.m30 - a.m03 * a.m10 * a.m32 + a.m00 * a.m13 * a.m32 + a.m02 * a.m10 * a.m33 - a.m00 * a.m12 * a.m33) / d;
        m.m13 = (a.m02 * a.m13 * a.m20 - a.m03 * a.m12 * a.m20 + a.m03 * a.m10 * a.m22 - a.m00 * a.m13 * a.m22 - a.m02 * a.m10 * a.m23 + a.m00 * a.m12 * a.m23) / d;
        m.m20 = (a.m11 * a.m23 * a.m30 - a.m13 * a.m21 * a.m30 + a.m13 * a.m20 * a.m31 - a.m10 * a.m23 * a.m31 - a.m11 * a.m20 * a.m33 + a.m10 * a.m21 * a.m33) / d;
        m.m21 = (a.m03 * a.m21 * a.m30 - a.m01 * a.m23 * a.m30 - a.m03 * a.m20 * a.m31 + a.m00 * a.m23 * a.m31 + a.m01 * a.m20 * a.m33 - a.m00 * a.m21 * a.m33) / d;
        m.m22 = (a.m01 * a.m13 * a.m30 - a.m03 * a.m11 * a.m30 + a.m03 * a.m10 * a.m31 - a.m00 * a.m13 * a.m31 - a.m01 * a.m10 * a.m33 + a.m00 * a.m11 * a.m33) / d;
        m.m23 = (a.m03 * a.m11 * a.m20 - a.m01 * a.m13 * a.m20 - a.m03 * a.m10 * a.m21 + a.m00 * a.m13 * a.m21 + a.m01 * a.m10 * a.m23 - a.m00 * a.m11 * a.m23) / d;
        m.m30 = (a.m12 * a.m21 * a.m30 - a.m11 * a.m22 * a.m30 - a.m12 * a.m20 * a.m31 + a.m10 * a.m22 * a.m31 + a.m11 * a.m20 * a.m32 - a.m10 * a.m21 * a.m32) / d;
        m.m31 = (a.m01 * a.m22 * a.m30 - a.m02 * a.m21 * a.m30 + a.m02 * a.m20 * a.m31 - a.m00 * a.m22 * a.m31 - a.m01 * a.m20 * a.m32 + a.m00 * a.m21 * a.m32) / d;
        m.m32 = (a.m02 * a.m11 * a.m30 - a.m01 * a.m12 * a.m30 - a.m02 * a.m10 * a.m31 + a.m00 * a.m12 * a.m31 + a.m01 * a.m10 * a.m32 - a.m00 * a.m11 * a.m32) / d;
        m.m33 = (a.m01 * a.m12 * a.m20 - a.m02 * a.m11 * a.m20 + a.m02 * a.m10 * a.m21 - a.m00 * a.m12 * a.m21 - a.m01 * a.m10 * a.m22 + a.m00 * a.m11 * a.m22) / d;
        return m;
    }
}