/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class TextureCache {

    private static textures:HashMap<string, Texture> = new HashMap<string, Texture>();

    private constructor () {

    }

    static getTexture(filename:string, isLinear:boolean):Texture {
        if (textures.containsKey(filename)) {
            UI.printInfo(Module.TEX, "Using cached copy for file \""%s\"" ...", filename);
            return textures.get(filename);
        }

        UI.printInfo(Module.TEX, "Using file \""%s\"" ...", filename);
        let t:Texture = new Texture(filename, isLinear);
        textures.put(filename, t);
        return t;
    }

    static flush() {
        UI.printInfo(Module.TEX, "Flushing texture cache");
        textures.clear();
    }
}