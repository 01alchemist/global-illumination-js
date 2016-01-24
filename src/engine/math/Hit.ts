import {Shape} from "../scene/shapes/Shape";
import {INF} from "./Constants";
import {HitInfo} from "./HitInfo";
import {Ray} from "./Ray";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export class Hit{


    constructor(shape:Shape, T:number){

    }
    ok():boolean{
        return this.T < INF;
    }
    info(ray:Ray):HitInfo{
        let shape = this.shape;
        let position = ray.position(this.T);
        let normal = shape.getNormal(position);
        let color = shape.getColor(position);
        let material = shape.getMaterial(position);
        let inside = false;
        if(normal.dot(ray.direction) > 0){
            normal = normal.mulScalar(-1);
            inside = true;
        }
        ray = new Ray(position, normal);
        return new HitInfo(shape, position, normal, ray, color, material, inside);
    }
}
export var NoHit:Hit = new Hit(null, INF);