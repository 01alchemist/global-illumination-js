/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export abstract class CanvasDisplay {

    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    imageData:ImageData;
    data:Uint8ClampedArray|number[];
    i_width:number;
    i_height:number;
    info;
    time:number=0;
    totalTime:number=0;
    delta:number=0;
    iterations:number=0;

    abstract onInit();

    constructor(public width:number = 2560, public height:number = 1440) {
        var self = this;
        this.canvas = <HTMLCanvasElement>document.getElementById("viewport");
        if(this.canvas){
            self.init.call(self);
            return;
        }
        window.onload = function(){
            self.init.call(self);
        }
    }

    init() {
        console.info("init");
        this.canvas = <HTMLCanvasElement>document.getElementById("viewport");
        //this.canvas.width = this.width;
        //this.canvas.height = this.height;
        //document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.info = document.getElementById("info");

        if(!window["SharedArrayBuffer"]){
            this.info.innerHTML = "Oops! Your browser does not supported. If you want to try this app go and get Firefox Nightly 46 from <a href='https://nightly.mozilla.org/'>Here</a>";
            throw "Oops! Your browser does not supported. If you want to try this app go and get Firefox Nightly 46 https://nightly.mozilla.org";
        }

        if(this.onInit){
            this.onInit();
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



        if(this.iterations < iterations){
            var _time = this.time;
            this.time = performance.now();
            this.delta = Math.round(this.time - _time) / 1000;
            this.totalTime += this.delta;
            this.iterations = iterations;
        }
        this.info.innerHTML = "Iterations:"+ iterations +", time/iteration:" + this.delta +" sec, total time:"+this.totalTime.toFixed(2)+" sec";
    }
}
