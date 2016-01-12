System.register(["./Constants", "./HitInfo", "./Ray"], function(exports_1) {
    var Constants_1, HitInfo_1, Ray_1;
    var Hit, NoHit;
    return {
        setters:[
            function (Constants_1_1) {
                Constants_1 = Constants_1_1;
            },
            function (HitInfo_1_1) {
                HitInfo_1 = HitInfo_1_1;
            },
            function (Ray_1_1) {
                Ray_1 = Ray_1_1;
            }],
        execute: function() {
            Hit = (function () {
                function Hit(shape, T) {
                    this.shape = shape;
                    this.T = T;
                }
                Hit.prototype.ok = function () {
                    return this.T < Constants_1.INF;
                };
                Hit.prototype.info = function (ray) {
                    var shape = this.shape;
                    var position = ray.position(this.T);
                    var normal = shape.getNormal(position);
                    var color = shape.getColor(position);
                    var material = shape.getMaterial(position);
                    var inside = false;
                    if (normal.dot(ray.direction) > 0) {
                        normal = normal.mulScalar(-1);
                        inside = true;
                    }
                    ray = new Ray_1.Ray(position, normal);
                    return new HitInfo_1.HitInfo(shape, position, normal, ray, color, material, inside);
                };
                return Hit;
            })();
            exports_1("Hit", Hit);
            exports_1("NoHit", NoHit = new Hit(null, Constants_1.INF));
        }
    }
});
//# sourceMappingURL=Hit.js.map