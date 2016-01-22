/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class NormalMapModifier implements Modifier {

    private normalMap: Texture;

    public constructor () {
        this.normalMap = null;
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        let filename: String = pl.getString("texture", null);
        if ((filename != null)) {
            this.normalMap = TextureCache.getTexture(api.resolveTextureFilename(filename), true);
        }

        return (this.normalMap != null);
    }

    public modify(state: ShadingState) {
        //  apply normal map
        state.getNormal().set(this.normalMap.getNormal(state.getUV().x, state.getUV().y, state.getBasis()));
        state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
    }
}