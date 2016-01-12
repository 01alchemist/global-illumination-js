/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export abstract class CanvasDisplay {

    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    imageData:ImageData;
    data:Uint8ClampedArray;
    i_width:number;
    i_height:number;

    abstract onInit();

    constructor(public width:number = 1280, public height:number = 720) {
        var self = this;
        this.canvas = <HTMLCanvasElement>document.getElementById("viewport");
        if(this.canvas){
            self.init.call(self);
        }
        window.onload = function(){
            self.init.call(self);
        }
    }

    init() {
        console.info("init");
        this.canvas = <HTMLCanvasElement>document.getElementById("viewport");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        //document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.drawTest();
        if(this.onInit){
            this.onInit();
        }
    }

    drawPixels(pixels:Uint8ClampedArray, rect:{x:number,y:number,width:number,height:number}):void {
        this.i_width = rect.width;
        this.i_height = rect.height;
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
    }

    updatePixels(pixels:Uint8ClampedArray):void {

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
    }

    drawTest():void {
        var imageData:ImageData = this.ctx.createImageData(50, 50);
        var data:Uint8ClampedArray = imageData.data;

        for (var y = 0; y < 50; y++) {
            for (var x = 0; x < 50; x++) {
                var i:number = y * (50 * 4) + (x * 4);
                data[i] = 255;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = 255;
            }
        }
        this.ctx.putImageData(imageData, 0, 0);
    }
}
