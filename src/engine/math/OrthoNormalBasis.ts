/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class OrthoNormalBasis {

    private u:Vector3;

    private v:Vector3;

    private w:Vector3;

    private constructor () {
        this.u = new Vector3();
        this.v = new Vector3();
        this.w = new Vector3();
    }

    flipU() {
        this.u.negate();
    }

    flipV() {
        this.v.negate();
    }

    flipW() {
        this.w.negate();
    }

    swapUV() {
        let t:Vector3 = this.u;
        this.u = this.v;
        this.v = t;
    }

    swapVW() {
        let t:Vector3 = this.v;
        this.v = this.w;
        this.w = t;
    }

    swapWU() {
        let t:Vector3 = this.w;
        this.w = this.u;
        this.u = t;
    }

    transform(a:Vector3, dest:Vector3):Vector3 {
        dest.x = ((a.x * this.u.x)
        + ((a.y * this.v.x)
        + (a.z * this.w.x)));
        dest.y = ((a.x * this.u.y)
        + ((a.y * this.v.y)
        + (a.z * this.w.y)));
        dest.z = ((a.x * this.u.z)
        + ((a.y * this.v.z)
        + (a.z * this.w.z)));
        return dest;
    }

    transform(a:Vector3):Vector3 {
        let x:number = ((a.x * this.u.x)
        + ((a.y * this.v.x)
        + (a.z * this.w.x)));
        let y:number = ((a.x * this.u.y)
        + ((a.y * this.v.y)
        + (a.z * this.w.y)));
        let z:number = ((a.x * this.u.z)
        + ((a.y * this.v.z)
        + (a.z * this.w.z)));
        return a.set(x, y, z);
    }

    untransform(a:Vector3, dest:Vector3):Vector3 {
        dest.x = Vector3.dot(a, this.u);
        dest.y = Vector3.dot(a, this.v);
        dest.z = Vector3.dot(a, this.w);
        return dest;
    }

    untransform(a:Vector3):Vector3 {
        let x:number = Vector3.dot(a, this.u);
        let y:number = Vector3.dot(a, this.v);
        let z:number = Vector3.dot(a, this.w);
        return a.set(x, y, z);
    }

    untransformX(a:Vector3):number {
        return Vector3.dot(a, this.u);
    }

    untransformY(a:Vector3):number {
        return Vector3.dot(a, this.v);
    }

    untransformZ(a:Vector3):number {
        return Vector3.dot(a, this.w);
    }

    static makeFromW(w:Vector3):OrthoNormalBasis {
        let onb:OrthoNormalBasis = new OrthoNormalBasis();
        this.w.normalize(onb.w);
        if (((Math.abs(onb.w.x) < Math.abs(onb.w.y))
            && (Math.abs(onb.w.x) < Math.abs(onb.w.z)))) {
            onb.v.x = 0;
            onb.v.y = onb.w.z;
            onb.v.z = (onb.w.y * -1);
        }
        else if ((Math.abs(onb.w.y) < Math.abs(onb.w.z))) {
            onb.v.x = onb.w.z;
            onb.v.y = 0;
            onb.v.z = (onb.w.x * -1);
        }
        else {
            onb.v.x = onb.w.y;
            onb.v.y = (onb.w.x * -1);
            onb.v.z = 0;
        }

        Vector3.cross(onb.v.normalize(), onb.w, onb.u);
        return onb;
    }

    static makeFromWV(w:Vector3, v:Vector3):OrthoNormalBasis {
        let onb:OrthoNormalBasis = new OrthoNormalBasis();
        this.w.normalize(onb.w);
        Vector3.cross(this.v, onb.w, onb.u).normalize();
        Vector3.cross(onb.w, onb.u, onb.v);
        return onb;
    }
}