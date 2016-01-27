/**
 * Created by Nidin Vinayakan on 27/1/2016.
 */
export class BufferedImage {

    static TYPE_INT_RGB:string = "RGB";
    static TYPE_INT_RGBA:string = "RGBA";

    constructor(public width:number=0, public height:number=0, type:string=BufferedImage.TYPE_INT_RGB, public pixels:Uint8Array=null, public isHDR:boolean=false) {

    }

    setRGB(x:int, y:int, param3:int):void {

    }
}