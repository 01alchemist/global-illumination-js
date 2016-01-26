/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class TexturedAmbientOcclusionShader extends AmbientOcclusionShader {

    private tex:Texture;

    constructor () {
        this.tex = null;
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        let filename:string = pl.getString("texture", null);
        if ((filename != null)) {
            this.tex = TextureCache.getTexture(api.resolveTextureFilename(filename), false);
        }

        return ((this.tex != null)
        && super.update(pl, api));
    }

    @Override()
    getBrightColor(state:ShadingState):Color {
        return this.tex.getPixel(state.getUV().x, state.getUV().y);
    }
}