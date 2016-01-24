/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Point2 {

    x:number;

    y:number;

    constructor () {

    }

    constructor (x:number, y:number) {
        this.x = this.x;
        this.y = this.y;
    }

    constructor (p:Point2) {
        this.x = p.x;
        this.y = p.y;
    }

    set(x:number, y:number):Point2 {
        this.x = this.x;
        this.y = this.y;
        return this;
    }

    set(p:Point2):Point2 {
        this.x = p.x;
        this.y = p.y;
        return this;
    }

    @Override()
    toString():string {
        return String.format("(%.2f, %.2f)", this.x, this.y);
    }
}