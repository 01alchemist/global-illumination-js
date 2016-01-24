/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Texture {

    private filename:string;

    private isLinear:boolean;

    private bitmap:Bitmap;

    private loaded:number;

    constructor (filename:string, isLinear:boolean) {
        this.filename = this.filename;
        this.isLinear = this.isLinear;
        this.loaded = 0;
    }

    private load() {
        if ((this.loaded != 0)) {
            return;
        }

        try {
            UI.printInfo(Module.TEX, "Reading texture bitmap from:\""%s\"" ...", this.filename);
            this.bitmap = new Bitmap(this.filename, this.isLinear);
            if (((this.bitmap.getWidth() == 0)
                || (this.bitmap.getHeight() == 0))) {
                this.bitmap = null;
            }

        }
        catch (e /*:IOException*/) {
            console.error(Module.TEX, "%s", e.getMessage());
        }

        this.loaded = 1;
    }

    getBitmap():Bitmap {
        if ((this.loaded == 0)) {
            this.load();
        }

        return this.bitmap;
    }

    getPixel(x:number, y:number):Color {
        let bitmap:Bitmap = this.getBitmap();
        if ((this.bitmap == null)) {
            return Color.BLACK;
        }

        x = (x - (<number>(x)));
        y = (y - (<number>(y)));
        if ((x < 0)) {
            x++;
        }

        if ((y < 0)) {
            y++;
        }

        let dx:number = ((<number>(x))
        * (this.bitmap.getWidth() - 1));
        let dy:number = ((<number>(y))
        * (this.bitmap.getHeight() - 1));
        let ix0:number = (<number>(dx));
        let iy0:number = (<number>(dy));
        let ix1:number = ((ix0 + 1)
        % this.bitmap.getWidth());
        let iy1:number = ((iy0 + 1)
        % this.bitmap.getHeight());
        let u:number = (dx - ix0);
        let v:number = (dy - iy0);
        u = (u
        * (u * (3 - (2 * u))));
        v = (v
        * (v * (3 - (2 * v))));
        let k00:number = ((1 - u) * (1 - v));
        let c00:Color = this.bitmap.getPixel(ix0, iy0);
        let k01:number = ((1 - u)
        * v);
        let c01:Color = this.bitmap.getPixel(ix0, iy1);
        let k10:number = (u * (1 - v));
        let c10:Color = this.bitmap.getPixel(ix1, iy0);
        let k11:number = (u * v);
        let c11:Color = this.bitmap.getPixel(ix1, iy1);
        let c:Color = Color.mul(k00, c00);
        c.madd(k01, c01);
        c.madd(k10, c10);
        c.madd(k11, c11);
        return c;
    }

    getNormal(x:number, y:number, basis:OrthoNormalBasis):Vector3 {
        let rgb:number[] = this.getPixel(x, y).getRGB();
        return basis.transform(new Vector3(((2 * rgb[0])
        - 1), ((2 * rgb[1])
        - 1), ((2 * rgb[2])
        - 1))).normalize();
    }

    getBump(x:number, y:number, basis:OrthoNormalBasis, scale:number):Vector3 {
        let bitmap:Bitmap = this.getBitmap();
        if ((this.bitmap == null)) {
            return basis.transform(new Vector3(0, 0, 1));
        }

        let dx:number = (1
        / (this.bitmap.getWidth() - 1));
        let dy:number = (1
        / (this.bitmap.getHeight() - 1));
        let b0:number = this.getPixel(x, y).getLuminance();
        let bx:number = this.getPixel((x + dx), y).getLuminance();
        let by:number = this.getPixel(x, (y + dy)).getLuminance();
        return basis.transform(new Vector3((scale
        * ((bx - b0)
        / dx)), (scale
        * ((by - b0)
        / dy)), 1)).normalize();
    }
}