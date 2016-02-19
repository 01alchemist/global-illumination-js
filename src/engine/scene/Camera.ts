import {Vector3} from "../math/Vector3";
import {Ray} from "../math/Ray";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export class Camera {

    constructor(public p?:Vector3, public u?:Vector3, public v?:Vector3, public w?:Vector3,
                public m?:number,
                public focalDistance?:number,
                public apertureRadius?:number) {

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

        return new Ray(p, d);
    }
}
