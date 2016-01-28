import {RGBSpace} from "./RGBSpace";
import {ImageLoader} from "../data/ImageLoader";
import {BufferedImage} from "./BufferedImage";
import {Color} from "../math/Color";
import {ByteArrayBase} from "../../pointer/ByteArrayBase";
import {BrowserPlatform} from "../../utils/BrowserPlatform";
import {IBitmap} from "./IBitmap";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Bitmap {

    private pixels:Int32Array;
    private width:number;
    private height:number;
    private isHDR:boolean;

    constructor(w:int = 0, h:int = 0, isHDR:boolean = false) {
        this.width = w;
        this.height = h;
        this.isHDR = isHDR;
        if (w * h != 0) {
            this.pixels = new Int32Array(w * h);
        }
    }

    load(filename:string, isLinear:boolean):Promise {

        var self = this;
        return new Promise(function(resolve, reject){
            ImageLoader.load(filename, isLinear).then(function (image:IBitmap) {
                self.pixels = image.pixels;
                self.width = image.width;
                self.height = image.height;
                self.isHDR = image.isHDR;
                resolve(self);
            }).catch(function(error){
                reject(error);
            })
        });
    }

    static save(image, filename:string) {
        var b:Bitmap = new Bitmap(image.width, image.height, false);
        for (var y:int = 0; y < b.height; y++) {
            for (var x:int = 0; x < b.width; x++) {
                b.pixels[((b.height - 1 - y) * b.width) + x] = image.getRGB(x, y);
            }
        }
        if (filename.endsWith(".tga")) {
            b.saveTGA(filename);
        } else {
            b.savePNG(filename);
        }
    }

    setPixel(x:int, y:int, c:Color) {
        if ((x >= 0) && (x < this.width) && (y >= 0) && (y < this.height)) {
            this.pixels[(y * this.width) + x] = this.isHDR ? c.toRGBE() : c.clone().toNonLinear().toRGB();
        }
    }

    getPixel(x:int, y:int):Color {
        if ((x >= 0) && (x < this.width) && (y >= 0) && (y < this.height)) {
            return this.isHDR ? new Color().setRGBE(this.pixels[(y * this.width) + x]) : new Color(this.pixels[(y * this.width) + x]);
        }
        return Color.BLACK;
    }

    public save(filename:string) {
        if (filename.endsWith(".hdr"))
            this.saveHDR(filename);
        else if (filename.endsWith(".png"))
            this.savePNG(filename);
        else if (filename.endsWith(".tga"))
            this.saveTGA(filename);
        else
            this.saveHDR(filename + ".hdr");
    }

    private savePNG(filename):void {
        var bi:BufferedImage = new BufferedImage(this.width, this.height);
        for (var y:int = 0; y < this.height; y++) {
            for (var x:int = 0; x < this.width; x++) {
                bi.setRGB(x, this.height - 1 - y, this.isHDR ? this.getPixel(x, y).toRGB() : this.pixels[(y * this.width) + x]);
            }
        }
        try {
        } catch (e) {
            console.log(e);
        }
    }

    private saveHDR(fileName:string):void {
        try {
            var hdrHeader:string = "#?RGBE\n";
            hdrHeader += "FORMAT=32-bit_rle_rgbe\n\n";
            hdrHeader += "-Y " + this.height + " +X " + this.width + "\n";

            var hdrFile:ByteArrayBase = new ByteArrayBase(new ArrayBuffer(hdrHeader.length + (this.width * this.height * 4)));
            hdrFile.writeUTFBytes(hdrHeader);
            for (var y:int = this.height - 1; y >= 0; y--) {
                for (var x:int = 0; x < this.width; x++) {
                    var rgbe:int = this.isHDR ? this.pixels[(y * this.width) + x] : Color.toRGBE(this.pixels[(y * this.width) + x]);
                    hdrFile.writeByte(rgbe >> 24);
                    hdrFile.writeByte(rgbe >> 16);
                    hdrFile.writeByte(rgbe >> 8);
                    hdrFile.writeByte(rgbe);
                }
            }
            BrowserPlatform.saveFile(fileName, hdrFile.getArray());
        } catch (e) {
            console.error(e);
        }
    }

    private saveTGA(fileName:string):void {
        try {
            // no id, no colormap, uncompressed 3bpp RGB
            var tgaHeader:Uint8Array = new Uint8Array([0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            var tgaFile:ByteArrayBase = new ByteArrayBase(new ArrayBuffer(tgaHeader.length + 6 + (this.width * this.height * 4)));
            tgaFile.writeUint8Array(tgaHeader);
            // then the size info
            tgaFile.writeByte(this.width & 0xFF);
            tgaFile.writeByte((this.width >> 8) & 0xFF);
            tgaFile.writeByte(this.height & 0xFF);
            tgaFile.writeByte((this.height >> 8) & 0xFF);
            // bitsperpixel and filler
            tgaFile.writeByte(32);
            tgaFile.writeByte(0);
            // image data
            for (var y:int = 0; y < this.height; y++) {
                for (var x:int = 0; x < this.width; x++) {
                    var pix:int = this.isHDR ? this.getPixel(x, y).toRGB() : this.pixels[y * this.width + x];
                    tgaFile.writeByte(pix & 0xFF);
                    tgaFile.writeByte((pix >> 8) & 0xFF);
                    tgaFile.writeByte((pix >> 16) & 0xFF);
                    tgaFile.writeByte(0xFF);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
}