/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class NormalMapModifier implements Modifier {

    private normalMap:Texture;

    constructor () {
        this.normalMap = null;
    }

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        let filename:string = pl.getString("texture", null);
        if ((filename != null)) {
            this.normalMap = TextureCache.getTexture(api.resolveTextureFilename(filename), true);
        }

        return (this.normalMap != null);
    }

    modify(state:ShadingState) {
        //  apply normal map
        state.getNormal().set(this.normalMap.getNormal(state.getUV().x, state.getUV().y, state.getBasis()));
        state.setBasis(OrthoNormalBasis.makeFromW(state.getNormal()));
    }
}