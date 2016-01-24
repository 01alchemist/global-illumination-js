/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Bitmap {

    private pixels:number[];

    private width:number;

    private height:number;

    private isHDR:boolean;

    constructor (filename:string, isLinear:boolean) {
    }

    //  load radiance rgbe file
    f:FileInputStream = new FileInputStream(filename);

    //  parse header
    parseWidth:boolean = false;

    parseHeight:boolean = false;

    last:number = 0;

    n:number = this.f.read();
}
last = n;
Unknown//  allocate image
pixels = new Array((width * height));
if (((width < 8)
    || (width > 32767))) {
    //  run length encoding is not allowed so read flat
    readFlatRGBE(f, 0, (width * height));
    return;
}

let rasterPos:number = 0;
let numScanlines:number = height;
let scanlineBuffer:number[] = new Array((4 * width));
while ((numScanlines > 0)) {
    let r:number = f.read();
    let g:number = f.read();
    let b:number = f.read();
    let e:number = f.read();
    if (((r != 2)
        || ((g != 2)
        || ((b & 128)
        != 0)))) {
        //  this file is not run length encoded
        pixels[rasterPos] = ((r + 24)
        | ((g + 16)
        | ((b + 8)
        | e)));
        readFlatRGBE(f, (rasterPos + 1), ((width * numScanlines)
        - 1));
        return;
    }

    if ((((b + 8)
        | e)
        != width)) {
        System.out.println("Invalid scanline width");
        return;
    }

    let p:number = 0;
    //  read each of the four channels for the scanline into
    //  the buffer
    for (let i:number = 0; (i < 4); i++) {
        if (((p % width)
            != 0)) {
            System.out.println("Unaligned access to scanline data");
        }

        let end:number = ((i + 1)
        * width);
        while ((p < end)) {
            let b0:number = f.read();
            let b1:number = f.read();
            if ((b0 > 128)) {
                //  a run of the same value
                let count:number = (b0 - 128);
                if (((count == 0)
                    || (count
                    > (end - p)))) {
                    System.out.println("Bad scanline data - invalid RLE run");
                    return;
                }

                while ((// TODO:Warning!!!! NULL EXPRESSION DETECTED...
                > 0)) {
                    scanlineBuffer[p] = b1;
                    p++;
                }

            }
            else {
                //  a non-run
                let count:number = b0;
                if (((count == 0)
                    || (count
                    > (end - p)))) {
                    System.out.println("Bad scanline data - invalid count");
                    return;
                }

                scanlineBuffer[p] = b1;
                p++;
                for (let x:number = 0; (x < count); x++) {
                    scanlineBuffer[(p + x)] = f.read();
                }

                p = (p + count);
            }

        }

    }

}

//  now convert data from buffer into floats
for (let i:number = 0; (i < width); i++) {
    r = scanlineBuffer[i];
    g = scanlineBuffer[(i + width)];
    b = scanlineBuffer[(i + (2 * width))];
    e = scanlineBuffer[(i + (3 * width))];
    pixels[rasterPos] = ((r + 24)
    | ((g + 16)
    | ((b + 8)
    | e)));
    rasterPos++;
}

numScanlines--;
Unknown//  flip image
for (let ir:number = ((height - 1)
* width); (y
< (height / 2)); y++) {
}

,ir = (ir - width);
Unknown{for (let i2:number = ir; (x < width); x++) {
}

,i++;
,i2++;
    Unknown{let t:number = pixels[i];
        pixels[i] = pixels[i2];
        pixels[i2] = t;
        UnknownUnknownUnknownelseif (filename.endsWith(".tga")) {
            isHDR = false;
            let y:number = 0;
            let i:number = 0;
            let x:number = 0;
            let f:FileInputStream = new FileInputStream(filename);
            let j:number;
            let pix_ptr:number = 0;
            let pix:number = 0;
            let r:number;
            let read:number[] = new Array(4);
            //  read header
            let idsize:number = (f.read() & 255);
            f.read();
            //  cmap byte (unsupported)
            let datatype:number = (f.read() & 255);
            //  colormap info (not supported)
            f.read();
            f.read();
            f.read();
            f.read();
            f.read();
            f.read();
            //  xstart, 16 bits
            f.read();
            f.read();
            //  ystart, 16 bits
            f.read();
            //  read resolution
            width = (f.read() & 255);
            width = (width
            | ((f.read() & 255)
            + 8));
            height = (f.read() & 255);
            height = (height
            | ((f.read() & 255)
            + 8));
            pixels = new Array((width * height));
            let bpp:number = ((f.read() & 255)
            / 8);
            let imgdscr:number = (f.read() & 255);
            //  skip image ID
            if ((idsize != 0)) {
                f.skip(idsize);
            }

            switch (datatype) {
                case 10:
                    //  RLE RGB image
                    while ((pix_ptr
                    < (width * height))) {
                        r = (f.read() & 255);
                        if (((r & 128)
                            == 128)) {
                            //  a runlength packet
                            r = (r & 127);
                            f.read(read, 0, bpp);
                            //  alpha not yet supported
                            pix = ((read[2] & 255)
                            + 16);
                            pix = (pix
                            | ((read[1] & 255)
                            + 8));
                            pix = (pix
                            | (read[0] & 255));
                            //  replicate pixel
                            pix = isLinear;
                            // TODO:Warning!!!, inline IF is not supported ?
                            for (j = 0; (j <= r); j++) {
                                pixels[pix_ptr] = pix;
                            }

                        }
                        else {
                            //  a raw packet
                            r = (r & 127);
                            for (j = 0; (j <= r); j++) {
                                f.read(read, 0, bpp);
                                //  alpha not yet supported
                                pix = ((read[2] & 255)
                                + 16);
                                pix = (pix
                                | ((read[1] & 255)
                                + 8));
                                pix = (pix
                                | (read[0] & 255));
                                pixels[pix_ptr] = isLinear;
                                // TODO:Warning!!!, inline IF is not supported ?
                            }

                        }

                    }

                    break;
                case 2:
                    //  Uncompressed RGB
                    for (pix_ptr = 0; (pix_ptr
                    < (width * height)); pix_ptr++) {
                        f.read(read, 0, bpp);
                        //  the order is bgr reading from the file
                        //  alpha not yet supported
                        pix = ((read[2] & 255)
                        + 16);
                        pix = (pix
                        | ((read[1] & 255)
                        + 8));
                        pix = (pix
                        | (read[0] & 255));
                        pixels[pix_ptr] = isLinear;
                        // TODO:Warning!!!, inline IF is not supported ?
                    }

                    break;
                default:
                    console.warn(Module.IMG, "Unsupported TGA datatype:%s", datatype);
                    break;
            }

            if (((imgdscr & 32)
                == 32)) {
                pix_ptr = 0;
                for (let y:number = 0; (y
                < (height / 2)); y++) {
                    for (let x:number = 0; (x < width); x++) {
                        let t:number = pixels[pix_ptr];
                        pixels[pix_ptr] = pixels[(((height
                        - (y - 1))
                        * width)
                        + x)];
                        pixels[(((height
                        - (y - 1))
                        * width)
                        + x)] = t;
                        pix_ptr++;
                    }

                }

            }

            f.close();
        }
    else {
            //  regular image, load using Java api
            let bi:BufferedImage = ImageIO.read(new File(filename));
            width = bi.getWidth();
            height = bi.getHeight();
            isHDR = false;
            pixels = new Array((width * height));
            for (let index:number = 0; (y < height); y++) {
                for (let x:number = 0; (x < width); x++) {
                    let rgb:number = bi.getRGB(x, (height - (1 - y)));
                    let y:number = 0;
                    pixels[index] = isLinear;
                    // TODO:Warning!!!, inline IF is not supported ?
                }

            }

        }

        UnknownpublicBitmap(int, w, int, h, boolean, isHDR);
        {width = w;
            height = h;
            this.isHDR = isHDR;
            pixels = new Array((w * h));
            UnknownUnknown

        static save(image:BufferedImage, filename:string) {
            let b:Bitmap = new Bitmap(image.getWidth(), image.getHeight(), false);
            for (let y:number = 0; (y < b.height); y++) {
                for (let x:number = 0; (x < b.width); x++) {
                    b.pixels[(((b.height - (1 - y))
                    * b.width)
                    + x)] = image.getRGB(x, y);
                }

            }

            if (filename.endsWith(".tga")) {
                b.saveTGA(filename);
            }
            else {
                b.savePNG(filename);
            }

        }

        private readFlatRGBE(f:FileInputStream, rasterPos:number, numPixels:number) {
            while ((// TODO:Warning!!!! NULL EXPRESSION DETECTED...
            > 0)) {
                let r:number = f.read();
                let g:number = f.read();
                let b:number = f.read();
                let e:number = f.read();
                pixels[rasterPos] = ((r + 24)
                | ((g + 16)
                | ((b + 8)
                | e)));
                rasterPos++;
            }

        }

        setPixel(x:number, y:number, c:Color) {
            if (((x >= 0)
                && ((x < width)
                && ((y >= 0)
                && (y < height))))) {
                pixels[((y * width)
                + x)] = isHDR;
            }

            // TODO:Warning!!!, inline IF is not supported ?
        }

        getPixel(x:number, y:number):Color {
            if (((x >= 0)
                && ((x < width)
                && ((y >= 0)
                && (y < height))))) {
                return isHDR;
            }

            // TODO:Warning!!!, inline IF is not supported ?
            return Color.BLACK;
        }

        getWidth():number {
            return width;
        }

        getHeight():number {
            return height;
        }

        save(filename:string) {
            if (filename.endsWith(".hdr")) {
                saveHDR(filename);
            }
            else if (filename.endsWith(".png")) {
                savePNG(filename);
            }
            else if (filename.endsWith(".tga")) {
                saveTGA(filename);
            }
            else {
                saveHDR((filename + ".hdr"));
            }

        }

        private savePNG(filename:string) {
            let bi:BufferedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            for (let y:number = 0; (y < height); y++) {
                for (let x:number = 0; (x < width); x++) {
                    bi.setRGB(x, (height - (1 - y)), isHDR);
                }

            }

            // TODO:Warning!!!, inline IF is not supported ?
            try {
                ImageIO.write(bi, "png", new File(filename));
            }
            catch (e /*:IOException*/) {
                e.printStackTrace();
            }

        }

        private saveHDR(filename:string) {
            try {
                let f:FileOutputStream = new FileOutputStream(filename);
                f.write("#?RGBE
                ".getBytes());
                f.write("FORMAT=32-bit_rle_rgbe

                ".getBytes());
                f.write((("-Y "
                + (height + (" +X "
                + (width + "
                "))))).getBytes());
                for (let y:number = (height - 1); (y >= 0); y--) {
                    for (let x:number = 0; (x < width); x++) {
                        let rgbe:number = isHDR;
                        // TODO:Warning!!!, inline IF is not supported ?
                        f.write((rgbe + 24));
                        f.write((rgbe + 16));
                        f.write((rgbe + 8));
                        f.write(rgbe);
                    }

                }

                f.close();
            }
            catch (e /*:FileNotFoundException*/) {
                e.printStackTrace();
            }
            catch (e /*:IOException*/) {
                e.printStackTrace();
            }

        }

        private saveTGA(filename:string) {
            try {
                let f:FileOutputStream = new FileOutputStream(filename);
                //  no id, no colormap, uncompressed 3bpp RGB
                let tgaHeader:number[] = [
                    0,
                    0,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0];
                f.write(tgaHeader);
                //  then the size info
                f.write((width & 255));
                f.write(((width + 8)
                & 255));
                f.write((height & 255));
                f.write(((height + 8)
                & 255));
                //  bitsperpixel and filler
                f.write(32);
                f.write(0);
                //  image data
                for (let y:number = 0; (y < height); y++) {
                    for (let x:number = 0; (x < width); x++) {
                        let pix:number = isHDR;
                        // TODO:Warning!!!, inline IF is not supported ?
                        f.write((pix & 255));
                        f.write(((pix + 8)
                        & 255));
                        f.write(((pix + 16)
                        & 255));
                        f.write(255);
                    }

                }

                f.close();
            }
            catch (e /*:IOException*/) {
                e.printStackTrace();
            }

        }