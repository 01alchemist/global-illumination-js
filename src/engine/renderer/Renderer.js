System.register(["../math/Color", "./worker/TraceWorkerManager"], function(exports_1) {
    var Color_1, TraceWorkerManager_1;
    var Renderer;
    return {
        setters:[
            function (Color_1_1) {
                Color_1 = Color_1_1;
            },
            function (TraceWorkerManager_1_1) {
                TraceWorkerManager_1 = TraceWorkerManager_1_1;
            }],
        execute: function() {
            Renderer = (function () {
                function Renderer(userWorker) {
                    if (userWorker === void 0) { userWorker = false; }
                    this.userWorker = userWorker;
                    if (this.userWorker) {
                        this.workerManager = new TraceWorkerManager_1.TraceWorkerManager();
                    }
                }
                Object.defineProperty(Renderer.prototype, "iterations", {
                    get: function () {
                        return this.workerManager.iterations;
                    },
                    enumerable: true,
                    configurable: true
                });
                Renderer.prototype.initParallelRender = function (scene, camera, w, h, cameraSamples, hitSamples, bounces) {
                    if (!this.workerManager) {
                        this.workerManager = new TraceWorkerManager_1.TraceWorkerManager();
                    }
                    this.workerManager.configure({
                        camera: camera,
                        width: w,
                        height: h,
                        cameraSamples: cameraSamples,
                        hitSamples: hitSamples,
                        bounces: bounces
                    }, scene);
                    this.workerManager.init();
                    this.workerManager.render();
                    return this.workerManager.pixels;
                };
                Renderer.prototype.iterateParallel = function () {
                    this.workerManager.render();
                };
                Renderer.prototype.render = function (scene, camera, w, h, cameraSamples, hitSamples, bounces) {
                    var ncpu = navigator["hardwareConcurrency"] || 4;
                    scene.compile();
                    var result = [];
                    var pixels = new Uint8ClampedArray(w * h * 4);
                    var ch = [];
                    var absCameraSamples = Math.round(Math.abs(cameraSamples));
                    var start = performance.now();
                    console.time("render");
                    scene.rays = 0;
                    for (var i = 0; i < ncpu; i++) {
                        function go(i) {
                            for (var y = i; y < h; y += ncpu) {
                                for (var x = 0; x < w; x++) {
                                    var c = new Color_1.Color();
                                    if (cameraSamples <= 0) {
                                        for (var i_1 = 0; i_1 < absCameraSamples; i_1++) {
                                            var fu = Math.random();
                                            var fv = Math.random();
                                            var ray = camera.castRay(x, y, w, h, fu, fv);
                                            c = c.add(scene.sample(ray, true, hitSamples, bounces));
                                        }
                                        c = c.divScalar(absCameraSamples);
                                    }
                                    else {
                                        var n = Math.round(Math.sqrt(cameraSamples));
                                        for (var u = 0; u < n; u++) {
                                            for (var v = 0; v < n; v++) {
                                                var fu = (u + 0.5) / n;
                                                var fv = (v + 0.5) / n;
                                                var ray = camera.castRay(x, y, w, h, fu, fv);
                                                c = c.add(scene.sample(ray, true, hitSamples, bounces));
                                            }
                                        }
                                        c = c.divScalar(n * n);
                                    }
                                    c = c.pow(1 / 2.2);
                                    var rgba = c.RGBA();
                                    var color_index = (y * w) + x;
                                    var index = (y * (w * 4)) + (x * 4);
                                    result[color_index] = rgba;
                                    pixels[index] = rgba.r;
                                    pixels[index + 1] = rgba.g;
                                    pixels[index + 2] = rgba.b;
                                    pixels[index + 3] = rgba.a;
                                }
                            }
                            console.timeEnd("go");
                        }
                        go(i);
                    }
                    console.timeEnd("render");
                    return pixels;
                };
                Renderer.prototype.showProgress = function (start, rayCount) {
                };
                Renderer.prototype.iterativeRender = function (pathTemplate, iterations, scene, camera, w, h, cameraSamples, hitSamples, bounces) {
                    scene.compile();
                    var pixels = [];
                    var result = [];
                    for (var i = 1; i <= iterations; i++) {
                        var frame = this.render(scene, camera, w, h, cameraSamples, hitSamples, bounces);
                        for (var y = 0; y < h; y++) {
                            for (var x = 0; x < w; x++) {
                                var index = y * w + x;
                                var pi = y * (w * 4) + (x * 4);
                                var c = Color_1.Color.newColor({
                                    r: frame[pi],
                                    g: frame[pi + 1],
                                    b: frame[pi + 2],
                                    a: frame[pi + 3]
                                });
                                pixels[index] = pixels[index].add(c);
                                var avg = pixels[index].divScalar(i);
                                result[index] = avg.RGBA();
                            }
                        }
                    }
                    return null;
                };
                Renderer.DEBUG = false;
                Renderer.interval = 0;
                return Renderer;
            })();
            exports_1("Renderer", Renderer);
        }
    }
});
//# sourceMappingURL=Renderer.js.map