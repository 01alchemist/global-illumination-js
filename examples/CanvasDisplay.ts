import {GUI} from "./GUI";
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export abstract class CanvasDisplay extends GUI {

    viewport:HTMLElement;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    imageData:ImageData;
    data:Uint8ClampedArray|number[];
    time:number = 0;
    totalTime:number = 0;
    delta:number = 0;
    iterations:number = 0;

    constructor(public i_width:number = 640, public i_height:number = 480) {
        super();
        var self = this;
        this.viewport = document.getElementById("viewport");
        if (this.viewport) {
            self.init.call(self);
            return;
        }
        window.onload = function () {
            self.init.call(self);
        }
    }

    init() {
        super.init();
        //<canvas id="viewport" width="640" height="480" ></canvas>
        //this.canvas = <HTMLCanvasElement>document.getElementById("viewport");
        if (this.isSupported) {

            console.log("isSupported:" + this.isSupported);

            this.canvas = <HTMLCanvasElement>document.createElement("canvas");
            this.canvas.id = "viewport";
            this.canvas.style.left = "10px";
            this.canvas.style.top = "50px";
            this.canvas.style.backgroundColor = "#3C3C3C";
            this.canvas.style.position = "absolute";

            this.canvas.width = this.i_width;
            this.canvas.height = this.i_height;

            this.viewport.appendChild(this.canvas);


            this.ctx = this.canvas.getContext("2d");

            this.imageData = this.ctx.getImageData(0, 0, this.i_width, this.i_height);
            this.data = this.imageData.data;

        }
    }

    drawPixels(pixels:Uint8ClampedArray, rect:{x:number,y:number,width:number,height:number}):void {
        this.i_width = rect.width;
        this.i_height = rect.height;
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        for (var y = 0; y < rect.height; y++) {
            for (var x = 0; x < rect.width; x++) {
                var i:number = y * (rect.width * 4) + (x * 4);
                var pi:number = y * (rect.width * 3) + (x * 3);
                this.data[i] = pixels[pi];
                this.data[i + 1] = pixels[pi + 1];
                this.data[i + 2] = pixels[pi + 2];
                this.data[i + 3] = 255;
            }
        }
        this.ctx.putImageData(this.imageData, 0, 0);
        this.iterations = 0;
        this.time = performance.now();
        //this.info.innerHTML = "Initializing workers...";
    }

    updatePixels(pixels:Uint8ClampedArray, iterations?:number):void {

        for (var y = 0; y < this.i_height; y++) {
            for (var x = 0; x < this.i_width; x++) {
                var i:number = y * (this.i_width * 4) + (x * 4);
                var pi:number = y * (this.i_width * 3) + (x * 3);
                this.data[i] = pixels[pi];
                this.data[i + 1] = pixels[pi + 1];
                this.data[i + 2] = pixels[pi + 2];
                this.data[i + 3] = 255;
            }
        }
        this.ctx.putImageData(this.imageData, 0, 0);


        /*if (this.iterations < iterations) {
            var _time = this.time;
            this.time = performance.now();
            this.delta = Math.round(this.time - _time) / 1000;
            this.totalTime += this.delta;
            this.iterations = iterations;
        }*/
        //this.info.innerHTML = "Iterations:" + iterations + ", time/iteration:" + this.delta + " sec, total time:" + this.totalTime.toFixed(2) + " sec";
    }

    updatePixelsRect(rect, pixels:Uint8ClampedArray):void {

        for (var y = rect.yoffset; y < rect.yoffset + rect.height; y++) {
            for (var x = rect.xoffset; x < rect.xoffset + rect.width; x++) {

                var i:number = y * (this.i_width * 4) + (x * 4);
                var pi:number = y * (this.i_width * 3) + (x * 3);
                this.data[i] = pixels[pi];
                this.data[i + 1] = pixels[pi + 1];
                this.data[i + 2] = pixels[pi + 2];
                this.data[i + 3] = 255;
            }
        }
        this.ctx.putImageData(this.imageData, 0, 0);


        /*if (this.iterations < iterations) {
            var _time = this.time;
            this.time = performance.now();
            this.delta = Math.round(this.time - _time) / 1000;
            this.totalTime += this.delta;
            this.iterations = iterations;
        }*/
        //this.info.innerHTML = "Iterations:" + iterations + ", time/iteration:" + this.delta + " sec, total time:" + this.totalTime.toFixed(2) + " sec";
    }
}
