/**
 * Created by Nidin Vinayakan on 26/1/2016.
 */
export class HDRParser {

    constructor() {

    }
    parse(){
        // parse header
        var parseWidth:boolean = false;
        var parseHeight:boolean = false;
        this.width = this.height = 0;
        var last:int = 0;
        while (this.width == 0 || this.height == 0 || last != '\n') {
            var n:int = f.read();
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
                    parseWidth &= this.width == 0;
                    parseHeight &= this.height == 0;
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
                        this.height = 10 * this.height + (n - '0');
                    else if (parseWidth)
                        this.width = 10 * this.width + (n - '0');
                    break;
                default:
                    parseWidth = parseHeight = false;
                    break;
            }
            last = n;
        }
        // allocate image
        this.pixels = new Int32Array[this.width * this.height];
        if (this.width < 8 || this.width > 0x7fff) {
            // run length encoding is not allowed so read flat
            this.readFlatRGBE(f, 0, this.width * this.height);
            return;
        }
        int rasterPos = 0;
        int numScanlines = height;
        int[] scanlineBuffer = new int[4 * width];
        while (numScanlines > 0) {
            int r = f.read();
            int g = f.read();
            int b = f.read();
            int e = f.read();
            if ((r != 2) || (g != 2) || ((b & 0x80) != 0)) {
                // this file is not run length encoded
                pixels[rasterPos] = (r << 24) | (g << 16) | (b << 8) | e;
                readFlatRGBE(f, rasterPos + 1, width * numScanlines - 1);
                return;
            }

            if (((b << 8) | e) != width) {
                System.out.println("Invalid scanline width");
                return;
            }
            int p = 0;
            // read each of the four channels for the scanline into
            // the buffer
            for (int i = 0; i < 4; i++) {
                if (p % width != 0)
                    System.out.println("Unaligned access to scanline data");
                int end = (i + 1) * width;
                while (p < end) {
                    int b0 = f.read();
                    int b1 = f.read();
                    if (b0 > 128) {
                        // a run of the same value
                        int count = b0 - 128;
                        if ((count == 0) || (count > (end - p))) {
                            System.out.println("Bad scanline data - invalid RLE run");
                            return;
                        }
                        while (count-- > 0) {
                            scanlineBuffer[p] = b1;
                            p++;
                        }
                    } else {
                        // a non-run
                        int count = b0;
                        if ((count == 0) || (count > (end - p))) {
                            System.out.println("Bad scanline data - invalid count");
                            return;
                        }
                        scanlineBuffer[p] = b1;
                        p++;
                        if (--count > 0) {
                            for (int x = 0; x < count; x++)
                            scanlineBuffer[p + x] = f.read();
                            p += count;
                        }
                    }
                }
            }
            // now convert data from buffer into floats
            for (int i = 0; i < width; i++) {
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
        for (int y = 0, i = 0, ir = (height - 1) * width; y < height / 2; y++, ir -= width) {
            for (int x = 0, i2 = ir; x < width; x++, i++, i2++) {
                int t = pixels[i];
                pixels[i] = pixels[i2];
                pixels[i2] = t;
            }
        }
    }
}