import {ByteArrayBase} from "../../../pointer/ByteArrayBase";
import {IBitmap} from "../../image/IBitmap";
/**
 * Created by Nidin Vinayakan on 26/1/2016.
 */
export function HDRPipe(isLinear?:boolean) {

    return function (response:Response) {
        return new Promise(function (resolve, reject) {
            response.arrayBuffer().then(function (data) {
                try{
                    resolve(HDRParser.parse(data));
                }catch (e){
                    reject(e);
                }
            });
        });
    };
}
export class HDRParser {

    static parse(buffer:ArrayBuffer, offset:int = 0, length:int = 0):IBitmap {
        var data:ByteArrayBase = new ByteArrayBase(buffer, offset, length == 0 ? buffer.byteLength : length);
        var pixels:Int32Array;
        // parse header
        var parseWidth:boolean = false;
        var parseHeight:boolean = false;
        var width = 0;
        var height = 0;
        var last:int = 0;

        console.log(data.readLine());
        console.log(data.readLine());
        console.log(data.readLine());
        console.log(data.readLine());
        console.log(data.readLine());
        var dimension:string[] = data.readLine().split(" ");
        if (dimension[0] === "-Y") {
            height = parseInt(dimension[1]);
            width = parseInt(dimension[3]);
        } else if (dimension[0] === "+X") {
            width = parseInt(dimension[1]);
            height = parseInt(dimension[3]);
        }
        console.log(width + " x " + height);
        /*while (width == 0 || height == 0 || last != '\n') {
         var n:string = String.fromCharCode(data.readByte());
         switch (n) {
         case 'Y':
         parseHeight = last == '-';
         parseWidth = false;
         break;
         case 'X':
         parseHeight = false;
         parseWidth = last == '+';
         break;
         case ' ':
         parseWidth &= width == 0;
         parseHeight &= height == 0;
         break;
         case '0':
         case '1':
         case '2':
         case '3':
         case '4':
         case '5':
         case '6':
         case '7':
         case '8':
         case '9':
         if (parseHeight)
         height = 10 * height + (n - '0');
         else if (parseWidth)
         width = 10 * width + (n - '0');
         break;
         default:
         parseWidth = parseHeight = false;
         break;
         }
         last = n;
         }*/
        // allocate image
        pixels = new Int32Array[width * height];
        if (width < 8 || width > 0x7fff) {
            // run length encoding is not allowed so read flat
            let numPixels:int = width * height;
            let rasterPos:int = 0;
            while (numPixels-- > 0) {
                var r:int = data.readByte();
                var g:int = data.readByte();
                var b:int = data.readByte();
                var e:int = data.readByte();
                pixels[rasterPos] = (r << 24) | (g << 16) | (b << 8) | e;
                rasterPos++;
            }

            return;
        }
        let rasterPos:int = 0;
        var numScanlines:int = height;
        var scanlineBuffer:Int32Array = new Int32Array(4 * width);
        while (numScanlines > 0) {
            var r:int = data.readByte();
            var g:int = data.readByte();
            var b:int = data.readByte();
            var e:int = data.readByte();
            if ((r != 2) || (g != 2) || ((b & 0x80) != 0)) {
                // this file is not run length encoded
                pixels[rasterPos] = (r << 24) | (g << 16) | (b << 8) | e;

                let numPixels:int = width * numScanlines - 1;
                let _rasterPos:int = rasterPos + 1;
                while (numPixels-- > 0) {
                    var r:int = data.readByte();
                    var g:int = data.readByte();
                    var b:int = data.readByte();
                    var e:int = data.readByte();
                    pixels[_rasterPos] = (r << 24) | (g << 16) | (b << 8) | e;
                    _rasterPos++;
                }

                return;
            }

            if (((b << 8) | e) != width) {
                console.log("Invalid scanline width");
                return;
            }
            var p:int = 0;
            // read each of the four channels for the scanline into
            // the buffer
            for (let i:int = 0; i < 4; i++) {
                if (p % width != 0)
                    console.log("Unaligned access to scanline data");
                var end:int = (i + 1) * width;
                while (p < end) {
                    var b0:int = data.readByte();
                    var b1:int = data.readByte();
                    if (b0 > 128) {
                        // a run of the same value
                        let count:int = b0 - 128;
                        if ((count == 0) || (count > (end - p))) {
                            console.log("Bad scanline data - invalid RLE run");
                            return;
                        }
                        while (count-- > 0) {
                            scanlineBuffer[p] = b1;
                            p++;
                        }
                    } else {
                        // a non-run
                        let count:int = b0;
                        if ((count == 0) || (count > (end - p))) {
                            console.log("Bad scanline data - invalid count");
                            return;
                        }
                        scanlineBuffer[p] = b1;
                        p++;
                        if (--count > 0) {
                            for (var x:int = 0; x < count; x++) {
                                scanlineBuffer[p + x] = data.readByte();
                            }
                            p += count;
                        }
                    }
                }
            }
            // now convert data from buffer into floats
            for (let i:int = 0; i < width; i++) {
                r = scanlineBuffer[i];
                g = scanlineBuffer[i + width];
                b = scanlineBuffer[i + 2 * width];
                e = scanlineBuffer[i + 3 * width];
                pixels[rasterPos] = (r << 24) | (g << 16) | (b << 8) | e;
                rasterPos++;
            }
            numScanlines--;
        }
        // flip image
        for (let y:int = 0, i = 0, ir = (height - 1) * width; y < height / 2; y++, ir -= width) {
            for (let x:int = 0, i2 = ir; x < width; x++, i++, i2++) {
                let t:int = pixels[i];
                pixels[i] = pixels[i2];
                pixels[i2] = t;
            }
        }

        return <IBitmap>{width: width, height: height, pixels: pixels, isHDR: true};
    }
}