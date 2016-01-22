/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export /* sealed */ class Point2 {

    public x: number;

    public y: number;

    public constructor () {

    }

    public constructor (x: number, y: number) {
        this.x = this.x;
        this.y = this.y;
    }

    public constructor (p: Point2) {
        this.x = p.x;
        this.y = p.y;
    }

    public set(x: number, y: number): Point2 {
        this.x = this.x;
        this.y = this.y;
        return this;
    }

    public set(p: Point2): Point2 {
        this.x = p.x;
        this.y = p.y;
        return this;
    }

    @Override()
    public toString(): String {
        return String.format("(%.2f, %.2f)", this.x, this.y);
    }
}