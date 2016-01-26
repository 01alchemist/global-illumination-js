/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Bitmap {

    private pixels:number[];
    private width:number;
    private height:number;
    private isHDR:boolean;

    constructor (filename:string, isLinear:boolean) {
        if (filename.endsWith(".hdr")) {
            this.isHDR = true;
            // load radiance rgbe file
            var f = new FileInputStream(filename);

        } else if (filename.endsWith(".tga")) {
            isHDR = false;
            FileInputStream f = new FileInputStream(filename);
            int pix_ptr = 0, pix = 0, r, j;
            byte[] read = new byte[4];

            // read header
            int idsize = f.read() & 0xFF;
            f.read(); // cmap byte (unsupported)
            int datatype = f.read() & 0xFF;

            // colormap info (not supported)
            f.read();
            f.read();
            f.read();
            f.read();
            f.read();

            f.read(); // xstart, 16 bits
            f.read();
            f.read(); // ystart, 16 bits
            f.read();

            // read resolution
            width = (f.read() & 0xFF);
            width |= ((f.read() & 0xFF) << 8);
            height = (f.read() & 0xFF);
            height |= ((f.read() & 0xFF) << 8);

            pixels = new int[width * height];

            int bpp = (f.read() & 0xFF) / 8;

            int imgdscr = (f.read() & 0xFF);

            // skip image ID
            if (idsize != 0)
                f.skip(idsize);

            switch (datatype) {
                case 10:
                    // RLE RGB image
                    while (pix_ptr < (width * height)) {
                        r = (f.read() & 0xFF);
                        if ((r & 128) == 128) {
                            // a runlength packet
                            r &= 127;
                            f.read(read, 0, bpp);
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
                                f.read(read, 0, bpp);
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
                        f.read(read, 0, bpp);
                        // the order is bgr reading from the file
                        // alpha not yet supported
                        pix = ((read[2] & 0xFF) << 16);
                        pix |= ((read[1] & 0xFF) << 8);
                        pix |= ((read[0] & 0xFF));
                        pixels[pix_ptr] = isLinear ? pix : RGBSpace.SRGB.rgbToLinear(pix);
                    }
                    break;
                default:
                    UI.printWarning(Module.IMG, "Unsupported TGA datatype: %s", datatype);
                    break;
            }
            if ((imgdscr & 32) == 32) {
                pix_ptr = 0;
                for (int y = 0; y < (height / 2); y++)
                for (int x = 0; x < width; x++) {
                    int t = pixels[pix_ptr];
                    pixels[pix_ptr] = pixels[(height - y - 1) * width + x];
                    pixels[(height - y - 1) * width + x] = t;
                    pix_ptr++;
                }

            }
            f.close();
        } else {
            // regular image, load using Java api
            BufferedImage bi = ImageIO.read(new File(filename));
            width = bi.getWidth();
            height = bi.getHeight();
            isHDR = false;
            pixels = new int[width * height];
            for (int y = 0, index = 0; y < height; y++) {
                for (int x = 0; x < width; x++, index++) {
                    int rgb = bi.getRGB(x, height - 1 - y);
                    pixels[index] = isLinear ? rgb : RGBSpace.SRGB.rgbToLinear(rgb);
                }
            }
        }
    }