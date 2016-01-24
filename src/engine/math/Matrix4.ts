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

    constructor(x00 = 0, x01 = 0, x02 = 0, x03 = 0,
                x10 = 0, x11 = 0, x12 = 0, x13 = 0,
                x20 = 0, x21 = 0, x22 = 0, x23 = 0,
                x30 = 0, x31 = 0, x32 = 0, x33 = 0) {
        this.m = new Float32Array(16);
    }

    directRead(memory:Float32Array, offset:number):number {
        var m:Matrix4 = this;
        m.x00 = memory[offset++];
        m.x01 = memory[offset++];
        m.x02 = memory[offset++];
        m.x03 = memory[offset++];
        m.x10 = memory[offset++];
        m.x11 = memory[offset++];
        m.x12 = memory[offset++];
        m.x13 = memory[offset++];
        m.x20 = memory[offset++];
        m.x21 = memory[offset++];
        m.x22 = memory[offset++];
        m.x23 = memory[offset++];
        m.x30 = memory[offset++];
        m.x31 = memory[offset++];
        m.x32 = memory[offset++];
        m.x33 = memory[offset++];
        return offset;
    }

    directWrite(memory:Float32Array, offset:number):number {
        var m:Matrix4 = this;
        memory[offset++] = m.x00;
        memory[offset++] = m.x01;
        memory[offset++] = m.x02;
        memory[offset++] = m.x03;
        memory[offset++] = m.x10;
        memory[offset++] = m.x11;
        memory[offset++] = m.x12;
        memory[offset++] = m.x13;
        memory[offset++] = m.x20;
        memory[offset++] = m.x21;
        memory[offset++] = m.x22;
        memory[offset++] = m.x23;
        memory[offset++] = m.x30;
        memory[offset++] = m.x31;
        memory[offset++] = m.x32;
        memory[offset++] = m.x33;
        return offset;
    }

    read(memory:ByteArrayBase|DirectMemory):number {
        this.x00 = memory.readFloat();
        this.x01 = memory.readFloat();
        this.x02 = memory.readFloat();
        this.x03 = memory.readFloat();
        this.x10 = memory.readFloat();
        this.x11 = memory.readFloat();
        this.x12 = memory.readFloat();
        this.x13 = memory.readFloat();
        this.x20 = memory.readFloat();
        this.x21 = memory.readFloat();
        this.x22 = memory.readFloat();
        this.x23 = memory.readFloat();
        this.x30 = memory.readFloat();
        this.x31 = memory.readFloat();
        this.x32 = memory.readFloat();
        this.x33 = memory.readFloat();
        return memory.position;
    }

    write(memory:ByteArrayBase|DirectMemory):number {
        memory.writeFloat(this.x00);
        memory.writeFloat(this.x01);
        memory.writeFloat(this.x02);
        memory.writeFloat(this.x03);
        memory.writeFloat(this.x10);
        memory.writeFloat(this.x11);
        memory.writeFloat(this.x12);
        memory.writeFloat(this.x13);
        memory.writeFloat(this.x20);
        memory.writeFloat(this.x21);
        memory.writeFloat(this.x22);
        memory.writeFloat(this.x23);
        memory.writeFloat(this.x30);
        memory.writeFloat(this.x31);
        memory.writeFloat(this.x32);
        memory.writeFloat(this.x33);
        return memory.position;
    }

    static fromJson(m:Matrix4):Matrix4 {
        return new Matrix4(
            m.x00, m.x01, m.x02, m.x03,
            m.x10, m.x11, m.x12, m.x13,
            m.x20, m.x21, m.x22, m.x23,
            m.x30, m.x31, m.x32, m.x33
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
            1, 0, 0, v.x,
            0, 1, 0, v.y,
            0, 0, 1, v.z,
            0, 0, 0, 1)
    }

    static scale(v:Vector3):Matrix4 {
        return new Matrix4(
            v.x, 0, 0, 0,
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
            m * v.x * v.x + c, m * v.x * v.y + v.z * s, m * v.z * v.x - v.y * s, 0,
            m * v.x * v.y - v.z * s, m * v.y * v.y + c, m * v.y * v.z + v.x * s, 0,
            m * v.z * v.x + v.y * s, m * v.y * v.z - v.x * s, m * v.z * v.z + c, 0,
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
        m.x00 = a.x00 * b.x00 + a.x01 * b.x10 + a.x02 * b.x20 + a.x03 * b.x30;
        m.x10 = a.x10 * b.x00 + a.x11 * b.x10 + a.x12 * b.x20 + a.x13 * b.x30;
        m.x20 = a.x20 * b.x00 + a.x21 * b.x10 + a.x22 * b.x20 + a.x23 * b.x30;
        m.x30 = a.x30 * b.x00 + a.x31 * b.x10 + a.x32 * b.x20 + a.x33 * b.x30;
        m.x01 = a.x00 * b.x01 + a.x01 * b.x11 + a.x02 * b.x21 + a.x03 * b.x31;
        m.x11 = a.x10 * b.x01 + a.x11 * b.x11 + a.x12 * b.x21 + a.x13 * b.x31;
        m.x21 = a.x20 * b.x01 + a.x21 * b.x11 + a.x22 * b.x21 + a.x23 * b.x31;
        m.x31 = a.x30 * b.x01 + a.x31 * b.x11 + a.x32 * b.x21 + a.x33 * b.x31;
        m.x02 = a.x00 * b.x02 + a.x01 * b.x12 + a.x02 * b.x22 + a.x03 * b.x32;
        m.x12 = a.x10 * b.x02 + a.x11 * b.x12 + a.x12 * b.x22 + a.x13 * b.x32;
        m.x22 = a.x20 * b.x02 + a.x21 * b.x12 + a.x22 * b.x22 + a.x23 * b.x32;
        m.x32 = a.x30 * b.x02 + a.x31 * b.x12 + a.x32 * b.x22 + a.x33 * b.x32;
        m.x03 = a.x00 * b.x03 + a.x01 * b.x13 + a.x02 * b.x23 + a.x03 * b.x33;
        m.x13 = a.x10 * b.x03 + a.x11 * b.x13 + a.x12 * b.x23 + a.x13 * b.x33;
        m.x23 = a.x20 * b.x03 + a.x21 * b.x13 + a.x22 * b.x23 + a.x23 * b.x33;
        m.x33 = a.x30 * b.x03 + a.x31 * b.x13 + a.x32 * b.x23 + a.x33 * b.x33;
        return m
    }

    mulPosition(b:Vector3):Vector3 {
        var a:Matrix4 = this;
        var x:number = a.x00 * b.x + a.x01 * b.y + a.x02 * b.z + a.x03;
        var y:number = a.x10 * b.x + a.x11 * b.y + a.x12 * b.z + a.x13;
        var z:number = a.x20 * b.x + a.x21 * b.y + a.x22 * b.z + a.x23;
        return new Vector3(x, y, z);
    }

    mulDirection(b:Vector3):Vector3 {
        var a:Matrix4 = this;
        var x:number = a.x00 * b.x + a.x01 * b.y + a.x02 * b.z;
        var y:number = a.x10 * b.x + a.x11 * b.y + a.x12 * b.z;
        var z:number = a.x20 * b.x + a.x21 * b.y + a.x22 * b.z;
        return new Vector3(x, y, z).normalize();
    }

    mulRay(b:Ray):Ray {
        var a:Matrix4 = this;
        return new Ray(a.mulPosition(b.origin), a.mulDirection(b.direction));
    }

    mulBox(b:Box):Box {
        // http://dev.theomader.com/transform-bounding-boxes/
        var a:Matrix4 = this;
        var minx = b.min.x;
        var maxx = b.max.x;
        var miny = b.min.y;
        var maxy = b.max.y;
        var minz = b.min.z;
        var maxz = b.max.z;
        var xa = a.x00 * minx + a.x10 * minx + a.x20 * minx + a.x30 * minx;
        var xb = a.x00 * maxx + a.x10 * maxx + a.x20 * maxx + a.x30 * maxx;
        var ya = a.x01 * miny + a.x11 * miny + a.x21 * miny + a.x31 * miny;
        var yb = a.x01 * maxy + a.x11 * maxy + a.x21 * maxy + a.x31 * maxy;
        var za = a.x02 * minz + a.x12 * minz + a.x22 * minz + a.x32 * minz;
        var zb = a.x02 * maxz + a.x12 * maxz + a.x22 * maxz + a.x32 * maxz;
        minx = Math.min(xa, xb);
        maxx = Math.max(xa, xb);
        miny = Math.min(ya, yb);
        maxy = Math.max(ya, yb);
        minz = Math.min(za, zb);
        maxz = Math.max(za, zb);
        var min:Vector3 = new Vector3(minx + a.x03, miny + a.x13, minz + a.x23);
        var max:Vector3 = new Vector3(maxx + a.x03, maxy + a.x13, maxz + a.x23);
        return new Box(min, max);
    }

    transpose():Matrix4 {
        var a:Matrix4 = this;
        return new Matrix4(
            a.x00, a.x10, a.x20, a.x30,
            a.x01, a.x11, a.x21, a.x31,
            a.x02, a.x12, a.x22, a.x32,
            a.x03, a.x13, a.x23, a.x33)
    }

    determinant():number {
        var a:Matrix4 = this;
        return (a.x00 * a.x11 * a.x22 * a.x33 - a.x00 * a.x11 * a.x23 * a.x32 +
        a.x00 * a.x12 * a.x23 * a.x31 - a.x00 * a.x12 * a.x21 * a.x33 +
        a.x00 * a.x13 * a.x21 * a.x32 - a.x00 * a.x13 * a.x22 * a.x31 -
        a.x01 * a.x12 * a.x23 * a.x30 + a.x01 * a.x12 * a.x20 * a.x33 -
        a.x01 * a.x13 * a.x20 * a.x32 + a.x01 * a.x13 * a.x22 * a.x30 -
        a.x01 * a.x10 * a.x22 * a.x33 + a.x01 * a.x10 * a.x23 * a.x32 +
        a.x02 * a.x13 * a.x20 * a.x31 - a.x02 * a.x13 * a.x21 * a.x30 +
        a.x02 * a.x10 * a.x21 * a.x33 - a.x02 * a.x10 * a.x23 * a.x31 +
        a.x02 * a.x11 * a.x23 * a.x30 - a.x02 * a.x11 * a.x20 * a.x33 -
        a.x03 * a.x10 * a.x21 * a.x32 + a.x03 * a.x10 * a.x22 * a.x31 -
        a.x03 * a.x11 * a.x22 * a.x30 + a.x03 * a.x11 * a.x20 * a.x32 -
        a.x03 * a.x12 * a.x20 * a.x31 + a.x03 * a.x12 * a.x21 * a.x30)
    }

    inverse():Matrix4 {
        var a:Matrix4 = this;
        var m:Matrix4 = new Matrix4();
        var d:number = a.determinant();
        m.x00 = (a.x12 * a.x23 * a.x31 - a.x13 * a.x22 * a.x31 + a.x13 * a.x21 * a.x32 - a.x11 * a.x23 * a.x32 - a.x12 * a.x21 * a.x33 + a.x11 * a.x22 * a.x33) / d;
        m.x01 = (a.x03 * a.x22 * a.x31 - a.x02 * a.x23 * a.x31 - a.x03 * a.x21 * a.x32 + a.x01 * a.x23 * a.x32 + a.x02 * a.x21 * a.x33 - a.x01 * a.x22 * a.x33) / d;
        m.x02 = (a.x02 * a.x13 * a.x31 - a.x03 * a.x12 * a.x31 + a.x03 * a.x11 * a.x32 - a.x01 * a.x13 * a.x32 - a.x02 * a.x11 * a.x33 + a.x01 * a.x12 * a.x33) / d;
        m.x03 = (a.x03 * a.x12 * a.x21 - a.x02 * a.x13 * a.x21 - a.x03 * a.x11 * a.x22 + a.x01 * a.x13 * a.x22 + a.x02 * a.x11 * a.x23 - a.x01 * a.x12 * a.x23) / d;
        m.x10 = (a.x13 * a.x22 * a.x30 - a.x12 * a.x23 * a.x30 - a.x13 * a.x20 * a.x32 + a.x10 * a.x23 * a.x32 + a.x12 * a.x20 * a.x33 - a.x10 * a.x22 * a.x33) / d;
        m.x11 = (a.x02 * a.x23 * a.x30 - a.x03 * a.x22 * a.x30 + a.x03 * a.x20 * a.x32 - a.x00 * a.x23 * a.x32 - a.x02 * a.x20 * a.x33 + a.x00 * a.x22 * a.x33) / d;
        m.x12 = (a.x03 * a.x12 * a.x30 - a.x02 * a.x13 * a.x30 - a.x03 * a.x10 * a.x32 + a.x00 * a.x13 * a.x32 + a.x02 * a.x10 * a.x33 - a.x00 * a.x12 * a.x33) / d;
        m.x13 = (a.x02 * a.x13 * a.x20 - a.x03 * a.x12 * a.x20 + a.x03 * a.x10 * a.x22 - a.x00 * a.x13 * a.x22 - a.x02 * a.x10 * a.x23 + a.x00 * a.x12 * a.x23) / d;
        m.x20 = (a.x11 * a.x23 * a.x30 - a.x13 * a.x21 * a.x30 + a.x13 * a.x20 * a.x31 - a.x10 * a.x23 * a.x31 - a.x11 * a.x20 * a.x33 + a.x10 * a.x21 * a.x33) / d;
        m.x21 = (a.x03 * a.x21 * a.x30 - a.x01 * a.x23 * a.x30 - a.x03 * a.x20 * a.x31 + a.x00 * a.x23 * a.x31 + a.x01 * a.x20 * a.x33 - a.x00 * a.x21 * a.x33) / d;
        m.x22 = (a.x01 * a.x13 * a.x30 - a.x03 * a.x11 * a.x30 + a.x03 * a.x10 * a.x31 - a.x00 * a.x13 * a.x31 - a.x01 * a.x10 * a.x33 + a.x00 * a.x11 * a.x33) / d;
        m.x23 = (a.x03 * a.x11 * a.x20 - a.x01 * a.x13 * a.x20 - a.x03 * a.x10 * a.x21 + a.x00 * a.x13 * a.x21 + a.x01 * a.x10 * a.x23 - a.x00 * a.x11 * a.x23) / d;
        m.x30 = (a.x12 * a.x21 * a.x30 - a.x11 * a.x22 * a.x30 - a.x12 * a.x20 * a.x31 + a.x10 * a.x22 * a.x31 + a.x11 * a.x20 * a.x32 - a.x10 * a.x21 * a.x32) / d;
        m.x31 = (a.x01 * a.x22 * a.x30 - a.x02 * a.x21 * a.x30 + a.x02 * a.x20 * a.x31 - a.x00 * a.x22 * a.x31 - a.x01 * a.x20 * a.x32 + a.x00 * a.x21 * a.x32) / d;
        m.x32 = (a.x02 * a.x11 * a.x30 - a.x01 * a.x12 * a.x30 - a.x02 * a.x10 * a.x31 + a.x00 * a.x12 * a.x31 + a.x01 * a.x10 * a.x32 - a.x00 * a.x11 * a.x32) / d;
        m.x33 = (a.x01 * a.x12 * a.x20 - a.x02 * a.x11 * a.x20 + a.x02 * a.x10 * a.x21 - a.x00 * a.x12 * a.x21 - a.x01 * a.x10 * a.x22 + a.x00 * a.x11 * a.x22) / d;
        return m;
    }
}