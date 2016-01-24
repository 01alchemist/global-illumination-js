import {CameraLens} from "./../core/CameraLens";
import {Ray} from "../math/Ray";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class ThinLens implements CameraLens {

    private au:float;

    private av:float;

    private aspect:float;

    private fov:float;

    private focusDistance:float;

    private lensRadius:float;

    private lensSides:int;

    private lensRotation:float;

    private lensRotationRadians:float;

    constructor() {
        this.focusDistance = 1;
        this.lensRadius = 0;
        this.fov = 90;
        this.aspect = 1;
        this.lensSides = 0;
        //  < 3 means use circular lens
        this.lensRotationRadians = 0;
        this.lensRotation = 0;
        //  this rotates polygonal lenses
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        //  get parameters
        this.fov = pl.getFloat("fov", this.fov);
        this.aspect = pl.getFloat("aspect", this.aspect);
        this.focusDistance = pl.getFloat("focus.distance", this.focusDistance);
        this.lensRadius = pl.getFloat("lens.radius", this.lensRadius);
        this.lensSides = pl.getInt("lens.sides", this.lensSides);
        this.lensRotation = pl.getFloat("lens.rotation", this.lensRotation);
        this.update();
        return true;
    }

    private update() {
        this.au = ((<float>(Math.tan(Math.toRadians((this.fov * 0.5))))) * this.focusDistance);
        this.av = (this.au / this.aspect);
        this.lensRotationRadians = (<float>(Math.toRadians(this.lensRotation)));
    }

    getRay(x:float, y:float, imageWidth:int, imageHeight:int, lensX:double, lensY:double, time:double):Ray {
        let du:float = ((this.au * -1)
        + ((2
        * (this.au * x))
        / (imageWidth - 1)));
        let dv:float = ((this.av * -1)
        + ((2
        * (this.av * y))
        / (imageHeight - 1)));
        let eyeY:float;
        let eyeX:float;
        if ((this.lensSides < 3)) {
            let r:float;
            let angle:float;
            //  concentric map sampling
            let r1:float = ((2 * lensX)
            - 1);
            let r2:float = ((2 * lensY)
            - 1);
            if ((r1
                > (r2 * -1))) {
                if ((r1 > r2)) {
                    r = r1;
                    angle = (0.25
                    * (Math.PI
                    * (r2 / r1)));
                }
                else {
                    r = r2;
                    angle = (0.25
                    * (Math.PI * (2
                    - (r1 / r2))));
                }

            }
            else if ((r1 < r2)) {
                r = (r1 * -1);
                angle = (0.25
                * (Math.PI * (4
                + (r2 / r1))));
            }
            else {
                r = (r2 * -1);
                if ((r2 != 0)) {
                    angle = (0.25
                    * (Math.PI * (6
                    - (r1 / r2))));
                }
                else {
                    angle = 0;
                }

            }

            r = (r * this.lensRadius);
            //  point on the lens
            eyeX = (<float>((Math.cos(angle) * r)));
            eyeY = (<float>((Math.sin(angle) * r)));
        }
        else {
            //  sample N-gon
            //  FIXME:this could use concentric sampling
            lensY = (lensY * this.lensSides);
            let side:float = (<int>(lensY));
            let offs:float = ((<float>(lensY)) - side);
            let dist:float = (<float>(Math.sqrt(lensX)));
            let a0:float = (<float>(((side
            * (Math.PI * (2 / this.lensSides)))
            + this.lensRotationRadians)));
            let a1:float = (<float>((((side + 1)
            * (Math.PI * (2 / this.lensSides)))
            + this.lensRotationRadians)));
            eyeX = (<float>((((Math.cos(a0) * (1 - offs))
            + (Math.cos(a1) * offs))
            * dist)));
            eyeY = (<float>((((Math.sin(a0) * (1 - offs))
            + (Math.sin(a1) * offs))
            * dist)));
            eyeX = (eyeX * this.lensRadius);
            eyeY = (eyeY * this.lensRadius);
        }

        let eyeZ:float = 0;
        //  point on the image plane
        let dirX:float = du;
        let dirY:float = dv;
        let dirZ:float = (this.focusDistance * -1);
        //  ray
        return new Ray(eyeX, eyeY, eyeZ, (dirX - eyeX), (dirY - eyeY), (dirZ - eyeZ));
    }
}