/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ViewCausticsShader implements Shader {

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        return true;
    }

    public getRadiance(state: ShadingState): Color {
        state.faceforward();
        state.initCausticSamples();
        //  integrate a diffuse function
        let lr: Color = Color.black();
        for (let sample: LightSample in state) {
            lr.madd(sample.dot(state.getNormal()), sample.getDiffuseRadiance());
        }

        return lr.mul((1 / (<number>(Math.PI))));
    }

    public scatterPhoton(state: ShadingState, power: Color) {

    }
}