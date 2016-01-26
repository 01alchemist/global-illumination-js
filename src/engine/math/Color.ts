import {Vector3} from "./Vector3";
import {ByteArrayBase} from "../../pointer/ByteArrayBase";
import {DirectMemory} from "../../pointer/DirectMemory";
import {RGBSpace} from "../image/RGBSpace";
import {MathUtils} from "../utils/MathUtils";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */

export interface RGBA {
    r:number,
    g:number,
    b:number,
    a:number
}
export class Color {

    static BLACK:Color = new Color(0, 0, 0);
    static WHITE:Color = new Color(1, 1, 1);
    static RED:Color = new Color(1, 0, 0);
    static GREEN:Color = new Color(0, 1, 0);
    static BLUE:Color = new Color(0, 0, 1);
    static YELLOW:Color = new Color(1, 1, 0);
    static CYAN:Color = new Color(0, 1, 1);
    static MAGENTA:Color = new Color(1, 0, 1);
    static GRAY:Color = new Color(0.5, 0.5, 0.5);

    static EXPONENT:Float32Array = function ():Float32Array {
        var exp = new Float32Array(256);
        exp[0] = 0;
        for (var i:int = 1; i < 256; i++) {
            var f:float = 1.0;
            var e:int = i - (128 + 8);
            if (e > 0) {
                for (var j:int = 0; j < e; j++) {
                    f *= 2.0;
                }
            }
            else {
                for (var j:int = 0; j < -e; j++) {
                    f *= 0.5;
                }
            }
            exp[i] = f;
        }
        return exp;
    }();

    static SIZE:number = 3;

    constructor(public r:number = 0,
                public g:number = 0,
                public b:number = 0) {
        if (arguments.length == 1) {
            this.g = r;
            this.b = r;
        }
    }

    directWrite(mem:Float32Array, offset:number):number {
        mem[offset++] = this.r;
        mem[offset++] = this.g;
        mem[offset++] = this.b;
        return offset;
    }

    directRead(mem:Float32Array, offset:number):number {
        this.r = mem[offset++];
        this.g = mem[offset++];
        this.b = mem[offset++];
        return offset;
    }

    read(memory:ByteArrayBase|DirectMemory):number {
        this.r = memory.readFloat();
        this.g = memory.readFloat();
        this.b = memory.readFloat();
        return memory.position;
    }

    write(memory:ByteArrayBase|DirectMemory):number {
        memory.writeFloat(this.r);
        memory.writeFloat(this.g);
        memory.writeFloat(this.b);
        return memory.position;
    }

    static fromJson(color:Color):Color {
        if (color) {
            return new Color(
                color.r,
                color.g,
                color.b
            );
        } else {
            return null;
        }
    }

    static hexColor(hex:number):Color {
        var red = ((hex >> 16) & 255 ) / 255;
        var green = ((hex >> 8) & 255) / 255;
        var blue = (hex & 255) / 255;
        return new Color(red, green, blue).pow(2.2);
    }

    static newColor(c:RGBA):Color {
        return new Color(c.r / 65535, c.g / 65535, c.b / 65535);
    }

    RGBA():RGBA {
        let a:Color = this;
        let _c:Uint8Array = new Uint8Array(3);
        _c[0] = Math.max(0, Math.min(255, a.r * 255));
        _c[1] = Math.max(0, Math.min(255, a.g * 255));
        _c[2] = Math.max(0, Math.min(255, a.b * 255));
        return {r: _c[0], g: _c[1], b: _c[2], a: 255};
    }

    /* operations */
    toNonLinear():Color {
        this.r = RGBSpace.SRGB.gammaCorrect(r);
        this.g = RGBSpace.SRGB.gammaCorrect(g);
        this.b = RGBSpace.SRGB.gammaCorrect(b);
        return this;
    }

    toLinear():Color {
        this.r = RGBSpace.SRGB.ungammaCorrect(r);
        this.g = RGBSpace.SRGB.ungammaCorrect(g);
        this.b = RGBSpace.SRGB.ungammaCorrect(b);
        return this;
    }

    set(r:float, g:float, b:float):Color {
        this.r = r;
        if (arguments.length == 1) {
            if (arguments[0] instanceof Object) {
                this.r = arguments[0].r;
                this.g = arguments[0].g;
                this.b = arguments[0].b;
            } else {
                this.g = r;
                this.b = r;
            }
        } else {
            this.g = g;
            this.b = b;
        }
        return this;
    }

    setRGB(rgb:int):Color {
        this.r = ((rgb >> 16) & 0xFF) / 255;
        this.g = ((rgb >> 8) & 0xFF) / 255;
        this.b = (rgb & 0xFF) / 255;
        return this;
    }

    setRGBE(rgbe:int):Color {
        var f:float = Color.EXPONENT[rgbe & 0xFF];
        this.r = f * ((rgbe >>> 24) + 0.5);
        this.g = f * (((rgbe >> 16) & 0xFF) + 0.5);
        this.b = f * (((rgbe >> 8) & 0xFF) + 0.5);
        return this;
    }

    isBlack():boolean {
        return this.r <= 0 && this.g <= 0 && this.b <= 0;
    }

    getLuminance():float {
        return (0.2989 * this.r) + (0.5866 * this.g) + (0.1145 * this.b);
    }

    getMin():float {
        return Math.min(this.r, this.g, this.b);
    }

    getMax():float {
        return Math.max(this.r, this.g, this.b);
    }

    getAverage():float {
        return (this.r + this.g + this.b) / 3.0;
    }

    getRGB():float[] {
        return [this.r, this.g, this.b];
    }

    toRGB():int {
        var ir:int = (this.r * 255 + 0.5);
        var ig:int = (this.g * 255 + 0.5);
        var ib:int = (this.b * 255 + 0.5);
        ir = MathUtils.clamp(ir, 0, 255);
        ig = MathUtils.clamp(ig, 0, 255);
        ib = MathUtils.clamp(ib, 0, 255);
        return (ir << 16) | (ig << 8) | ib;
    }

    toRGBE():int {
        // encode the color into 32bits while preserving HDR using Ward's RGBE
        // technique
        var v:float = MathUtils.max(this.r, this.g, this.b);
        if (v < 1e-32) {
            return 0;
        }

        // get mantissa and exponent
        var m:float = v;
        var e:int = 0;
        if (v > 1.0) {
            while (m > 1.0) {
                m *= 0.5;
                e++;
            }
        } else if (v <= 0.5) {
            while (m <= 0.5) {
                m *= 2.0;
                e--;
            }
        }
        v = (m * 255.0) / v;
        var c:int = e + 128;
        c |= (this.r * v) << 24;
        c |= (this.g * v) << 16;
        c |= (this.b * v) << 8;
        return c;
    }

    constrainRGB() {
        // clamp the RGB value to a representable value
        var w:float = -Math.min(0, this.r, this.g, this.b);
        if (w > 0) {
            this.r += w;
            this.g += w;
            this.b += w;
        }
        return this;
    }

    add(b:Color):Color {
        return new Color(this.r + b.r, this.g + b.g, this.b + b.b);
    }

    madd(s:Color, c:Color):Color {
        this.r += s.r * c.r;
        this.g += s.g * c.g;
        this.b += s.b * c.b;
        return this;
    }

    sub(b:Color):Color {
        return new Color(this.r - b.r, this.g - b.g, this.b - b.b);
    }

    mul(b:Color):Color {
        return new Color(this.r * b.r, this.g * b.g, this.b * b.b);
    }

    mulScalar(b:number):Color {
        return new Color(this.r * b, this.g * b, this.b * b)
    }

    divScalar(b:number):Color {
        return new Color(this.r / b, this.g / b, this.b / b);
    }

    min(b:Color):Color {
        return new Color(Math.min(this.r, b.r), Math.min(this.g, b.g), Math.min(this.b, b.b));
    }

    max(b:Color):Color {
        return new Color(Math.max(this.r, b.r), Math.max(this.g, b.g), Math.max(this.b, b.b));
    }

    pow(b:number):Color {
        return new Color(Math.pow(this.r, b), Math.pow(this.g, b), Math.pow(this.b, b));
    }

    mix(b:Color, pct:number):Color {
        let a = this.mulScalar(1 - pct);
        b = b.mulScalar(pct);
        return a.add(b);
    }

    exp():Color {
        this.r = Math.exp(this.r);
        this.g = Math.exp(this.g);
        this.b = Math.exp(this.b);
        return this;
    }

    opposite():Color {
        this.r = 1 - this.r;
        this.g = 1 - this.g;
        this.b = 1 - this.b;
        return this;
    }

    clamp(min:float, max:float) {
        this.r = MathUtils.clamp(this.r, min, max);
        this.g = MathUtils.clamp(this.g, min, max);
        this.b = MathUtils.clamp(this.b, min, max);
        return this;
    }

    /* STATIC METHODS */

    static blend(c1:Color, c2:Color, b:Color, dest?:Color) {
        dest = dest ? dest : new Color();
        dest.r = (1.0 - b.r) * c1.r + b.r * c2.r;
        dest.g = (1.0 - b.g) * c1.g + b.g * c2.g;
        dest.b = (1.0 - b.b) * c1.b + b.b * c2.b;
        return dest;
    }

    static blendScalar(c1:Color, c2:Color, b:float, dest?:Color):Color {
        dest = dest ? dest : new Color();
        dest.r = (1.0 - b) * c1.r + b * c2.r;
        dest.g = (1.0 - b) * c1.g + b * c2.g;
        dest.b = (1.0 - b) * c1.b + b * c2.b;
        return dest;
    }

    static hasContrast(c1:Color, c2:Color, thresh:float):boolean {
        if (Math.abs(c1.r - c2.r) / (c1.r + c2.r) > thresh) {
            return true;
        }
        if (Math.abs(c1.g - c2.g) / (c1.g + c2.g) > thresh) {
            return true;
        }
        return Math.abs(c1.b - c2.b) / (c1.b + c2.b) > thresh;
    }

    clone():Color {
        return new Color(
            this.r,
            this.g,
            this.b
        );
    }

    isNaN():boolean {
        return isNaN(this.r) || isNaN(this.g) || isNaN(this.b);
    }

    isFinite():boolean {
        return isFinite(this.r) || isFinite(this.g) || isFinite(this.b);
    }

    toString() {
        return "(" + this.r + "," + this.g + "," + this.b + ")";
    }
}
