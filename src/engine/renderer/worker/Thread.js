System.register(["./TraceWorker"], function(exports_1) {
    var TraceWorker_1;
    var Thread;
    return {
        setters:[
            function (TraceWorker_1_1) {
                TraceWorker_1 = TraceWorker_1_1;
            }],
        execute: function() {
            Thread = (function () {
                function Thread(name) {
                    this.instance = new Worker("../workerBootstrap.js");
                    var self = this;
                    this.instance.onmessage = function (event) {
                        if (event.data == TraceWorker_1.TraceWorker.INITED) {
                            self.initialized = true;
                            self.isTracing = false;
                            if (self.onInitComplete) {
                                self.onInitComplete();
                            }
                        }
                        if (event.data == TraceWorker_1.TraceWorker.TRACED) {
                            self.isTracing = false;
                            if (self.onTraceComplete) {
                                self.onTraceComplete();
                            }
                        }
                    };
                }
                Thread.prototype.trace = function () {
                    this.isTracing = true;
                    this.instance.postMessage(TraceWorker_1.TraceWorker.TRACE);
                };
                Thread.prototype.sendCommand = function (message) {
                    this.instance.postMessage(message);
                };
                Thread.prototype.sendData = function (data, buffers) {
                    this.instance.postMessage(data, buffers);
                };
                return Thread;
            })();
            exports_1("Thread", Thread);
        }
    }
});
//# sourceMappingURL=Thread.js.map