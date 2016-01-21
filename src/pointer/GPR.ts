/**
 * Created by Nidin Vinayakan on 21-01-2016.
 *
 * General Purpose Register
 */

export class GPR {

    static u8:Uint8Array;
    static u8_index:number;

    static u8c:Uint8ClampedArray;
    static u8c_index:number;

    static u16:Uint16Array;
    static u16_index:number;

    static u32:Uint32Array;
    static u32_index:number;

    static i8:Int8Array;
    static i8_index:number;

    static i16:Int16Array;
    static i16_index:number;

    static i32:Int32Array;
    static i32_index:number;

    static f32:Float32Array;
    static f32_index:number;

    static f64:Float64Array;
    static f64_index:number;

    static alloc() {

    }

    static getU8():number {
        if (!GPR.u8) {
            GPR.u8 = new Uint8Array(64);
        }
        return GPR.u8_index++;
    }

    static getU8C():number {
        if (!GPR.u8c) {
            GPR.u8c = new Uint8ClampedArray(64);
        }
        return GPR.u8c_index++;
    }

    static getU16():number {
        if (!GPR.u16) {
            GPR.u16 = new Uint16Array(64);
        }
        return GPR.u16_index++;
    }

    static getU32():number {
        if (!GPR.u32) {
            GPR.u32 = new Uint32Array(64);
        }
        return GPR.u32_index++;
    }

    static getI8():number {
        if (!GPR.i8) {
            GPR.i8 = new Int8Array(64);
        }
        return GPR.i8_index++;
    }

    static getI16():number {
        if (!GPR.i16) {
            GPR.i16 = new Int16Array(64);
        }
        return GPR.i16_index++;
    }

    static getI32():number {
        if (!GPR.i32) {
            GPR.i32 = new Int32Array(64);
        }
        return GPR.i32_index++;
    }

    static getF32():number {
        if (!GPR.f32) {
            GPR.f32 = new Float32Array(64);
        }
        return GPR.f32_index++;
    }

    static getF64():number {
        if (!GPR.f64) {
            GPR.f64 = new Float64Array(64);
        }
        return GPR.f64_index++;
    }

    static getStatus():string {
        return "-------- GPR usage ------\n" +
            "U8:" + (GPR.u8_index + 1) + "\n" +
            "U8C:" + (GPR.u8c_index + 1) + "\n" +
            "U16:" + (GPR.u16_index + 1) + "\n" +
            "U32:" + (GPR.u32_index + 1) + "\n" +
            "I8:" + (GPR.i8_index + 1) + "\n" +
            "I16:" + (GPR.i16_index + 1) + "\n" +
            "I32:" + (GPR.i32_index + 1) + "\n" +
            "F32:" + (GPR.f32_index + 1) + "\n" +
            "F64:" + (GPR.f64_index + 1) + "\n";
    }
}
