import {RenderObject} from "./RenderObject";
import {CameraLens} from "./CameraLens";
import {Matrix4} from "../math/Matrix4";
import {ParameterList} from "./ParameterList";
import {GlobalIlluminationAPI} from "../GlobalIlluminatiionAPI";
import {Ray} from "./Ray";
import {Point3} from "../math/Point3";
import {OrthoNormalBasis} from "../math/OrthoNormalBasis";
import {Vector3} from "../math/Vector3";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Camera implements RenderObject {

    private lens:CameraLens;

    private c2w:Matrix4[];

    private w2c:Matrix4[];

    constructor(lens:CameraLens) {
        this.lens = lens;
        this.w2c = new Array(1);
        this.c2w = new Array(1);
        //  null
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        let n:int = pl.getInt("transform.steps", 0);
        if ((n <= 0)) {
            //  no motion blur, get regular arguments or leave unchanged
            this.updateCameraMatrix(-1, pl);
        }
        else {
            //  new motion blur settings - get transform for each step
            this.c2w = new Array(n);
            for (let i:number = 0; (i < n); i++) {
                if (!this.updateCameraMatrix(i, pl)) {
                    console.error("CAM", "Camera matrix for step " + (i + 1) + " was not specified!");
                    return false;
                }

            }

        }

        this.w2c = new Array(this.c2w.length);
        for (let i:number = 0; (i < this.c2w.length); i++) {
            if ((this.c2w[i] != null)) {
                this.w2c[i] = this.c2w[i].inverse();
                if ((this.w2c[i] == null)) {
                    console.error("CAM", "Camera matrix is not invertible");
                    return false;
                }

            }
            else {
                this.w2c[i] = null;
            }

        }

        return this.lens.update(pl, api);
    }

    private updateCameraMatrix(index:number, pl:ParameterList):boolean {
        let offset:string = (index < 0);
        // TODO:Warning!!!, inline IF is not supported ?
        if (index < 0) {
            index = 0;
        }

        let transform:Matrix4 = pl.getMatrix(String.format("transform%s", offset), null);
        if (transform == null) {
            //  no transform was specified, check eye/target/up
            let eye:Point3 = pl.getPoint(String.format("eye%s", offset), null);
            let target:Point3 = pl.getPoint(String.format("target%s", offset), null);
            let up:Vector3 = pl.getVector(String.format("up%s", offset), null);
            if (eye != null && target != null && up != null) {
                this.c2w[index] = Matrix4.fromBasis(OrthoNormalBasis.makeFromWV(Point3.sub(eye, target, new Vector3()), up));
                this.c2w[index] = Matrix4.translation(eye.x, eye.y, eye.z).multiply(this.c2w[index]);
            } else {
                //  the matrix for this index was not specified
                //  return an error, unless this is a regular update
                return (offset.length() == 0);
            }

        }
        else {
            this.c2w[index] = transform;
        }

        return true;
    }

    getRay(x:float, y:float, imageWidth:int, imageHeight:int, lensX:double, lensY:double, time:double):Ray {
        let r:Ray = this.lens.getRay(x, y, imageWidth, imageHeight, lensX, lensY, time);
        if ((r != null)) {
            if ((this.c2w.length == 1)) {
                //  regular sampling
                r = r.transform(this.c2w[0]);
            }
            else {
                //  motion blur
                let nt:double = time * (this.c2w.length - 1);
                let idx0:int = Math.round(nt);
                let idx1:int = Math.min(idx0 + 1, this.c2w.length - 1);
                r = r.transform(Matrix4.blend(this.c2w[idx0], this.c2w[idx1], <float>(nt - idx0)));
            }

            //  renormalize to account for scale factors embeded in the transform
            r.normalize();
        }

        return r;
    }

    getRay(p:Point3):Ray {
        return new Ray((this.c2w == null));
        // TODO:Warning!!!, inline IF is not supported ?
    }

    getCameraToWorld():Matrix4 {
        return (this.c2w == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    getWorldToCamera():Matrix4 {
        return (this.w2c == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }
}