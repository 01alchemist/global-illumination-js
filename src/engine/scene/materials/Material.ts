import {Color} from "../../math/Color";
import {Texture} from "./Texture";
import {Attenuation} from "./Attenuation";
import {NoAttenuation} from "./Attenuation";
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

    static SIZE:number = Color.SIZE + Attenuation.SIZE + 6;
    static map:Array<Material> = [];

    type:MaterialType = MaterialType.GENERIC;
    materialIndex:number;

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
    constructor(public color:Color = new Color(),
                public texture?:Texture,
                public normalTexture?:Texture,
                public bumpTexture?:Texture,
                public bumpMultiplier?:number,
                public emittance?:number,
                public attenuation:Attenuation=NoAttenuation,
                public index?:number,
                public gloss?:number,
                public tint?:number,
                public transparent?:boolean) {
        this.materialIndex = Material.map.push(this) - 1;
    }

    clone():Material {
        var material = new Material(
            this.color.clone(),
            this.texture,
            this.normalTexture,
            this.bumpTexture,
            this.bumpMultiplier,
            this.emittance,
            this.attenuation.clone(),
            this.index,
            this.gloss,
            this.tint,
            this.transparent
        );
        material.type = this.type;
        return material;
    }

    read(memory:Float32Array, offset:number):number {
        offset = this.color.read(memory, offset);
        this.bumpMultiplier = memory[offset++];
        this.emittance = memory[offset++];
        offset = this.attenuation.read(memory, offset);
        this.index = memory[offset++];
        this.gloss = memory[offset++];
        this.tint = memory[offset++];
        this.transparent = memory[offset++] == 1;
        return offset;
    }

    writeToMemory(memory:Float32Array, offset:number):number {
        offset = this.color.writeToMemory(memory, offset);
        memory[offset++] = this.bumpMultiplier;
        memory[offset++] = this.emittance;
        offset = this.attenuation.writeToMemory(memory, offset);
        memory[offset++] = this.index;
        memory[offset++] = this.gloss;
        memory[offset++] = this.tint;
        memory[offset++] = this.transparent ? 1 : 0;
        return offset;
    }

    /* static stuff */
    static get estimatedMemory():number {
        return Material.SIZE * Material.map.length + 1;
    };

    static writeToMemory(memory:Float32Array, offset:number):number {
        memory[offset++] = Material.map.length;
        Material.map.forEach(function (material:Material) {
            offset = material.writeToMemory(memory, offset);
        });
        return offset;
    }

    static restore(memory:Float32Array, offset:number = 0):number {
        var numMaterials:number = memory[offset++];
        for (var i = 0; i < numMaterials; i++) {
            offset = new Material().read(memory, offset);
        }
        return offset;
    }
}
