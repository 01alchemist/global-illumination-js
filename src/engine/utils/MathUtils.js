System.register(["../math/Constants"], function(exports_1) {
    var Constants_1, Constants_2, Constants_3;
    var MathUtils;
    return {
        setters:[
            function (Constants_1_1) {
                Constants_1 = Constants_1_1;
                Constants_2 = Constants_1_1;
                Constants_3 = Constants_1_1;
            }],
        execute: function() {
            MathUtils = (function () {
                function MathUtils() {
                }
                MathUtils.radians = function (degrees) {
                    return degrees * Math.PI / 180;
                };
                MathUtils.degrees = function (radians) {
                    return radians * 180 / Math.PI;
                };
                MathUtils.median = function (items) {
                    var n = items.length;
                    if (n == 0) {
                        return 0;
                    }
                    else if (n % 2 == 1) {
                        return items[n / 2];
                    }
                    else {
                        var a = items[n / 2 - 1];
                        var b = items[n / 2];
                        return (a + b) / 2;
                    }
                };
                MathUtils.fract = function (x) {
                    var n = MathUtils.Modf(x);
                    return n.frac;
                };
                MathUtils.Modf = function (f) {
                    if (f < 1) {
                        if (f < 0) {
                            var n = MathUtils.Modf(-f);
                            return { int: -n.int, frac: -n.frac };
                        }
                        return { int: 0, frac: f };
                    }
                    var x = f;
                    var e = (x >> Constants_1.shift) & Constants_2.mask - Constants_3.bias;
                    if (e < 64 - 12) {
                        x &= 1 << (64 - 12 - e) - 1;
                        x ^= x;
                    }
                    var int = x;
                    var frac = f - int;
                    return { int: int, frac: frac };
                };
                MathUtils.clamp = function (x, lo, hi) {
                    if (x < lo) {
                        return lo;
                    }
                    if (x > hi) {
                        return hi;
                    }
                    return x;
                };
                return MathUtils;
            })();
            exports_1("MathUtils", MathUtils);
        }
    }
});
//# sourceMappingURL=MathUtils.js.map