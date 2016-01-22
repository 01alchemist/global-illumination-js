/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export /* sealed */ class TextureCache {

    private static textures: HashMap<String, Texture> = new HashMap<String, Texture>();

    private constructor () {

    }

    public static getTexture(filename: String, isLinear: boolean): Texture {
        if (textures.containsKey(filename)) {
            UI.printInfo(Module.TEX, "Using cached copy for file \""%s\"" ...", filename);
            return textures.get(filename);
        }

        UI.printInfo(Module.TEX, "Using file \""%s\"" ...", filename);
        let t: Texture = new Texture(filename, isLinear);
        textures.put(filename, t);
        return t;
    }

    public static flush() {
        UI.printInfo(Module.TEX, "Flushing texture cache");
        textures.clear();
    }
}