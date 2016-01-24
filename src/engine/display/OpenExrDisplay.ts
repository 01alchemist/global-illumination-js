/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class OpenExrDisplay implements Display {

    private static HALF:number = 1;

    private static FLOAT:number = 2;

    private static HALF_SIZE:number = 2;

    private static FLOAT_SIZE:number = 4;

    private static OE_MAGIC:number = 20000630;

    private static OE_EXR_VERSION:number = 2;

    private static OE_TILED_FLAG:number = 512;

    private static NO_COMPRESSION:number = 0;

    private static RLE_COMPRESSION:number = 1;

    //  private static final int ZIPS_COMPRESSION = 2;
    private static ZIP_COMPRESSION:number = 3;

    //  private static final int PIZ_COMPRESSION = 4;
    //  private static final int PXR24_COMPRESSION = 5;
    private static RLE_MIN_RUN:number = 3;

    private static RLE_MAX_RUN:number = 127;

    private filename:string;

    private file:RandomAccessFile;

    private tileOffsets:number[,];

    private tileOffsetsPosition:number;

    private tilesX:number;

    private tilesY:number;

    private tileSize:number;

    private compression:number;

    private channelType:number;

    private channelSize:number;

    private tmpbuf:number[];

    private comprbuf:number[];

    constructor (filename:string, compression:string, channelType:string) {
        this.filename = (this.filename == null);
        // TODO:Warning!!!, inline IF is not supported ?
        // TODO:Warning!!!, inline IF is not supported ?
        if (((this.compression == null)
            || this.compression.equals("none"))) {
            this.compression = NO_COMPRESSION;
        }
        else if (this.compression.equals("rle")) {
            this.compression = RLE_COMPRESSION;
        }
        else if (this.compression.equals("zip")) {
            this.compression = ZIP_COMPRESSION;
        }
        else {
            console.warn(Module.DISP, "EXR - Compression type was not recognized - defaulting to zip");
            this.compression = ZIP_COMPRESSION;
        }

        if (((this.channelType != null)
            && this.channelType.equals("float"))) {
            this.channelType = FLOAT;
            this.channelSize = FLOAT_SIZE;
        }
        else if (((this.channelType != null)
            && this.channelType.equals("half"))) {
            this.channelType = HALF;
            this.channelSize = HALF_SIZE;
        }
        else {
            console.warn(Module.DISP, "EXR - Channel type was not recognized - defaulting to float");
            this.channelType = FLOAT;
            this.channelSize = FLOAT_SIZE;
        }

    }

    setGamma(gamma:number) {
        console.warn(Module.DISP, "EXR - Gamma correction unsupported - ignoring");
    }

    imageBegin(w:number, h:number, bucketSize:number) {
        try {
            this.file = new RandomAccessFile(this.filename, "rw");
            this.file.setLength(0);
            if ((bucketSize <= 0)) {
                throw new Exception("Can't use OpenEXR display without buckets.");
            }

            this.writeRGBHeader(w, h, bucketSize);
        }
        catch (e /*:Exception*/) {
            console.error(Module.DISP, "EXR - %s", e.getMessage());
            e.printStackTrace();
        }

    }

    imagePrepare(x:number, y:number, w:number, h:number, id:number) {

    }

    imageUpdate(x:number, y:number, w:number, h:number, data:Color[]) {
        try {
            //  figure out which openexr tile corresponds to this bucket
            let tx:number = (x / this.tileSize);
            let ty:number = (y / this.tileSize);
            this.writeTile(tx, ty, w, h, data);
        }
        catch (e /*:IOException*/) {
            console.error(Module.DISP, "EXR - %s", e.getMessage());
            e.printStackTrace();
        }

    }

    imageFill(x:number, y:number, w:number, h:number, c:Color) {

    }

    imageEnd() {
        try {
            this.writeTileOffsets();
            this.file.close();
        }
        catch (e /*:IOException*/) {
            console.error(Module.DISP, "EXR - %s", e.getMessage());
            e.printStackTrace();
        }

    }

    writeRGBHeader(w:number, h:number, tileSize:number) {
        let chanOut:number[] = [
            0,
            this.channelType,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            1,
            0,
            0,
            0];
        this.file.write(ByteUtil.get4Bytes(OE_MAGIC));
        this.file.write(ByteUtil.get4Bytes((OE_EXR_VERSION | OE_TILED_FLAG)));
        this.file.write("channels".getBytes());
        this.file.write(0);
        this.file.write("chlist".getBytes());
        this.file.write(0);
        this.file.write(ByteUtil.get4Bytes(55));
        this.file.write("R".getBytes());
        this.file.write(chanOut);
        this.file.write("G".getBytes());
        this.file.write(chanOut);
        this.file.write("B".getBytes());
        this.file.write(chanOut);
        this.file.write(0);
        //  compression
        this.file.write("compression".getBytes());
        this.file.write(0);
        this.file.write("compression".getBytes());
        this.file.write(0);
        this.file.write(1);
        this.file.write(ByteUtil.get4BytesInv(this.compression));
        //  datawindow =~ image size
        this.file.write("dataWindow".getBytes());
        this.file.write(0);
        this.file.write("box2i".getBytes());
        this.file.write(0);
        this.file.write(ByteUtil.get4Bytes(16));
        this.file.write(ByteUtil.get4Bytes(0));
        this.file.write(ByteUtil.get4Bytes(0));
        this.file.write(ByteUtil.get4Bytes((w - 1)));
        this.file.write(ByteUtil.get4Bytes((h - 1)));
        //  dispwindow -> look at openexr.com for more info
        this.file.write("displayWindow".getBytes());
        this.file.write(0);
        this.file.write("box2i".getBytes());
        this.file.write(0);
        this.file.write(ByteUtil.get4Bytes(16));
        this.file.write(ByteUtil.get4Bytes(0));
        this.file.write(ByteUtil.get4Bytes(0));
        this.file.write(ByteUtil.get4Bytes((w - 1)));
        this.file.write(ByteUtil.get4Bytes((h - 1)));
        this.file.write("lineOrder".getBytes());
        this.file.write(0);
        this.file.write("lineOrder".getBytes());
        this.file.write(0);
        this.file.write(1);
        this.file.write(ByteUtil.get4BytesInv(2));
        this.file.write("pixelAspectRatio".getBytes());
        this.file.write(0);
        this.file.write("float".getBytes());
        this.file.write(0);
        this.file.write(ByteUtil.get4Bytes(4));
        this.file.write(ByteUtil.get4Bytes(Float.floatToIntBits(1)));
        //  meaningless to a flat (2D) image
        this.file.write("screenWindowCenter".getBytes());
        this.file.write(0);
        this.file.write("v2f".getBytes());
        this.file.write(0);
        this.file.write(ByteUtil.get4Bytes(8));
        this.file.write(ByteUtil.get4Bytes(Float.floatToIntBits(0)));
        this.file.write(ByteUtil.get4Bytes(Float.floatToIntBits(0)));
        //  meaningless to a flat (2D) image
        this.file.write("screenWindowWidth".getBytes());
        this.file.write(0);
        this.file.write("float".getBytes());
        this.file.write(0);
        this.file.write(ByteUtil.get4Bytes(4));
        this.file.write(ByteUtil.get4Bytes((<number>(Float.floatToIntBits(1)))));
        this.tileSize = this.tileSize;
        this.tilesX = (<number>(((w
        + (this.tileSize - 1))
        / this.tileSize)));
        this.tilesY = (<number>(((h
        + (this.tileSize - 1))
        / this.tileSize)));
        this.tmpbuf = new Array((this.tileSize
        * (this.tileSize
        * (this.channelSize * 3))));
        this.comprbuf = new Array((this.tileSize
        * (this.tileSize
        * (this.channelSize * (3 * 2)))));
        this.tileOffsets = new Array(this.tilesX);
        this.tilesY;
        this.file.write("tiles".getBytes());
        this.file.write(0);
        this.file.write("tiledesc".getBytes());
        this.file.write(0);
        this.file.write(ByteUtil.get4Bytes(9));
        this.file.write(ByteUtil.get4Bytes(this.tileSize));
        this.file.write(ByteUtil.get4Bytes(this.tileSize));
        //  ONE_LEVEL tiles, ROUNDING_MODE = not important
        this.file.write(0);
        //  an attribute with a name of 0 to end the list
        this.file.write(0);
        //  save a pointer to where the tileOffsets are stored and write dummy
        //  fillers for now
        this.tileOffsetsPosition = this.file.getFilePointer();
        this.writeTileOffsets();
    }

    writeTileOffsets() {
        this.file.seek(this.tileOffsetsPosition);
        for (let ty:number = 0; (ty < this.tilesY); ty++) {
            for (let tx:number = 0; (tx < this.tilesX); tx++) {
                this.file.write(ByteUtil.get8Bytes(this.tileOffsets[tx][ty]));
            }

        }

    }

    private writeTile(tileX:number, tileY:number, w:number, h:number, tile:Color[]) {
        let rgb:number[] = new Array(4);
        //  setting comprSize to max integer so without compression things
        //  don't go awry
        let comprSize:number = Integer.MAX_VALUE;
        let pixptr:number = 0;
        let writeSize:number = 0;
        let tileRangeX:number = (this.tileSize < w);
        // TODO:Warning!!!, inline IF is not supported ?
        let tileRangeY:number = (this.tileSize < h);
        // TODO:Warning!!!, inline IF is not supported ?
        let channelBase:number = (tileRangeX * this.channelSize);
        //  lets see if the alignment matches, you can comment this out if
        //  need be
        if (((this.tileSize != tileRangeX)
            && (tileX == 0))) {
            System.out.print(" bad X alignment ");
        }

        if (((this.tileSize != tileRangeY)
            && (tileY == 0))) {
            System.out.print(" bad Y alignment ");
        }

        this.tileOffsets[tileX][tileY] = this.file.getFilePointer();
        //  the tile header:tile's x&y coordinate, levels x&y coordinate and
        //  tilesize
        this.file.write(ByteUtil.get4Bytes(tileX));
        this.file.write(ByteUtil.get4Bytes(tileY));
        this.file.write(ByteUtil.get4Bytes(0));
        this.file.write(ByteUtil.get4Bytes(0));
        //  just in case
        Arrays.fill(this.tmpbuf, (<number>(0)));
        for (let ty:number = 0; (ty < tileRangeY); ty++) {
            for (let tx:number = 0; (tx < tileRangeX); tx++) {
                let rgbf:number[] = tile[(tx
                + (ty * tileRangeX))].getRGB();
                for (let component:number = 0; (component < 3); component++) {
                    if ((this.channelType == FLOAT)) {
                        rgb = ByteUtil.get4Bytes(Float.floatToRawIntBits(rgbf[(2 - component)]));
                        this.tmpbuf[((channelBase * component)
                        + (pixptr + 0))] = rgb[0];
                        this.tmpbuf[((channelBase * component)
                        + (pixptr + 1))] = rgb[1];
                        this.tmpbuf[((channelBase * component)
                        + (pixptr + 2))] = rgb[2];
                        this.tmpbuf[((channelBase * component)
                        + (pixptr + 3))] = rgb[3];
                    }
                    else if ((this.channelType == HALF)) {
                        rgb = ByteUtil.get2Bytes(ByteUtil.floatToHalf(rgbf[(2 - component)]));
                        this.tmpbuf[((channelBase * component)
                        + (pixptr + 0))] = rgb[0];
                        this.tmpbuf[((channelBase * component)
                        + (pixptr + 1))] = rgb[1];
                    }

                }

                pixptr = (pixptr + this.channelSize);
            }

            pixptr = (pixptr
            + (tileRangeX
            * (this.channelSize * 2)));
        }

        writeSize = (tileRangeX
        * (tileRangeY
        * (this.channelSize * 3)));
        if ((this.compression != NO_COMPRESSION)) {
            comprSize = OpenExrDisplay.compress(this.compression, this.tmpbuf, writeSize, this.comprbuf);
        }

        //  lastly, write the size of the tile and the tile itself
        //  (compressed or not)
        if ((comprSize < writeSize)) {
            this.file.write(ByteUtil.get4Bytes(comprSize));
            this.file.write(this.comprbuf, 0, comprSize);
        }
        else {
            this.file.write(ByteUtil.get4Bytes(writeSize));
            this.file.write(this.tmpbuf, 0, writeSize);
        }

    }

    private static compress(tp:number, in:number[], inSize:number, out:number[]):number {
    if ((inSize == 0)) {
    return 0;
}

let t2:number = ((inSize + 1)
/ 2);
let t1:number = 0;
let ret:number;
let inPtr:number = 0;
let tmp:number[] = new Array(inSize);
//  zip and rle treat the data first, in the same way so I'm not
//  repeating the code
if (((tp == ZIP_COMPRESSION)
    || (tp == RLE_COMPRESSION))) {
    //  reorder the pixel data ~ straight from ImfZipCompressor.cpp :)
    while (true) {
        if ((inPtr < inSize)) {
            tmp[t1++] = in[inPtr++];
        }
        else {
            break;
        }

        if ((inPtr < inSize)) {
            tmp[t2++] = in[inPtr++];
        }
        else {
            break;
        }

    }

    //  Predictor ~ straight from ImfZipCompressor.cpp :)
    t1 = 1;
    let p:number = tmp[(t1 - 1)];
    while ((t1 < inSize)) {
        let d:number = (((<number>(tmp[t1])) - p) + (128 + 256));
        p = (<number>(tmp[t1]));
        tmp[t1] = (<number>(d));
        t1++;
    }

}

//  We'll just jump from here to the wanted compress/decompress stuff if
//  need be
switch (tp) {
    case ZIP_COMPRESSION:
        let def:Deflater = new Deflater(Deflater.DEFAULT_COMPRESSION, false);
        def.setInput(tmp, 0, inSize);
        def.finish();
        ret = def.deflate(/* out */Unknown);
        return ret;
        break;
    case RLE_COMPRESSION:
        return OpenExrDisplay.rleCompress(tmp, inSize, /* out */Unknown);
        break;
    default:
        return -1;
        break;
}

}

private static rleCompress(in:number[], inLen:number, out:number[]):number {
    let outWrite:number = 0;
    let runStart:number = 0;
    let runEnd:number = 1;
    while ((runStart < inLen)) {
        while (((runEnd < inLen)
        && ((in[runStart] == in[runEnd])
        && ((runEnd
        - (runStart - 1))
        < RLE_MAX_RUN)))) {
            runEnd++;
        }

        if (((runEnd - runStart)
            >= RLE_MIN_RUN)) {
            //  Compressable run
            outWrite++;
            (<number>(((runEnd - runStart)
            - 1)));
            outWrite++;
        in[runStart];
            runStart = runEnd;
        }
        else {
            //  Uncompressable run
            while (((runEnd < inLen)
            && (((((runEnd + 1)
            >= inLen)
            || (in[runEnd] != in[(runEnd + 1)]))
            || (((runEnd + 2)
            >= inLen)
            || (in[(runEnd + 1)] != in[(runEnd + 2)])))
            && ((runEnd - runStart)
            < RLE_MAX_RUN)))) {
                runEnd++;
            }

            outWrite++;
            (<number>((runStart - runEnd)));
            while ((runStart < runEnd)) {
            }

            outWrite++;
        in[runStart++];
        }

        runEnd++;
    }

    return outWrite;
}
}