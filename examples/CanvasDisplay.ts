import {GUI} from "./GUI";
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export abstract class CanvasDisplay extends GUI {

    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    imageData:ImageData;
    data:Uint8ClampedArray|number[];
    i_width:number;
    i_height:number;
    info;
    time:number = 0;
    totalTime:number = 0;
    delta:number = 0;
    iterations:number = 0;

    abstract onInit();

    constructor(public width:number = 2560, public height:number = 1440) {
        super();
        var self = this;
        this.canvas = <HTMLCanvasElement>document.getElementById("viewport");
        if (this.canvas) {
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

            this.canvas.width = 640;
            this.canvas.height = 480;

            document.body.appendChild(this.canvas);

            this.ctx = this.canvas.getContext("2d");
            if (this.onInit) {
                this.onInit();
            }
        }
    }

    drawPixels(pixels:Uint8ClampedArray, rect:{x:number,y:number,width:number,height:number}):void {
        this.i_width = rect.width;
        this.i_height = rect.height;
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.imageData = this.ctx.getImageData(rect.x, rect.y, rect.width, rect.height);
        this.data = this.imageData.data;
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
        this.info.innerHTML = "Initializing workers...";
    }

    updatePixels(pixels:Uint8ClampedArray, iterations:number):void {

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


        if (this.iterations < iterations) {
            var _time = this.time;
            this.time = performance.now();
            this.delta = Math.round(this.time - _time) / 1000;
            this.totalTime += this.delta;
            this.iterations = iterations;
        }
        this.info.innerHTML = "Iterations:" + iterations + ", time/iteration:" + this.delta + " sec, total time:" + this.totalTime.toFixed(2) + " sec";
    }
}
