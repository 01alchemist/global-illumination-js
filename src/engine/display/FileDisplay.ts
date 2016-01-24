/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class FileDisplay implements Display {

    private bitmap:Bitmap;

    private filename:string;

    constructor (saveImage:boolean) {
        //  a constructor that allows the image to not be saved
        //  usefull for benchmarking purposes
        this.bitmap = null;
        this.filename = saveImage;
        // TODO:Warning!!!, inline IF is not supported ?
    }

    constructor (filename:string) {
        this.bitmap = null;
        this.filename = (this.filename == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    imageBegin(w:number, h:number, bucketSize:number) {
        if (((this.bitmap == null)
            || ((this.bitmap.getWidth() != w)
            || (this.bitmap.getHeight() != h)))) {
            this.bitmap = new Bitmap(w, h, ((this.filename == null)
            || this.filename.endsWith(".hdr")));
        }

    }

    imagePrepare(x:number, y:number, w:number, h:number, id:number) {

    }

    imageUpdate(x:number, y:number, w:number, h:number, data:Color[]) {
        for (let index:number = 0; (j < h); j++) {
            for (let i:number = 0; (i < w); i++) {
                this.bitmap.setPixel((x + i), (this.bitmap.getHeight() - (1
                - (y + j))), data[index]);
            }

        }

        let j:number = 0;
    }

    imageFill(x:number, y:number, w:number, h:number, c:Color) {
        let cg:Color = c;
        for (let j:number = 0; (j < h); j++) {
            for (let i:number = 0; (i < w); i++) {
                this.bitmap.setPixel((x + i), (this.bitmap.getHeight() - (1
                - (y + j))), cg);
            }

        }

    }

    imageEnd() {
        if ((this.filename != null)) {
            this.bitmap.save(this.filename);
        }

    }
}