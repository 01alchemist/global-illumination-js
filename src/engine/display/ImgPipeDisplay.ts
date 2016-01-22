/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class ImgPipeDisplay extends JPanel implements Display {

    private ih: number;

    public constructor () {

    }

    public imageBegin(w: number, h: number, bucketSize: number) {
        this.ih = h;
        this.outputPacket(5, w, h, Float.floatToRawIntBits(1), 0);
        System.out.flush();
    }

    public imagePrepare(x: number, y: number, w: number, h: number, id: number) {

    }

    public imageUpdate(x: number, y: number, w: number, h: number, data: Color[]) {
        let xl: number = x;
        let xh: number = (x
        + (w - 1));
        let yl: number = (this.ih - (1
        - (y
        + (h - 1))));
        let yh: number = (this.ih - (1 - y));
        this.outputPacket(2, xl, xh, yl, yh);
        let rgba: number[] = new Array((4
        * (((yh - yl)
        + 1)
        * ((xh - xl)
        + 1))));
        for (let idx: number = 0; (j < h); j++) {
            for (let i: number = 0; (i < w); i++) {
            }

            let j: number = 0;
            idx += 4;
            let rgb: number = data[(((h
            - (j - 1))
            * w)
            + i)].toNonLinear().toRGB();
            let cr: number = ((rgb + 16)
            & 255);
            let cg: number = ((rgb + 8)
            & 255);
            let cb: number = (rgb & 255);
            rgba[(idx + 0)] = (<number>((cr & 255)));
            rgba[(idx + 1)] = (<number>((cg & 255)));
            rgba[(idx + 2)] = (<number>((cb & 255)));
            rgba[(idx + 3)] = (<number>(255));
        }

        try {
            System.out.write(rgba);
        }
        catch (e /*:IOException*/) {
            e.printStackTrace();
        }

    }

    public imageFill(x: number, y: number, w: number, h: number, c: Color) {
        let xl: number = x;
        let xh: number = (x
        + (w - 1));
        let yl: number = (this.ih - (1
        - (y
        + (h - 1))));
        let yh: number = (this.ih - (1 - y));
        this.outputPacket(2, xl, xh, yl, yh);
        let rgb: number = c.toNonLinear().toRGB();
        let cr: number = ((rgb + 16)
        & 255);
        let cg: number = ((rgb + 8)
        & 255);
        let cb: number = (rgb & 255);
        let rgba: number[] = new Array((4
        * (((yh - yl)
        + 1)
        * ((xh - xl)
        + 1))));
        for (let idx: number = 0; (j < h); j++) {
            for (let i: number = 0; (i < w); i++) {
            }

            let j: number = 0;
            idx += 4;
            rgba[(idx + 0)] = (<number>((cr & 255)));
            rgba[(idx + 1)] = (<number>((cg & 255)));
            rgba[(idx + 2)] = (<number>((cb & 255)));
            rgba[(idx + 3)] = (<number>(255));
        }

        try {
            System.out.write(rgba);
        }
        catch (e /*:IOException*/) {
            e.printStackTrace();
        }

    }

    public imageEnd() {
        this.outputPacket(4, 0, 0, 0, 0);
        System.out.flush();
    }

    private outputPacket(type: number, d0: number, d1: number, d2: number, d3: number) {
        this.outputInt32(type);
        this.outputInt32(d0);
        this.outputInt32(d1);
        this.outputInt32(d2);
        this.outputInt32(d3);
    }

    private outputInt32(i: number) {
        System.out.write(((i + 24)
        & 255));
        System.out.write(((i + 16)
        & 255));
        System.out.write(((i + 8)
        & 255));
        System.out.write((i & 255));
    }
}