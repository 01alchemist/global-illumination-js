System.register(["../../math/Color", "../../math/Vector3", "../../data/ImageLoader", "../../utils/MathUtils"], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var Color_1, Vector3_1, ImageLoader_1, MathUtils_1;
    var Texture;
    return {
        setters:[
            function (Color_1_1) {
                Color_1 = Color_1_1;
            },
            function (Vector3_1_1) {
                Vector3_1 = Vector3_1_1;
            },
            function (ImageLoader_1_1) {
                ImageLoader_1 = ImageLoader_1_1;
            },
            function (MathUtils_1_1) {
                MathUtils_1 = MathUtils_1_1;
            }],
        execute: function() {
            Texture = (function (_super) {
                __extends(Texture, _super);
                function Texture(url) {
                    _super.call(this);
                    try {
                        if (importScripts) {
                            return;
                        }
                    }
                    catch (e) {
                    }
                    if (!Texture.ctx) {
                        var canvas = document.createElement("canvas");
                        Texture.ctx = canvas.getContext("2d");
                    }
                    if (url) {
                        this.load(url);
                    }
                }
                Texture.getTexture = function (url) {
                    var texture = Texture.map.get(url);
                    if (texture) {
                        return texture;
                    }
                    else {
                        return new Texture(url);
                    }
                };
                Texture.fromJson = function (texture) {
                    if (texture) {
                        var _texture = new Texture();
                        _texture.data = texture.data;
                        _texture.pixels = texture.pixels;
                        return _texture;
                    }
                    else {
                        return null;
                    }
                };
                Texture.prototype.sample = function (u, v) {
                    u = MathUtils_1.MathUtils.fract(MathUtils_1.MathUtils.fract(u) + 1);
                    v = MathUtils_1.MathUtils.fract(MathUtils_1.MathUtils.fract(v) + 1);
                    v = 1 - v;
                    var x = Math.round(u * this.width);
                    var y = Math.round(v * this.height);
                    return this.data[y * this.width + x];
                };
                Texture.prototype.normalSample = function (u, v) {
                    var c = this.sample(u, v).pow(1 / 2.2);
                    return new Vector3_1.Vector3(c.r * 2 - 1, c.g * 2 - 1, c.b * 2 - 1).normalize();
                };
                Texture.prototype.bumpSample = function (u, v) {
                    u = MathUtils_1.MathUtils.fract(MathUtils_1.MathUtils.fract(u) + 1);
                    v = MathUtils_1.MathUtils.fract(MathUtils_1.MathUtils.fract(v) + 1);
                    v = 1 - v;
                    var x = Math.round(u * this.width);
                    var y = Math.round(v * this.height);
                    var x1 = MathUtils_1.MathUtils.clampInt(x - 1, 0, this.width - 1);
                    var x2 = MathUtils_1.MathUtils.clampInt(x + 1, 0, this.width - 1);
                    var y1 = MathUtils_1.MathUtils.clampInt(y - 1, 0, this.height - 1);
                    var y2 = MathUtils_1.MathUtils.clampInt(y + 1, 0, this.height - 1);
                    var cx = this.data[y * this.width + x1].sub(this.data[y * this.width + x2]);
                    var cy = this.data[y1 * this.width + x].sub(this.data[y2 * this.width + x]);
                    return new Vector3_1.Vector3(cx.r, cy.r, 0);
                };
                Texture.prototype.load = function (url, onLoad, onProgress, onError) {
                    var self = this;
                    this.sourceFile = url;
                    var texture = Texture.map.get(url);
                    if (texture) {
                        this.data = texture.data;
                        this.image = texture.image;
                        this.pixels = texture.pixels;
                        this.sourceFile = texture.sourceFile;
                        if (onLoad) {
                            onLoad(this.data);
                        }
                        return this.image;
                    }
                    Texture.map.set(url, this);
                    return _super.prototype.load.call(this, url, function (image) {
                        Texture.ctx.drawImage(image, 0, 0);
                        var pixels = Texture.ctx.getImageData(0, 0, image.width, image.height).data;
                        if (onLoad) {
                            onLoad(pixels);
                        }
                        self.data = [];
                        for (var y = 0; y < image.height; y++) {
                            for (var x = 0; x < image.width; x++) {
                                var pi = y * (image.width * 4) + (x * 4);
                                var index = y * image.width + x;
                                var rgba = {
                                    r: pixels[pi],
                                    g: pixels[pi + 1],
                                    b: pixels[pi + 2],
                                    a: pixels[pi + 3],
                                };
                                self.data[index] = Color_1.Color.newColor(rgba).pow(2.2);
                            }
                        }
                        self.image = image;
                        self.width = image.width;
                        self.height = image.height;
                        self.pixels = pixels;
                    }, onProgress, onError);
                };
                Texture.map = new Map();
                return Texture;
            })(ImageLoader_1.ImageLoader);
            exports_1("Texture", Texture);
        }
    }
});
//# sourceMappingURL=Texture.js.map