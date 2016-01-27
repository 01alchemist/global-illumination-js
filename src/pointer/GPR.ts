/**
 * Created by Nidin Vinayakan on 21-01-2016.
 *
 * General Purpose Memory
 */

export class GPM {

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
        if (!GPM.u8) {
            GPM.u8 = new Uint8Array(64);
        }
        return GPM.u8_index++;
    }

    static getU8C():number {
        if (!GPM.u8c) {
            GPM.u8c = new Uint8ClampedArray(64);
        }
        return GPM.u8c_index++;
    }

    static getU16():number {
        if (!GPM.u16) {
            GPM.u16 = new Uint16Array(64);
        }
        return GPM.u16_index++;
    }

    static getU32():number {
        if (!GPM.u32) {
            GPM.u32 = new Uint32Array(64);
        }
        return GPM.u32_index++;
    }

    static getI8():number {
        if (!GPM.i8) {
            GPM.i8 = new Int8Array(64);
        }
        return GPM.i8_index++;
    }

    static getI16():number {
        if (!GPM.i16) {
            GPM.i16 = new Int16Array(64);
        }
        return GPM.i16_index++;
    }

    static getI32():number {
        if (!GPM.i32) {
            GPM.i32 = new Int32Array(64);
        }
        return GPM.i32_index++;
    }

    static getF32():number {
        if (!GPM.f32) {
            GPM.f32 = new Float32Array(64);
        }
        return GPM.f32_index++;
    }

    static getF64():number {
        if (!GPM.f64) {
            GPM.f64 = new Float64Array(64);
        }
        return GPM.f64_index++;
    }

    static getStatus():string {
        return "-------- GPM usage ------\n" +
            "U8:" + (GPM.u8_index + 1) + "\n" +
            "U8C:" + (GPM.u8c_index + 1) + "\n" +
            "U16:" + (GPM.u16_index + 1) + "\n" +
            "U32:" + (GPM.u32_index + 1) + "\n" +
            "I8:" + (GPM.i8_index + 1) + "\n" +
            "I16:" + (GPM.i16_index + 1) + "\n" +
            "I32:" + (GPM.i32_index + 1) + "\n" +
            "F32:" + (GPM.f32_index + 1) + "\n" +
            "F64:" + (GPM.f64_index + 1) + "\n";
    }
}
