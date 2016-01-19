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
                function TraceJob(param) {
                    this.param = param;
                    this.id = param.id;
                    this.finished = false;
                    var self = this;
                    this.thread = new Thread_1.Thread("Worker: " + this.id);
                    this.thread.onInitComplete = function () {
                        self.finished = true;
                        if (self.onInit) {
                            self.onInit(self.id);
                        }
                    };
                    this.thread.onTraceComplete = function () {
                        self.finished = true;
                    };
                }
                TraceJob.prototype.init = function (onInit) {
                    this.onInit = onInit;
                    this.thread.sendCommand(TraceWorker_1.TraceWorker.INIT);
                    this.thread.sendData(this.param, [this.param.pixelBuffer, this.param.sceneBuffer]);
                };
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