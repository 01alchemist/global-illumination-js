/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class BumpMappingModifier implements Modifier {

    private bumpTexture: Texture;

    private scale: number;

    public constructor () {
        this.bumpTexture = null;
        this.scale = 1;
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        let filename: String = pl.getString("texture", null);
        if ((filename != null)) {
            this.bumpTexture = TextureCache.getTexture(api.resolveTextureFilename(filename), true);
        }

        this.scale = pl.getFloat("scale", this.scale);
        return (this.bumpTexture != null);
    }

    public modify(state: ShadingState) {
        //  apply bump
        state.getNormal().set(this.bumpTexture.getBump(state.getUV().x, state.getUV().y, state.getBasis(), this.scale));
        state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
    }
}