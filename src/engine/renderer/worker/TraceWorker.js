System.register(["../../scene/Camera", "../../math/Color", "../Renderer", "../../scene/SharedScene", "../../../pointer/DirectMemory"], function(exports_1) {
    var Camera_1, Color_1, Renderer_1, SharedScene_1, DirectMemory_1;
    var TraceWorker;
    return {
        setters:[
            function (Camera_1_1) {
                Camera_1 = Camera_1_1;
            },
            function (Color_1_1) {
                Color_1 = Color_1_1;
            },
            function (Renderer_1_1) {
                Renderer_1 = Renderer_1_1;
            },
            function (SharedScene_1_1) {
                SharedScene_1 = SharedScene_1_1;
            },
            function (DirectMemory_1_1) {
                DirectMemory_1 = DirectMemory_1_1;
            }],
        execute: function() {
            TraceWorker = (function () {
                function TraceWorker() {
                    this.iterations = 1;
                    var self = this;
                    addEventListener('message', function (e) {
                        if (self.command == null) {
                            self.command = e.data;
                        }
                        else if (self.command == TraceWorker.INIT) {
                            TraceWorker.id = e.data.id;
                            self.command = null;
                            self.pixelMemory = new Uint8ClampedArray(e.data.pixelBuffer);
                            self.sceneMemory = new DirectMemory_1.DirectMemory(e.data.sceneBuffer);
                            if (!self.camera) {
                                self.camera = Camera_1.Camera.fromJson(e.data.camera);
                            }
                            if (!self.scene) {
                                self.scene = SharedScene_1.SharedScene.getScene(self.sceneMemory);
                            }
                            self.full_width = e.data.full_width;
                            self.full_height = e.data.full_height;
                            self.cameraSamples = e.data.cameraSamples;
                            self.hitSamples = e.data.hitSamples;
                            self.bounces = e.data.bounces;
                            self.init(e.data.width, e.data.height, e.data.xoffset, e.data.yoffset);
                            console.info("WOKER_INIT:" + TraceWorker.id);
                            postMessage(TraceWorker.INITED);
                        }
                        else if (self.command == TraceWorker.TRACE) {
                            self.command = null;
                            self.run();
                            postMessage(TraceWorker.TRACED);
                        }
                    }, false);
                }
                TraceWorker.prototype.init = function (width, height, xoffset, yoffset) {
                    this.width = width;
                    this.height = height;
                    this.xoffset = xoffset;
                    this.yoffset = yoffset;
                    this.samples = [];
                    this.absCameraSamples = Math.round(Math.abs(this.cameraSamples));
                };
                TraceWorker.prototype.run = function () {
                    for (var y = this.yoffset; y < this.yoffset + this.width; y++) {
                        for (var x = this.xoffset; x < this.xoffset + this.width; x++) {
                            var _x = x - this.xoffset;
                            var _y = y - this.yoffset;
                            var c = new Color_1.Color();
                            if (this.cameraSamples <= 0) {
                                for (var i = 0; i < this.absCameraSamples; i++) {
                                    var fu = Math.random();
                                    var fv = Math.random();
                                    var ray = this.camera.castRay(x, y, this.full_width, this.full_height, fu, fv);
                                    c = c.add(this.scene.sample(ray, true, this.hitSamples, this.bounces));
                                }
                                c = c.divScalar(this.absCameraSamples);
                            }
                            else {
                                var n = Math.round(Math.sqrt(this.cameraSamples));
                                for (var u = 0; u < n; u++) {
                                    for (var v = 0; v < n; v++) {
                                        var fu = (u + 0.5) / n;
                                        var fv = (v + 0.5) / n;
                                        var ray = this.camera.castRay(x, y, this.full_width, this.full_height, fu, fv);
                                        c = c.add(this.scene.sample(ray, true, this.hitSamples, this.bounces));
                                    }
                                }
                                c = c.divScalar(n * n);
                            }
                            c = c.pow(1 / 2.2);
                            var ci = (_y * this.width) + _x;
                            if (!this.samples[ci]) {
                                this.samples[ci] = c;
                            }
                            else {
                                this.samples[ci] = this.samples[ci].add(c);
                            }
                            var avg_rgba = this.samples[ci].divScalar(this.iterations).RGBA();
                            var screen_index = (y * (this.full_width * 3)) + (x * 3);
                            this.drawColor(screen_index, avg_rgba);
                            if (Renderer_1.Renderer.DEBUG && x == this.xoffset || Renderer_1.Renderer.DEBUG && y == this.yoffset) {
                                this.drawPixelInt(screen_index, 0xFFFF00F);
                            }
                        }
                    }
                    this.iterations++;
                };
                TraceWorker.prototype.drawColor = function (i, rgba) {
                    this.pixelMemory[i] = rgba.r;
                    this.pixelMemory[i + 1] = rgba.g;
                    this.pixelMemory[i + 2] = rgba.b;
                };
                TraceWorker.prototype.drawPixelInt = function (i, color) {
                    var red = (color >> 16) & 255;
                    var green = (color >> 8) & 255;
                    var blue = color & 255;
                    this.pixelMemory[i] = red;
                    this.pixelMemory[i + 1] = green;
                    this.pixelMemory[i + 2] = blue;
                };
                TraceWorker.INIT = "INIT";
                TraceWorker.INITED = "INITED";
                TraceWorker.TRACE = "TRACE";
                TraceWorker.TRACED = "TRACED";
                return TraceWorker;
            })();
            exports_1("TraceWorker", TraceWorker);
            new TraceWorker();
        }
    }
});
//# sourceMappingURL=TraceWorker.js.map