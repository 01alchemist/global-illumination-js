System.register([], function(exports_1) {
    var Color;
    return {
        setters:[],
        execute: function() {
            Color = (function () {
                function Color(r, g, b) {
                    if (r === void 0) { r = 0; }
                    if (g === void 0) { g = 0; }
                    if (b === void 0) { b = 0; }
                    this.r = r;
                    this.g = g;
                    this.b = b;
                }
                Color.fromJson = function (color) {
                    if (color) {
                        return new Color(color.r, color.g, color.b);
                    }
                    else {
                        return null;
                    }
                };
                Color.hexColor = function (hex) {
                    var red = ((hex >> 16) & 255) / 255;
                    var green = ((hex >> 8) & 255) / 255;
                    var blue = (hex & 255) / 255;
                    return new Color(red, green, blue).pow(2.2);
                };
                Color.newColor = function (c) {
                    return new Color(c.r / 65535, c.g / 65535, c.b / 65535);
                };
                Color.prototype.RGBA = function () {
                    var a = this;
                    var _c = new Uint8Array(3);
                    _c[0] = Math.max(0, Math.min(255, a.r * 255));
                    _c[1] = Math.max(0, Math.min(255, a.g * 255));
                    _c[2] = Math.max(0, Math.min(255, a.b * 255));
                    return { r: _c[0], g: _c[1], b: _c[2], a: 255 };
                };
                Color.prototype.add = function (b) {
                    return new Color(this.r + b.r, this.g + b.g, this.b + b.b);
                };
                Color.prototype.sub = function (b) {
                    return new Color(this.r - b.r, this.g - b.g, this.b - b.b);
                };
                Color.prototype.mul = function (b) {
                    return new Color(this.r * b.r, this.g * b.g, this.b * b.b);
                };
                Color.prototype.mulScalar = function (b) {
                    return new Color(this.r * b, this.g * b, this.b * b);
                };
                Color.prototype.divScalar = function (b) {
                    return new Color(this.r / b, this.g / b, this.b / b);
                };
                Color.prototype.min = function (b) {
                    return new Color(Math.min(this.r, b.r), Math.min(this.g, b.g), Math.min(this.b, b.b));
                };
                Color.prototype.max = function (b) {
                    return new Color(Math.max(this.r, b.r), Math.max(this.g, b.g), Math.max(this.b, b.b));
                };
                Color.prototype.pow = function (b) {
                    return new Color(Math.pow(this.r, b), Math.pow(this.g, b), Math.pow(this.b, b));
                };
                Color.prototype.mix = function (b, pct) {
                    var a = this.mulScalar(1 - pct);
                    b = b.mulScalar(pct);
                    return a.add(b);
                };
                Color.prototype.clone = function () {
                    return new Color(this.r, this.g, this.b);
                };
                Color.prototype.writeToMemory = function (mem, offset) {
                    mem[offset++] = this.r;
                    mem[offset++] = this.g;
                    mem[offset++] = this.b;
                    return offset;
                };
                Color.prototype.read = function (mem, offset) {
                    this.r = mem[offset++];
                    this.g = mem[offset++];
                    this.b = mem[offset++];
                    return offset;
                };
                Color.SIZE = 3;
                return Color;
            })();
            exports_1("Color", Color);
        }
    }
});
//# sourceMappingURL=Color.js.map