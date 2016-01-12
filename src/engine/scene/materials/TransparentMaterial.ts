import {Material} from "./Material";
import {Color} from "../../math/Color";
import {NoAttenuation} from "./Attenuation";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export class TransparentMaterial extends Material{

    constructor(color:Color, index:number, gloss:number, tint:number){
        super(color, null, null, null, 1, 0, NoAttenuation, index, gloss, tint, true);
    }
}
