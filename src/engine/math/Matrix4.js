System.register(["./Vector3", "../scene/shapes/Box", "./Ray"], function(exports_1) {
    var Vector3_1, Box_1, Ray_1;
    var Matrix4;
    return {
        setters:[
            function (Vector3_1_1) {
                Vector3_1 = Vector3_1_1;
            },
            function (Box_1_1) {
                Box_1 = Box_1_1;
            },
            function (Ray_1_1) {
                Ray_1 = Ray_1_1;
            }],
        execute: function() {
            Matrix4 = (function () {
                function Matrix4(x00, x01, x02, x03, x10, x11, x12, x13, x20, x21, x22, x23, x30, x31, x32, x33) {
                    if (x00 === void 0) { x00 = 0; }
                    if (x01 === void 0) { x01 = 0; }
                    if (x02 === void 0) { x02 = 0; }
                    if (x03 === void 0) { x03 = 0; }
                    if (x10 === void 0) { x10 = 0; }
                    if (x11 === void 0) { x11 = 0; }
                    if (x12 === void 0) { x12 = 0; }
                    if (x13 === void 0) { x13 = 0; }
                    if (x20 === void 0) { x20 = 0; }
                    if (x21 === void 0) { x21 = 0; }
                    if (x22 === void 0) { x22 = 0; }
                    if (x23 === void 0) { x23 = 0; }
                    if (x30 === void 0) { x30 = 0; }
                    if (x31 === void 0) { x31 = 0; }
                    if (x32 === void 0) { x32 = 0; }
                    if (x33 === void 0) { x33 = 0; }
                    this.x00 = x00;
                    this.x01 = x01;
                    this.x02 = x02;
                    this.x03 = x03;
                    this.x10 = x10;
                    this.x11 = x11;
                    this.x12 = x12;
                    this.x13 = x13;
                    this.x20 = x20;
                    this.x21 = x21;
                    this.x22 = x22;
                    this.x23 = x23;
                    this.x30 = x30;
                    this.x31 = x31;
                    this.x32 = x32;
                    this.x33 = x33;
                    this.m = new Float64Array(16);
                }
                Matrix4.fromJson = function (m) {
                    return new Matrix4(m.x00, m.x01, m.x02, m.x03, m.x10, m.x11, m.x12, m.x13, m.x20, m.x21, m.x22, m.x23, m.x30, m.x31, m.x32, m.x33);
                };
                Matrix4.identity = function () {
                    return new Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
                };
                Matrix4.translate = function (v) {
                    return new Matrix4(1, 0, 0, v.x, 0, 1, 0, v.y, 0, 0, 1, v.z, 0, 0, 0, 1);
                };
                Matrix4.scale = function (v) {
                    return new Matrix4(v.x, 0, 0, 0, 0, v.y, 0, 0, 0, 0, v.z, 0, 0, 0, 0, 1);
                };
                Matrix4.rotate = function (v, a) {
                    v = v.normalize();
                    var s = Math.sin(a);
                    var c = Math.cos(a);
                    var m = 1 - c;
                    return new Matrix4(m * v.x * v.x + c, m * v.x * v.y + v.z * s, m * v.z * v.x - v.y * s, 0, m * v.x * v.y - v.z * s, m * v.y * v.y + c, m * v.y * v.z + v.x * s, 0, m * v.z * v.x + v.y * s, m * v.y * v.z - v.x * s, m * v.z * v.z + c, 0, 0, 0, 0, 1);
                };
                Matrix4.frustum = function (l, r, b, t, n, f) {
                    var t1 = 2 * n;
                    var t2 = r - l;
                    var t3 = t - b;
                    var t4 = f - n;
                    return new Matrix4(t1 / t2, 0, (r + l) / t2, 0, 0, t1 / t3, (t + b) / t3, 0, 0, 0, (-f - n) / t4, (-t1 * f) / t4, 0, 0, -1, 0);
                };
                Matrix4.orthographic = function (l, r, b, t, n, f) {
                    return new Matrix4(2 / (r - l), 0, 0, -(r + l) / (r - l), 0, 2 / (t - b), 0, -(t + b) / (t - b), 0, 0, -2 / (f - n), -(f + n) / (f - n), 0, 0, 0, 1);
                };
                Matrix4.perspective = function (fov, aspect, near, far) {
                    var ymax = near * Math.tan(fov * Math.PI / 360);
                    var xmax = ymax * aspect;
                    return Matrix4.frustum(-xmax, xmax, -ymax, ymax, near, far);
                };
                Matrix4.prototype.translate = function (v) {
                    return Matrix4.translate(v).mul(this);
                };
                Matrix4.prototype.scale = function (v) {
                    return Matrix4.scale(v).mul(this);
                };
                Matrix4.prototype.rotate = function (v, a) {
                    return Matrix4.rotate(v, a).mul(this);
                };
                Matrix4.prototype.frustum = function (l, r, b, t, n, f) {
                    return Matrix4.frustum(l, r, b, t, n, f).mul(this);
                };
                Matrix4.prototype.orthographic = function (l, r, b, t, n, f) {
                    return Matrix4.orthographic(l, r, b, t, n, f).mul(this);
                };
                Matrix4.prototype.perspective = function (fov, aspect, near, far) {
                    return Matrix4.perspective(fov, aspect, near, far).mul(this);
                };
                Matrix4.prototype.mul = function (b) {
                    var a = this;
                    var m = new Matrix4();
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
                    return m;
                };
                Matrix4.prototype.mulPosition = function (b) {
                    var a = this;
                    var x = a.x00 * b.x + a.x01 * b.y + a.x02 * b.z + a.x03;
                    var y = a.x10 * b.x + a.x11 * b.y + a.x12 * b.z + a.x13;
                    var z = a.x20 * b.x + a.x21 * b.y + a.x22 * b.z + a.x23;
                    return new Vector3_1.Vector3(x, y, z);
                };
                Matrix4.prototype.mulDirection = function (b) {
                    var a = this;
                    var x = a.x00 * b.x + a.x01 * b.y + a.x02 * b.z;
                    var y = a.x10 * b.x + a.x11 * b.y + a.x12 * b.z;
                    var z = a.x20 * b.x + a.x21 * b.y + a.x22 * b.z;
                    return new Vector3_1.Vector3(x, y, z).normalize();
                };
                Matrix4.prototype.mulRay = function (b) {
                    var a = this;
                    return new Ray_1.Ray(a.mulPosition(b.origin), a.mulDirection(b.direction));
                };
                Matrix4.prototype.mulBox = function (b) {
                    var a = this;
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
                    var min = new Vector3_1.Vector3(minx + a.x03, miny + a.x13, minz + a.x23);
                    var max = new Vector3_1.Vector3(maxx + a.x03, maxy + a.x13, maxz + a.x23);
                    return new Box_1.Box(min, max);
                };
                Matrix4.prototype.transpose = function () {
                    var a = this;
                    return new Matrix4(a.x00, a.x10, a.x20, a.x30, a.x01, a.x11, a.x21, a.x31, a.x02, a.x12, a.x22, a.x32, a.x03, a.x13, a.x23, a.x33);
                };
                Matrix4.prototype.determinant = function () {
                    var a = this;
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
                        a.x03 * a.x12 * a.x20 * a.x31 + a.x03 * a.x12 * a.x21 * a.x30);
                };
                Matrix4.prototype.inverse = function () {
                    var a = this;
                    var m = new Matrix4();
                    var d = a.determinant();
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
                };
                Matrix4.SIZE = 16;
                return Matrix4;
            })();
            exports_1("Matrix4", Matrix4);
        }
    }
});
//# sourceMappingURL=Matrix4.js.map