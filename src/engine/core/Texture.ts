import {Bitmap} from "../image/Bitmap";
import {Color} from "../math/Color";
import {OrthoNormalBasis} from "../math/OrthoNormalBasis";
import {Vector3} from "../math/Vector3";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Texture {

    private filename:string;
    private isLinear:boolean;
    private bitmap:Bitmap;
    private loaded:number;
    private onComplete:Function;

    constructor(filename:string, isLinear:boolean) {
        this.filename = filename;
        this.isLinear = isLinear;
        this.loaded = 0;
    }

    private load(onComplete?:Function) {
        if (this.loaded != 0) {
            return;
        }

        this.onComplete = onComplete;

        try {
            console.log("Reading texture bitmap from:" + this.filename + "...");
            var self = this;
            this.bitmap = new Bitmap().load(this.filename, this.isLinear).then(function (bitmap) {
                if (bitmap.width == 0 || bitmap.height == 0) {
                    self.bitmap = null;
                } else {
                    self.bitmap = bitmap;
                }
                if(self.onComplete){
                    self.onComplete();
                }
            }).catch(function () {
                self.bitmap = null;
            });
        }
        catch (e) {
            console.error(e);
        }

        this.loaded = 1;
    }

    /**
     * Gets the color at location (x,y) in the texture. The lookup is performed
     * using the fractional component of the coordinates, treating the texture
     * as a unit square tiled in both directions. Bicubic filtering is performed
     * on the four nearest pixels to the lookup point.
     *
     * @param x x coordinate into the texture
     * @param y y coordinate into the texture
     * @return filtered color at location (x,y)
     */
    getPixel(x:float, y:float):Color {
        if (this.bitmap == null) {
            return Color.BLACK;
        }

        x = x - Math.round(x);
        y = y - Math.round(y);
        if (x < 0) x++;
        if (y < 0) y++;

        let dx:float = x * (this.bitmap.width - 1);
        let dy:float = y * (this.bitmap.height - 1);
        let ix0:int = Math.round(dx);
        let iy0:int = Math.round(dy);
        let ix1:int = (ix0 + 1) % this.bitmap.width;
        let iy1:int = (iy0 + 1) % this.bitmap.height;
        let u:float = dx - ix0;
        let v:float = dy - iy0;

        u = u * u * (3 - (2 * u));
        v = v * v * (3 - (2 * v));
        let k00:float = (1 - u) * (1 - v);
        let c00:Color = this.bitmap.getPixel(ix0, iy0);
        let k01:float = (1 - u) * v;
        let c01:Color = this.bitmap.getPixel(ix0, iy1);
        let k10:float = u * (1 - v);
        let c10:Color = this.bitmap.getPixel(ix1, iy0);
        let k11:float = u * v;
        let c11:Color = this.bitmap.getPixel(ix1, iy1);
        let c:Color = Color.mul(k00, c00);
        c.maddScalar(k01, c01);
        c.maddScalar(k10, c10);
        c.maddScalar(k11, c11);
        return c;
    }

    getNormal(x:number, y:number, basis:OrthoNormalBasis):Vector3 {
        let rgb:float[] = this.getPixel(x, y).getRGB();
        return basis.transform(new Vector3(2 * rgb[0] - 1, 2 * rgb[1] - 1, 2 * rgb[2] - 1)).normalize();
    }

    getBump(x:number, y:number, basis:OrthoNormalBasis, scale:number):Vector3 {
        if (this.bitmap == null) {
            return basis.transform(new Vector3(0, 0, 1));
        }
        var dx:float = 1.0 / (this.bitmap.width - 1);
        var dy:float = 1.0 / (this.bitmap.height - 1);
        var b0:float = this.getPixel(x, y).getLuminance();
        var bx:float = this.getPixel(x + dx, y).getLuminance();
        var by:float = this.getPixel(x, y + dy).getLuminance();
        return basis.transform(new Vector3(scale * (bx - b0) / dx, scale * (by - b0) / dy, 1)).normalize();
    }
}