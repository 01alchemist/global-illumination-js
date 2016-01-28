import {Texture} from "../scene/materials/Texture";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class TextureCache {

    private static textures:Map<string, Texture> = new Map<string, Texture>();

    private constructor () {

    }

    static getTexture(filename:string, isLinear:boolean):Texture {
        if (TextureCache.textures.containsKey(filename)) {
            console.log("Using cached copy for file "+filename+" ...");
            return TextureCache.textures.get(filename);
        }
        console.log("Using file "+filename+" ...");
        let t:Texture = new Texture(filename, isLinear);
        TextureCache.textures.set(filename, t);
        return t;
    }

    static flush() {
        console.log("Flushing texture cache");
        TextureCache.textures.clear();
    }
}