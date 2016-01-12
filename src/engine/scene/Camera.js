System.register(["../math/Vector3", "../math/Ray"], function(exports_1) {
    var Vector3_1, Ray_1;
    var Camera;
    return {
        setters:[
            function (Vector3_1_1) {
                Vector3_1 = Vector3_1_1;
            },
            function (Ray_1_1) {
                Ray_1 = Ray_1_1;
            }],
        execute: function() {
            Camera = (function () {
                function Camera(p, u, v, w, m, focalDistance, apertureRadius) {
                    this.p = p;
                    this.u = u;
                    this.v = v;
                    this.w = w;
                    this.m = m;
                    this.focalDistance = focalDistance;
                    this.apertureRadius = apertureRadius;
                }
                Camera.fromJson = function (camera) {
                    return new Camera(Vector3_1.Vector3.fromJson(camera.p), Vector3_1.Vector3.fromJson(camera.u), Vector3_1.Vector3.fromJson(camera.v), Vector3_1.Vector3.fromJson(camera.w), camera.m, camera.focalDistance, camera.apertureRadius);
                };
                Camera.lookAt = function (eye, look, up, fovy) {
                    var c = new Camera();
                    c.p = eye;
                    c.w = look.sub(eye).normalize();
                    c.u = up.cross(c.w).normalize();
                    c.v = c.w.cross(c.u).normalize();
                    c.m = 1 / Math.tan(fovy * Math.PI / 360);
                    return c;
                };
                Camera.prototype.setFocus = function (focalPoint, apertureRadius) {
                    var c = this;
                    c.focalDistance = focalPoint.sub(c.p).length();
                    c.apertureRadius = apertureRadius;
                };
                Camera.prototype.castRay = function (x, y, w, h, u, v) {
                    var c = this;
                    var aspect = w / h;
                    var px = ((x + u - 0.5) / (w - 1)) * 2 - 1;
                    var py = ((y + v - 0.5) / (h - 1)) * 2 - 1;
                    var d = new Vector3_1.Vector3();
                    d = d.add(c.u.mulScalar(-px * aspect));
                    d = d.add(c.v.mulScalar(-py));
                    d = d.add(c.w.mulScalar(c.m));
                    d = d.normalize();
                    var p = c.p;
                    if (c.apertureRadius > 0) {
                        var focalPoint = c.p.add(d.mulScalar(c.focalDistance));
                        var angle = Math.random() * 2 * Math.PI;
                        var radius = Math.random() * c.apertureRadius;
                        p = p.add(c.u.mulScalar(Math.cos(angle) * radius));
                        p = p.add(c.v.mulScalar(Math.sin(angle) * radius));
                        d = focalPoint.sub(p).normalize();
                    }
                    if (Camera.debug) {
                        Camera.debug = false;
                        console.log("debug ray");
                        return new Ray_1.Ray(p, new Vector3_1.Vector3(5783340439686658, -0.01693718617190925, 0.8156242181982015));
                    }
                    else {
                        return new Ray_1.Ray(p, d);
                    }
                };
                Camera.debug = true;
                return Camera;
            })();
            exports_1("Camera", Camera);
        }
    }
});
//# sourceMappingURL=Camera.js.map