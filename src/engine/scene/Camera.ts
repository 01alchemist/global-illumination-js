import {Vector3} from "../math/Vector3";
import {Ray} from "../math/Ray";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export class Camera {

    constructor(p?:Vector3, u?:Vector3, v?:Vector3, w?:Vector3,
                m?:number,
                focalDistance?:number,
                apertureRadius?:number) {

    }

    static fromJson(camera:Camera):Camera {
        return new Camera(
            Vector3.fromJson(camera.p),
            Vector3.fromJson(camera.u),
            Vector3.fromJson(camera.v),
            Vector3.fromJson(camera.w),
            camera.m,
            camera.focalDistance,
            camera.apertureRadius
        );
    }

    static lookAt(eye, look, up:Vector3, fovy:number):Camera {
        var c:Camera = new Camera();
        c.p = eye;
        c.w = look.sub(eye).normalize();
        c.u = up.cross(c.w).normalize();
        c.v = c.w.cross(c.u).normalize();
        c.m = 1 / Math.tan(fovy * Math.PI / 360);
        return c
    }

    setFocus(focalPoint:Vector3, apertureRadius:number) {
        var c:Camera = this;
        c.focalDistance = focalPoint.sub(c.p).length();
        c.apertureRadius = apertureRadius
    }

    static debug:boolean = true;

    castRay(x:number, y:number, w:number, h:number, u:number, v:number):Ray {
        var c:Camera = this;
        var aspect:number = w / h;
        var px:number = ((x + u - 0.5) / (w - 1)) * 2 - 1;
        var py:number = ((y + v - 0.5) / (h - 1)) * 2 - 1;
        var d:Vector3 = new Vector3();
        d = d.add(c.u.mulScalar(-px * aspect));
        d = d.add(c.v.mulScalar(-py));
        d = d.add(c.w.mulScalar(c.m));
        d = d.normalize();
        var p = c.p;
        if (c.apertureRadius > 0) {
            var focalPoint = c.p.add(d.mulScalar(c.focalDistance));
            var angle = Math.random() * 2 * Math.PI;
            var radius = Math.random() * c.apertureRadius;
            p = p.add(c.u.mulScalar(Math.cos(angle) * radius));
            p = p.add(c.v.mulScalar(Math.sin(angle) * radius));
            d = focalPoint.sub(p).normalize()
        }
        if (Camera.debug) {
            Camera.debug = false;
            console.log("debug ray");
            return new Ray(p, new Vector3(5783340439686658, -0.01693718617190925, 0.8156242181982015));
            //expected hit 118.08336873081376 128.73575558111293
        } else {

            return new Ray(p, d);
        }
    }
}
