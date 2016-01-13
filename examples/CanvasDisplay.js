System.register([], function(exports_1) {
    var CanvasDisplay;
    return {
        setters:[],
        execute: function() {
            CanvasDisplay = (function () {
                function CanvasDisplay(width, height) {
                    if (width === void 0) { width = 1280; }
                    if (height === void 0) { height = 720; }
                    this.width = width;
                    this.height = height;
                    this.time = 0;
                    this.delta = 0;
                    this.iterations = 0;
                    var self = this;
                    this.canvas = document.getElementById("viewport");
                    if (this.canvas) {
                        self.init.call(self);
                        return;
                    }
                    window.onload = function () {
                        self.init.call(self);
                    };
                }
                CanvasDisplay.prototype.init = function () {
                    console.info("init");
                    this.canvas = document.getElementById("viewport");
                    this.canvas.width = this.width;
                    this.canvas.height = this.height;
                    this.ctx = this.canvas.getContext("2d");
                    this.info = document.getElementById("info");
                    if (this.onInit) {
                        this.onInit();
                    }
                };
                CanvasDisplay.prototype.drawPixels = function (pixels, rect) {
                    this.i_width = rect.width;
                    this.i_height = rect.height;
                    this.imageData = this.ctx.getImageData(rect.x, rect.y, rect.width, rect.height);
                    this.data = this.imageData.data;
                    for (var y = 0; y < rect.height; y++) {
                        for (var x = 0; x < rect.width; x++) {
                            var i = y * (rect.width * 4) + (x * 4);
                            var pi = y * (rect.width * 3) + (x * 3);
                            this.data[i] = pixels[pi];
                            this.data[i + 1] = pixels[pi + 1];
                            this.data[i + 2] = pixels[pi + 2];
                            this.data[i + 3] = 255;
                        }
                    }
                    this.ctx.putImageData(this.imageData, 0, 0);
                    this.iterations = 0;
                    this.time = performance.now();
                    this.info.innerHTML = "Initializing workers...";
                };
                CanvasDisplay.prototype.updatePixels = function (pixels, iterations) {
                    for (var y = 0; y < this.i_height; y++) {
                        for (var x = 0; x < this.i_width; x++) {
                            var i = y * (this.i_width * 4) + (x * 4);
                            var pi = y * (this.i_width * 3) + (x * 3);
                            this.data[i] = pixels[pi];
                            this.data[i + 1] = pixels[pi + 1];
                            this.data[i + 2] = pixels[pi + 2];
                            this.data[i + 3] = 255;
                        }
                    }
                    this.ctx.putImageData(this.imageData, 0, 0);
                    if (this.iterations < iterations) {
                        var _time = this.time;
                        this.time = performance.now();
                        this.delta = Math.round(this.time - _time) / 1000;
                        this.iterations = iterations;
                    }
                    this.info.innerHTML = "Iterations:" + iterations + ", time:" + this.delta + " sec";
                };
                return CanvasDisplay;
            })();
            exports_1("CanvasDisplay", CanvasDisplay);
        }
    }
});
//# sourceMappingURL=CanvasDisplay.js.map