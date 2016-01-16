System.register(["./TraceWorker", "./Thread"], function(exports_1) {
    var TraceWorker_1, Thread_1;
    var TraceJob;
    return {
        setters:[
            function (TraceWorker_1_1) {
                TraceWorker_1 = TraceWorker_1_1;
            },
            function (Thread_1_1) {
                Thread_1 = Thread_1_1;
            }],
        execute: function() {
            TraceJob = (function () {
                function TraceJob(pixelMemory, sceneMemory, kdTreeMemory, param) {
                    this.width = param.width;
                    this.height = param.height;
                    this.xoffset = param.xoffset;
                    this.yoffset = param.yoffset;
                    this.id = param.id;
                    this.finished = false;
                    var self = this;
                    this.thread = new Thread_1.Thread("Worker: " + this.id);
                    this.thread.onInitComplete = function () {
                        self.finished = true;
                    };
                    this.thread.onTraceComplete = function () {
                        self.finished = true;
                    };
                    this.thread.sendCommand(TraceWorker_1.TraceWorker.INIT);
                    this.thread.sendData({
                        id: this.id,
                        pixelMemory: pixelMemory.buffer,
                        sceneMemory: sceneMemory.buffer,
                        kdTreeMemory: kdTreeMemory,
                        camera: param.camera,
                        cameraSamples: param.cameraSamples,
                        hitSamples: param.hitSamples,
                        bounces: param.bounces,
                        full_width: param.full_width,
                        full_height: param.full_height,
                        width: param.width,
                        height: param.height,
                        xoffset: param.xoffset,
                        yoffset: param.yoffset
                    }, [pixelMemory.buffer, sceneMemory.buffer, kdTreeMemory]);
                }
                TraceJob.prototype.run = function (iterations) {
                    if (this.thread.initialized && !this.thread.isTracing) {
                        this.finished = false;
                        this.thread.trace();
                        this.thread.sendData({
                            iterations: iterations
                        });
                    }
                };
                return TraceJob;
            })();
            exports_1("TraceJob", TraceJob);
        }
    }
});
//# sourceMappingURL=TraceJob.js.map