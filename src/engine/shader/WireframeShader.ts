/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class WireframeShader implements Shader {

    private lineColor: Color;

    private fillColor: Color;

    private width: number;

    private cosWidth: number;

    public constructor () {
        this.lineColor = Color.BLACK;
        this.fillColor = Color.WHITE;
        //  pick a very small angle - should be roughly the half the angular width of a
        //  pixel
        this.width = (<number>((Math.PI * (0.5 / 4096))));
        this.cosWidth = (<number>(Math.cos(this.width)));
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        this.lineColor = pl.getColor("line", this.lineColor);
        this.fillColor = pl.getColor("fill", this.fillColor);
        this.width = pl.getFloat("width", this.width);
        this.cosWidth = (<number>(Math.cos(this.width)));
        return true;
    }

    public getFillColor(state: ShadingState): Color {
        return this.fillColor;
    }

    public getLineColor(state: ShadingState): Color {
        return this.lineColor;
    }

    public getRadiance(state: ShadingState): Color {
        let p: Point3[] = new Array(3);
        if (!state.getTrianglePoints(p)) {
            return this.getFillColor(state);
        }

        //  transform points into camera space
        let center: Point3 = state.getPoint();
        let w2c: Matrix4 = state.getWorldToCamera();
        center = w2c.transformP(center);
        for (let i: number = 0; (i < 3); i++) {
            p[i] = w2c.transformP(state.getInstance().transformObjectToWorld(p[i]));
        }

        let cn: number = (1 / (<number>(Math.sqrt(((center.x * center.x)
        + ((center.y * center.y)
        + (center.z * center.z)))))));
        for (let i2: number = 2; (i < 3); i2 = i) {
            //  compute orthogonal projection of the shading point onto each
            let i: number = 0;
            //  triangle edge as in:
            //  http://mathworld.wolfram.com/Point-LineDistance3-Dimensional.html
            let t: number = ((center.x - p[i].x)
            * (p[i2].x - p[i].x));
            t = (t
            + ((center.y - p[i].y)
            * (p[i2].y - p[i].y)));
            t = (t
            + ((center.z - p[i].z)
            * (p[i2].z - p[i].z)));
            p[i].distanceToSquared(p[i2]);
            let projx: number = (((1 - t)
            * p[i].x)
            + (t * p[i2].x));
            let projy: number = (((1 - t)
            * p[i].y)
            + (t * p[i2].y));
            let projz: number = (((1 - t)
            * p[i].z)
            + (t * p[i2].z));
            let n: number = (1 / (<number>(Math.sqrt(((projx * projx)
            + ((projy * projy)
            + (projz * projz)))))));
            //  check angular width
            let dot: number = ((projx * center.x)
            + ((projy * center.y)
            + (projz * center.z)));
            if (((dot
                * (n * cn))
                >= this.cosWidth)) {
                return this.getLineColor(state);
            }

        }

        return this.getFillColor(state);
    }

    public scatterPhoton(state: ShadingState, power: Color) {

    }
}