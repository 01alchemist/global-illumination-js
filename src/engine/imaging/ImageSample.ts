import {Color} from "../math/Color";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class ImageSample {

    rx:float;
    ry:float;
    i:int;
    n:int;
    c:Color;
    instance:Instance;
    shader:Shader;
    nx:float;
    ny:float;
    nz:float;

    constructor(rx:float, ry:float, i:int) {
        this.rx = rx;
        this.ry = ry;
        this.i = i;
        this.n = 0;
        this.c = null;
        this.instance = null;
        this.shader = null;
        this.nx = this.ny = this.nz = 1;
    }

    set(state:ShadingState) {
        if (state == null)
            this.c = Color.BLACK;
        else {
            this.c = state.getResult();
            checkNanInf();
            shader = state.getShader();
            instance = state.getInstance();
            if (state.getNormal() != null) {
                nx = state.getNormal().x;
                ny = state.getNormal().y;
                nz = state.getNormal().z;
            }
        }
        n = 1;
    }

    add(state:ShadingState) {
        if (n == 0)
            this.c = Color.black();
        if (state != null) {
            this.c.add(state.getResult());
            checkNanInf();
        }
        n++;
    }

    checkNanInf() {
        if (this.c.isNaN())
            console.log("NaN shading sample!");
        else if (c.isFinite())
            console.log("Inf shading sample!");

    }

    scale(s:float) {
        c.mul(s);
    }

    processed():boolean {
        return c != null;
    }

    sampled():boolean {
        return n > 0;
    }

    isDifferent(sample:ImageSample, thresh:float):boolean {
        if (instance != sample.instance)
            return true;
        if (shader != sample.shader)
            return true;
        if (Color.hasContrast(c, sample.c, thresh))
            return true;
        // only compare normals if this pixel has not been averaged
        var dot:float = (nx * sample.nx + ny * sample.ny + nz * sample.nz);
        return dot < 0.9;
    }

    static bilerp(result:ImageSample, i00:ImageSample, i01:ImageSample, i10:ImageSample, i11:ImageSample, dx:float, dy:float) {
        var k00:float = (1.0 - dx) * (1.0 - dy);
        var k01:float = (1.0 - dx) * dy;
        var k10:float = dx * (1.0 - dy);
        var k11:float = dx * dy;
        var c00:Color = i00.c;
        var c01:Color = i01.c;
        var c10:Color = i10.c;
        var c11:Color = i11.c;
        var c:Color = c00.mulScalar(k00);
        c.madd(k01, c01);
        c.madd(k10, c10);
        c.madd(k11, c11);
        result.c = c;
        return result;
    }
}