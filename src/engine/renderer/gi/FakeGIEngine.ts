import {Color} from "../../math/Color";
import {Vector3} from "../../math/Vector3";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class FakeGIEngine implements GIEngine {

    private up:Vector3;

    private sky:Color;

    private ground:Color;

    constructor (options:Options) {
        this.up = options.getVector("gi.fake.up", new Vector3(0, 1, 0)).normalize();
        this.sky = options.getColor("gi.fake.sky", Color.WHITE).copy();
        this.ground = options.getColor("gi.fake.ground", Color.BLACK).copy();
        this.sky.mul((<number>(Math.PI)));
        this.ground.mul((<number>(Math.PI)));
    }

    getIrradiance(state:ShadingState, diffuseReflectance:Color):Color {
        let cosTheta:number = Vector3.dot(this.up, state.getNormal());
        let sin2:number = (1
        - (cosTheta * cosTheta));
        let sine:number = (sin2 > 0);
        // TODO:Warning!!!, inline IF is not supported ?
        if ((cosTheta > 0)) {
            return Color.blend(this.sky, this.ground, sine);
        }
        else {
            return Color.blend(this.ground, this.sky, sine);
        }

    }

    getGlobalRadiance(state:ShadingState):Color {
        return Color.BLACK;
    }

    init(scene:Scene):boolean {
        return true;
    }
}