import {ByteArrayBase} from "../../../pointer/ByteArrayBase";
import {IBitmap} from "../../image/IBitmap";
import {RGBSpace} from "../../image/RGBSpace";
/**
 * Created by Nidin Vinayakan on 27/1/2016.
 */
export function TGAPipe(isLinear?:boolean) {

    return function (response:Response) {
        return new Promise(function (resolve, reject) {
            response.arrayBuffer().then(function (data) {
                try {
                    resolve(TGAParser.parse(data, isLinear));
                } catch (e) {
                    reject(e);
                }
            });
        });
    };
}
export class TGAParser {

    static parse(buffer:ArrayBuffer, isLinear:boolean = false, offset:int = 0, length:int = 0):IBitmap {
        var data:ByteArrayBase = new ByteArrayBase(buffer, offset, length == 0 ? buffer.byteLength : length);
        var pix_ptr:int = 0;
        var pix:int = 0;
        var r:int;
        var j:int;
        var read:Uint8Array = new Uint8Array(4);

        // read header
        var idsize:int = data.readByte() & 0xFF;
        data.readByte(); // cmap byte (unsupported)
        var datatype:int = data.readByte() & 0xFF;

        // colormap info (not supported)
        data.readByte();
        data.readByte();
        data.readByte();
        data.readByte();
        data.readByte();

        data.readByte(); // xstart, 16 bits
        data.readByte();
        data.readByte(); // ystart, 16 bits
        data.readByte();

        // read resolution
        var width = (data.readByte() & 0xFF);
        width |= ((data.readByte() & 0xFF) << 8);
        var height = (data.readByte() & 0xFF);
        height |= ((data.readByte() & 0xFF) << 8);

        var pixels = new Int32Array(width * height);

        var bpp:int = (data.readByte() & 0xFF) / 8;

        var imgdscr:int = data.readByte() & 0xFF;

        // skip image ID
        if (idsize != 0) {
            data.position += idsize;
        }

        switch (datatype) {
            case 10:
                // RLE RGB image
                while (pix_ptr < (width * height)) {
                    r = (data.readByte() & 0xFF);
                    if ((r & 128) == 128) {
                        // a runlength packet
                        r &= 127;
                        data.read(read, 0, bpp);
                        // alpha not yet supported
                        pix = (read[2] & 0xFF) << 16;
                        pix |= (read[1] & 0xFF) << 8;
                        pix |= (read[0] & 0xFF);
                        // replicate pixel
                        pix = isLinear ? pix : RGBSpace.SRGB.rgbToLinear(pix);
                        for (j = 0; j <= r; j++, pix_ptr++)
                            pixels[pix_ptr] = pix;
                    } else {
                        // a raw packet
                        r &= 127;
                        for (j = 0; j <= r; j++, pix_ptr++) {
                            data.read(read, 0, bpp);
                            // alpha not yet supported
                            pix = ((read[2] & 0xFF) << 16);
                            pix |= ((read[1] & 0xFF) << 8);
                            pix |= ((read[0] & 0xFF));
                            pixels[pix_ptr] = isLinear ? pix : RGBSpace.SRGB.rgbToLinear(pix);
                        }
                    }
                }
                break;
            case 2:
                // Uncompressed RGB
                for (pix_ptr = 0; pix_ptr < (width * height); pix_ptr++) {
                    data.read(read, 0, bpp);
                    // the order is bgr reading from the file
                    // alpha not yet supported
                    pix = ((read[2] & 0xFF) << 16);
                    pix |= ((read[1] & 0xFF) << 8);
                    pix |= ((read[0] & 0xFF));
                    pixels[pix_ptr] = isLinear ? pix : RGBSpace.SRGB.rgbToLinear(pix);
                }
                break;
            default:
                console.log("Unsupported TGA datatype: " + datatype);
                break;
        }
        if ((imgdscr & 32) == 32) {
            pix_ptr = 0;
            for (var y:int = 0; y < (height / 2); y++) {
                for (var x:int = 0; x < width; x++) {
                    var t:int = pixels[pix_ptr];
                    pixels[pix_ptr] = pixels[(height - y - 1) * width + x];
                    pixels[(height - y - 1) * width + x] = t;
                    pix_ptr++;
                }
            }
        }

        return <IBitmap>{width: width, height: height, pixels: pixels, isHDR: false};
    }
}