System.register(["./TraceJob"], function(exports_1) {
    var TraceJob_1;
    var TraceWorkerManager;
    return {
        setters:[
            function (TraceJob_1_1) {
                TraceJob_1 = TraceJob_1_1;
            }],
        execute: function() {
            TraceWorkerManager = (function () {
                function TraceWorkerManager() {
                    this.propertySize = 512;
                    this.iterations = 0;
                }
                TraceWorkerManager.prototype.configure = function (param) {
                    console.log("configure");
                    var width = param.width;
                    var height = param.height;
                    this.pixelMemory = new Uint8ClampedArray(new SharedArrayBuffer(width * height * 3));
                    this.jobs = [];
                    var num_threads = param.num_threads;
                    if (num_threads <= 0) {
                        num_threads = navigator["hardwareConcurrency"] || 2;
                    }
                    num_threads = num_threads > 2 ? 2 : num_threads;
                    num_threads = 4;
                    console.info("hardwareConcurrency:" + num_threads);
                    this.jobs = [];
                    var thread_id = 0;
                    if (num_threads > 1) {
                        var _width = width / num_threads;
                        var _height = height / num_threads;
                        for (var j = 0; j < num_threads; j++) {
                            for (var i = 0; i < num_threads; i++) {
                                this.jobs.push(new TraceJob_1.TraceJob(this.pixelMemory, {
                                    scene: param.scene,
                                    camera: param.camera,
                                    cameraSamples: param.cameraSamples,
                                    hitSamples: param.hitSamples,
                                    bounces: param.bounces,
                                    full_width: width,
                                    full_height: height,
                                    width: _width,
                                    height: _height,
                                    xoffset: i * _width,
                                    yoffset: j * _height,
                                    id: ++thread_id
                                }));
                            }
                        }
                    }
                    else {
                        this.jobs.push(new TraceJob_1.TraceJob(this.pixelMemory, {
                            scene: param.scene,
                            camera: param.camera,
                            cameraSamples: param.cameraSamples,
                            hitSamples: param.hitSamples,
                            bounces: param.bounces,
                            full_width: width,
                            full_height: height,
                            width: width,
                            height: height,
                            xoffset: 0,
                            yoffset: 0,
                            id: 0
                        }));
                    }
                };
                Object.defineProperty(TraceWorkerManager.prototype, "numWorkers", {
                    get: function () {
                        return this.jobs.length;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(TraceWorkerManager.prototype, "pixels", {
                    get: function () {
                        return this.pixelMemory;
                    },
                    enumerable: true,
                    configurable: true
                });
                TraceWorkerManager.prototype.render = function () {
                    var self = this;
                    if (this.workersFinished()) {
                        this.jobs.forEach(function (w) {
                            w.run(++self.iterations);
                        });
                    }
                };
                TraceWorkerManager.prototype.workersFinished = function () {
                    var isAllFinished = true;
                    for (var i = 0; i < this.jobs.length; i++) {
                        if (!this.jobs[i].thread.initialized || !this.jobs[i].finished) {
                            isAllFinished = false;
                        }
                    }
                    return isAllFinished;
                };
                return TraceWorkerManager;
            })();
            exports_1("TraceWorkerManager", TraceWorkerManager);
        }
    }
});
//# sourceMappingURL=TraceWorkerManager.js.map