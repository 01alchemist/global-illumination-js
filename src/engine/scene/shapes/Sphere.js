System.register(["../../math/Vector3", "./Box", "../../math/Hit", "./Shape", "../materials/MaterialUtils"], function(exports_1) {
    var Vector3_1, Box_1, Hit_1, Hit_2, Shape_1, MaterialUtils_1;
    var Sphere;
    return {
        setters:[
            function (Vector3_1_1) {
                Vector3_1 = Vector3_1_1;
            },
            function (Box_1_1) {
                Box_1 = Box_1_1;
            },
            function (Hit_1_1) {
                Hit_1 = Hit_1_1;
                Hit_2 = Hit_1_1;
            },
            function (Shape_1_1) {
                Shape_1 = Shape_1_1;
            },
            function (MaterialUtils_1_1) {
                MaterialUtils_1 = MaterialUtils_1_1;
            }],
        execute: function() {
            Sphere = (function () {
                function Sphere(center, radius, material, box) {
                    this.center = center;
                    this.radius = radius;
                    this.material = material;
                    this.box = box;
                    this.type = Shape_1.ShapeType.SPHERE;
                }
                Sphere.fromJson = function (sphere) {
                    return new Sphere(Vector3_1.Vector3.fromJson(sphere.center), sphere.radius, MaterialUtils_1.MaterialUtils.fromJson(sphere.material), Box_1.Box.fromJson(sphere.box));
                };
                Sphere.newSphere = function (center, radius, material) {
                    var min = new Vector3_1.Vector3(center.x - radius, center.y - radius, center.z - radius);
                    var max = new Vector3_1.Vector3(center.x + radius, center.y + radius, center.z + radius);
                    var box = new Box_1.Box(min, max);
                    return new Sphere(center, radius, material, box);
                };
                Sphere.prototype.compile = function () {
                };
                Sphere.prototype.intersect = function (r) {
                    var to = r.origin.sub(this.center);
                    var b = to.dot(r.direction);
                    var c = to.dot(to) - this.radius * this.radius;
                    var d = b * b - c;
                    if (d > 0) {
                        d = Math.sqrt(d);
                        var t1 = -b - d;
                        if (t1 > 0) {
                            return new Hit_1.Hit(this, t1);
                        }
                    }
                    return Hit_2.NoHit;
                };
                Sphere.prototype.getColor = function (p) {
                    if (this.material.texture == null) {
                        return this.material.color;
                    }
                    var u = Math.atan2(p.z, p.x);
                    var v = Math.atan2(p.y, new Vector3_1.Vector3(p.x, 0, p.z).length());
                    u = (u + Math.PI) / (2 * Math.PI);
                    v = 1 - (v + Math.PI / 2) / Math.PI;
                    return this.material.texture.sample(u, v);
                };
                Sphere.prototype.getMaterial = function (p) {
                    return this.material;
                };
                Sphere.prototype.getNormal = function (p) {
                    return p.sub(this.center).normalize();
                };
                Sphere.prototype.getRandomPoint = function () {
                    while (true) {
                        var x = Math.random() * 2 - 1;
                        var y = Math.random() * 2 - 1;
                        var z = Math.random() * 2 - 1;
                        var v = new Vector3_1.Vector3(x, y, z);
                        if (v.length() <= 1) {
                            return v.mulScalar(this.radius).add(this.center);
                        }
                    }
                };
                return Sphere;
            })();
            exports_1("Sphere", Sphere);
        }
    }
});
//# sourceMappingURL=Sphere.js.map