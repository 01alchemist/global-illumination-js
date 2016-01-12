import {Color} from "../../math/Color";
import {Texture} from "./Texture";
import {Attenuation} from "./Attenuation";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export enum MaterialType{
    GENERIC,
    DIFFUSE,
    SPECULAR,
    CLEAR,
    GLOSSY,
    EMISSIVE
}
export class Material {

    type:MaterialType = MaterialType.GENERIC;

    /**
     *
     * @param color
     * @param texture
     * @param normalTexture
     * @param bumpTexture
     * @param bumpMultiplier
     * @param emittance
     * @param attenuation
     * @param index -> refractive index
     * @param gloss -> reflection cone angle in radians
     * @param tint -> specular and refractive tinting
     * @param transparent
     */
    constructor(public color?:Color,
                public texture?:Texture,
                public normalTexture?:Texture,
                public bumpTexture?:Texture,
                public bumpMultiplier?:number,
                public emittance?:number,
                public attenuation?:Attenuation,
                public index?:number,
                public gloss?:number,
                public tint?:number,
                public transparent?:boolean) {

    }
}
