/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class TexturedWardShader extends AnisotropicWardShader {

    private tex: Texture;

    public constructor () {
        this.tex = null;
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        let filename: String = pl.getString("texture", null);
        if ((filename != null)) {
            this.tex = TextureCache.getTexture(api.resolveTextureFilename(filename), false);
        }

        return ((this.tex != null)
        && super.update(pl, api));
    }

    @Override()
    public getDiffuse(state: ShadingState): Color {
        return this.tex.getPixel(state.getUV().x, state.getUV().y);
    }
}